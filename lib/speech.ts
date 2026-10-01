"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { LANGUAGES, type LanguageCode } from "@/lib/languages";

const noopSubscribe = () => () => {};

const VOICE_PREFIX: Record<LanguageCode, string[]> = {
  en: ["en"],
  es: ["es"],
  zh: ["zh", "cmn"],
  tl: ["fil", "tl"],
  vi: ["vi"],
};

/**
 * BCP-47 tags that Chrome/Safari SpeechRecognition understand.
 * (Twilio phone STT still uses LANGUAGES.*.speechCode, which differs for Chinese.)
 */
export const BROWSER_STT: Record<LanguageCode, string> = {
  en: "en-US",
  es: "es-US",
  zh: "zh-CN",
  tl: "fil-PH",
  vi: "vi-VN",
};

type SpeechRec = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: { results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecCtor = new () => SpeechRec;

function speechRecCtor(): SpeechRecCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & { SpeechRecognition?: SpeechRecCtor; webkitSpeechRecognition?: SpeechRecCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function hasBrowserSpeech(): boolean {
  return speechRecCtor() !== null;
}

function hasMediaRecorder(): boolean {
  return typeof window !== "undefined" && typeof window.MediaRecorder !== "undefined" && !!navigator.mediaDevices?.getUserMedia;
}

function pickVoice(lang: LanguageCode): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  const prefixes = VOICE_PREFIX[lang];
  const matches = voices.filter((v) => prefixes.some((p) => v.lang.toLowerCase().startsWith(p)));
  return matches.find((v) => /US|CN|PH|VN/i.test(v.lang)) ?? matches[0] ?? null;
}

/** Spoken form: drop links and turn list markers into pauses. */
function speakable(text: string) {
  return text
    .replace(/https?:\/\/\S+/g, "")
    .replace(/^\s*(\d+\.|[-•*])\s+/gm, "")
    .replace(/\n+/g, ". ");
}

/**
 * Read-aloud with the phone's built-in voices, for people who find reading hard.
 * `available` is false when the device has no voice for the language (Tagalog often).
 */
export function useReadAloud(lang: LanguageCode) {
  const [available, setAvailable] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    const check = () => setAvailable(pickVoice(lang) !== null);
    check();
    synth.addEventListener("voiceschanged", check);
    return () => {
      synth.removeEventListener("voiceschanged", check);
      synth.cancel();
    };
  }, [lang]);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setSpeakingId(null);
  }, []);

  const speak = useCallback(
    (id: string, text: string) => {
      const synth = window.speechSynthesis;
      const voice = pickVoice(lang);
      if (!synth || !voice) return;
      synth.cancel();
      const u = new SpeechSynthesisUtterance(speakable(text));
      u.voice = voice;
      u.lang = voice.lang;
      u.rate = 0.95;
      u.onend = u.onerror = () => setSpeakingId((cur) => (cur === id ? null : cur));
      setSpeakingId(id);
      synth.speak(u);
    },
    [lang],
  );

  return { available, speakingId, speak, stop };
}

export type RecorderState = "idle" | "recording" | "transcribing" | "error" | "blocked" | "unavailable";

const MAX_RECORDING_MS = 60_000;

/**
 * Mic input for Ask. Prefers free browser speech recognition (no API key).
 * Falls back to recording + /api/transcribe (Whisper via AI Gateway) when the
 * browser has no SpeechRecognition, or when recognition fails with a network error.
 */
