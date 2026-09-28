"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { LanguageCode } from "@/lib/languages";

const noopSubscribe = () => () => {};

const VOICE_PREFIX: Record<LanguageCode, string[]> = {
  en: ["en"],
  es: ["es"],
  zh: ["zh", "cmn"],
  tl: ["fil", "tl"],
  vi: ["vi"],
};

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

/** Records a short voice question and returns the text from /api/transcribe. */
export function useVoiceInput(onText: (text: string) => void) {
  const [state, setState] = useState<RecorderState>("idle");
  const recorder = useRef<MediaRecorder | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelled = useRef(false);

  const supported = useSyncExternalStore(
    noopSubscribe,
    () => typeof window.MediaRecorder !== "undefined" && !!navigator.mediaDevices?.getUserMedia,
    () => false,
  );

  const finish = useCallback(
    async (blob: Blob) => {
      if (cancelled.current || blob.size === 0) return setState("idle");
      setState("transcribing");
      const body = new FormData();
      body.append("audio", blob, blob.type.includes("mp4") ? "question.mp4" : "question.webm");
      const res = await fetch("/api/transcribe", { method: "POST", body }).catch(() => null);
      if (res?.status === 503) return setState("unavailable");
      const data = (await res?.json().catch(() => null)) as { text?: string } | null;
      if (!res?.ok || !data?.text) return setState("error");
      setState("idle");
      onText(data.text);
    },
    [onText],
  );

  const start = useCallback(async () => {
    cancelled.current = false;
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      return setState("blocked");
    }
    const mime = ["audio/webm;codecs=opus", "audio/mp4", "audio/webm"].find((m) => MediaRecorder.isTypeSupported(m));
    const r = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    const chunks: Blob[] = [];
    r.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    r.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      if (timer.current) clearTimeout(timer.current);
      void finish(new Blob(chunks, { type: r.mimeType || "audio/webm" }));
    };
    recorder.current = r;
    r.start();
    setState("recording");
    timer.current = setTimeout(() => r.state === "recording" && r.stop(), MAX_RECORDING_MS);
  }, [finish]);

  const stop = useCallback(() => {
    if (recorder.current?.state === "recording") recorder.current.stop();
  }, []);

  const cancel = useCallback(() => {
    cancelled.current = true;
    stop();
    setState("idle");
  }, [stop]);

  useEffect(() => () => cancel(), [cancel]);

  return { supported, state, start, stop, cancel, reset: () => setState("idle") };
}