export function useVoiceInput(lang: LanguageCode, onText: (text: string) => void) {
  const [state, setState] = useState<RecorderState>("idle");
  const recorder = useRef<MediaRecorder | null>(null);
  const recognition = useRef<SpeechRec | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelled = useRef(false);
  const finalized = useRef(false);
  const onTextRef = useRef(onText);

  useEffect(() => {
    onTextRef.current = onText;
  }, [onText]);

  const supported = useSyncExternalStore(
    noopSubscribe,
    () => hasBrowserSpeech() || hasMediaRecorder(),
    () => false,
  );

  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const finishCloud = useCallback(async (blob: Blob) => {
    if (cancelled.current || blob.size === 0) return setState("idle");
    setState("transcribing");
    const body = new FormData();
    body.append("audio", blob, blob.type.includes("mp4") ? "question.mp4" : "question.webm");
    const res = await fetch("/api/transcribe", { method: "POST", body }).catch(() => null);
    if (res?.status === 503) return setState("unavailable");
    const data = (await res?.json().catch(() => null)) as { text?: string } | null;
    if (!res?.ok || !data?.text) return setState("error");
    setState("idle");
    onTextRef.current(data.text);
  }, []);

  const startCloud = useCallback(async () => {
    cancelled.current = false;
    finalized.current = false;
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      return setState("blocked");
    }
    if (!hasMediaRecorder()) {
      stream.getTracks().forEach((t) => t.stop());
      return setState("unavailable");
    }
    const mime = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm"].find((m) => MediaRecorder.isTypeSupported(m));
    const r = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    const chunks: Blob[] = [];
    r.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    r.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      clearTimer();
      void finishCloud(new Blob(chunks, { type: r.mimeType || "audio/webm" }));
    };
    recorder.current = r;
    r.start();
    setState("recording");
    timer.current = setTimeout(() => r.state === "recording" && r.stop(), MAX_RECORDING_MS);
  }, [finishCloud]);

  const startBrowser = useCallback(() => {
    const Ctor = speechRecCtor();
    if (!Ctor) return false;
    cancelled.current = false;
    finalized.current = false;
    const rec = new Ctor();
    rec.lang = BROWSER_STT[lang] ?? LANGUAGES[lang].speechCode;
    rec.continuous = false;
    rec.interimResults = false;
    rec.maxAlternatives = 1;

    rec.onresult = (e) => {
      const last = e.results[e.results.length - 1];
      const text = last?.[0]?.transcript?.trim() ?? "";
      if (!text || !last?.isFinal) return;
      finalized.current = true;
      setState("idle");
      onTextRef.current(text);
    };

    rec.onerror = (e) => {
      if (cancelled.current) return;
      if (e.error === "aborted" || e.error === "no-speech") {
        setState("idle");
        return;
      }
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setState("blocked");
        return;
      }
      // Chrome often needs network for recognition; if that fails, try Whisper.
      if (e.error === "network" && hasMediaRecorder()) {
        finalized.current = true;
        recognition.current = null;
        void startCloud();
        return;
      }
      setState("error");
    };

    rec.onend = () => {
      recognition.current = null;
      clearTimer();
      if (!cancelled.current && !finalized.current) {
        setState((cur) => (cur === "recording" ? "idle" : cur));
      }
    };

    recognition.current = rec;
    try {
      rec.start();
    } catch {
      recognition.current = null;
      return false;
    }
    setState("recording");
    timer.current = setTimeout(() => {
      try {
        recognition.current?.stop();
      } catch {
        /* already stopped */
      }
    }, MAX_RECORDING_MS);
    return true;
  }, [lang, startCloud]);

  const start = useCallback(async () => {
    if (hasBrowserSpeech()) {
      if (startBrowser()) return;
    }
    await startCloud();
  }, [startBrowser, startCloud]);

  const stop = useCallback(() => {
    if (recognition.current) {
      try {
        recognition.current.stop();
      } catch {
        /* ignore */
      }
      return;
    }
    if (recorder.current?.state === "recording") recorder.current.stop();
  }, []);

  const cancel = useCallback(() => {
    cancelled.current = true;
    clearTimer();
    if (recognition.current) {
      try {
        recognition.current.abort();
      } catch {
        try {
          recognition.current.stop();
        } catch {
          /* ignore */
        }
      }
      recognition.current = null;
    }
    if (recorder.current?.state === "recording") recorder.current.stop();
    setState("idle");
  }, []);

  useEffect(() => () => cancel(), [cancel]);

  return { supported, state, start, stop, cancel, reset: () => setState("idle") };
}
