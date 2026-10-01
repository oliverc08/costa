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
  ko: ["ko"],
  pt: ["pt"],
};

/** Preferred locales within each language family. */
const VOICE_LOCALE: Record<LanguageCode, string[]> = {
  en: ["en-us", "en_us"],
  es: ["es-us", "es_us", "es-mx", "es_mx", "es-es", "es_es"],
  zh: ["zh-cn", "zh_cn", "zh-hans", "cmn-hans"],
  tl: ["fil-ph", "fil_ph", "tl-ph", "tl_ph"],
  vi: ["vi-vn", "vi_vn"],
  ko: ["ko-kr", "ko_kr"],
  pt: ["pt-br", "pt_br", "pt-pt", "pt_pt"],
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
  ko: "ko-KR",
  pt: "pt-BR",
};

type SpeechRec = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((e: { resultIndex: number; results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }> }) => void) | null;
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

function hasPcmCapture(): boolean {
  if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) return false;
  return !!(window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext);
}

/**
 * Apple WebKit (iPhone/iPad/Safari). SpeechRecognition needs special settings;
 * speechSynthesis often breaks the next recognition session.
 */
export function isAppleWebKit(
  ua: string,
  touchPoints = 0,
  platform = "",
): boolean {
  if (/iPhone|iPad|iPod/i.test(ua)) return true;
  if (platform === "MacIntel" && touchPoints > 1) return true;
  if (/Safari/i.test(ua) && !/Chrome|Chromium|Edg|OPR|CriOS|FxiOS/i.test(ua)) return true;
  return false;
}

/** Firefox has no usable SpeechRecognition — cloud recording only. */
export function mustUseCloudStt(ua: string): boolean {
  return /Firefox/i.test(ua);
}

export function browserSttAvailable(): boolean {
  if (typeof window === "undefined" || !speechRecCtor()) return false;
  return !mustUseCloudStt(navigator.userAgent);
}

function preferredRecorderMime(): string | undefined {
  const apple = isAppleWebKit(navigator.userAgent, navigator.maxTouchPoints ?? 0, navigator.platform ?? "");
  const candidates = apple
    ? ["audio/mp4", "audio/aac", "audio/webm;codecs=opus", "audio/webm"]
    : ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"];
  return candidates.find((m) => MediaRecorder.isTypeSupported(m));
}

function recorderFilename(mime: string) {
  if (mime.includes("mp4") || mime.includes("aac") || mime.includes("m4a")) return "question.m4a";
  if (mime.includes("ogg")) return "question.ogg";
  return "question.webm";
}

let micPrimed = false;

async function acquireMicStream(): Promise<MediaStream | null> {
  if (!navigator.mediaDevices?.getUserMedia) return null;
  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 },
    });
  } catch {
    return null;
  }
}

/** Brief permission prompt used once on non-Apple browsers. */
async function primeMicPermission() {
  if (micPrimed) return;
  const stream = await acquireMicStream();
  if (!stream) return;
  stream.getTracks().forEach((t) => t.stop());
  micPrimed = true;
}

/** Prefer free Web Speech; fall back to MediaRecorder (+ cloud or on-device Whisper). */
export function shouldFallbackToCloudStt(_ua: string, errorCode: string): boolean {
  return errorCode === "network" || errorCode === "audio-capture";
}

/** Score higher = warmer / clearer built-in voice for care navigation. */
export function scoreVoice(voice: SpeechSynthesisVoice, lang: LanguageCode): number {
  const name = voice.name.toLowerCase();
  const tag = voice.lang.toLowerCase().replace(/_/g, "-");
  const prefixes = VOICE_PREFIX[lang];
  if (!prefixes.some((p) => tag.startsWith(p))) return -1000;

  let score = 0;
  if (VOICE_LOCALE[lang].some((l) => tag.startsWith(l.replace(/_/g, "-")))) score += 12;
  if (voice.default) score += 4;
  if (voice.localService) score += 3;

  if (/neural|natural|enhanced|premium|super|online|wavenet|studio|siri/.test(name)) score += 28;
  if (/google|microsoft/.test(name)) score += 18;
  // Known warmer defaults across Apple / Google / Microsoft
  if (
    /samantha|karen|moira|allison|ava|susan|zoe|aria|jenny|sonia|nora|emma|serena|salli|joanna|ivy|kimberly|kendra|amy/.test(
      name,
    )
  ) {
    score += 22;
  }
  if (/monica|paulina|sabina|lupe|paloma|dalia|elena|elvira/.test(name)) score += 20;
  if (/ting-ting|meijia|li-mu|xiaoxiao|xiaoyi|yunxi|yunyang|huihui/.test(name)) score += 20;
  if (/linh|hoai|nam|minh/.test(name)) score += 16;

  if (/compact|eloquence|novelty|whisper|bad news|good news|bells|organ|zarvox|trinoids|boing|bubbles|cellos|deranged|hysterical|pipe organ|ralph|junior|albert|bahh|boing|cellos|fred|jester|organ|princess|ralph|reed|rocko|shelley|superstar|wcs/.test(name)) {
    score -= 60;
  }
  // Flat/robotic legacy often ranked first otherwise
  if (/^microsoft .+ desktop$/.test(name) || /desktop/.test(name)) score -= 8;

  return score;
}

export function pickVoice(lang: LanguageCode, voices?: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const list = voices ?? (typeof window !== "undefined" ? (window.speechSynthesis?.getVoices() ?? []) : []);
  if (!list.length) return null;
  let best: SpeechSynthesisVoice | null = null;
  let bestScore = -Infinity;
  for (const v of list) {
    const s = scoreVoice(v, lang);
    if (s > bestScore) {
      bestScore = s;
      best = v;
    }
  }
  return bestScore > -500 ? best : null;
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
      u.rate = 0.92;
      u.pitch = 1.05;
      u.onend = u.onerror = () => setSpeakingId((cur) => (cur === id ? null : cur));
      setSpeakingId(id);
      synth.speak(u);
    },
    [lang],
  );

  return { available, speakingId, speak, stop };
}

export type RecorderState = "idle" | "recording" | "loading-model" | "transcribing" | "error" | "blocked" | "unavailable";

const MAX_RECORDING_MS = 60_000;

/**
 * Mic input for Ask. Prefers free browser speech recognition (no API key).
 * Falls back to recording + /api/transcribe (Whisper via AI Gateway) when the
 * browser has no SpeechRecognition, or when recognition fails with a network error.
 */
export function useVoiceInput(lang: LanguageCode, onText: (text: string) => void) {
  const [state, setState] = useState<RecorderState>("idle");
  const [partial, setPartial] = useState("");
  const recorder = useRef<MediaRecorder | null>(null);
  const recognition = useRef<SpeechRec | null>(null);
  const sessionStream = useRef<MediaStream | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelled = useRef(false);
  const wantStop = useRef(false);
  const finalized = useRef(false);
  const onTextRef = useRef(onText);

  useEffect(() => {
    onTextRef.current = onText;
  }, [onText]);

  const supported = useSyncExternalStore(
    noopSubscribe,
    () => hasBrowserSpeech() || hasPcmCapture() || hasMediaRecorder(),
    () => false,
  );

  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const releaseSessionStream = () => {
    sessionStream.current?.getTracks().forEach((t) => t.stop());
    sessionStream.current = null;
  };

  const pcmChunks = useRef<Float32Array[]>([]);
  const pcmCtx = useRef<AudioContext | null>(null);
  const pcmNodes = useRef<{ source: MediaStreamAudioSourceNode; processor: ScriptProcessorNode; mute: GainNode } | null>(null);

  const stopPcmCapture = () => {
    const nodes = pcmNodes.current;
    if (nodes) {
      try {
        nodes.processor.disconnect();
        nodes.source.disconnect();
        nodes.mute.disconnect();
      } catch {
        /* ignore */
      }
      pcmNodes.current = null;
    }
    if (pcmCtx.current) {
      void pcmCtx.current.close().catch(() => undefined);
      pcmCtx.current = null;
    }
  };

  const finishPcm = useCallback(async () => {
    const chunks = pcmChunks.current;
    const sampleRate = pcmCtx.current?.sampleRate ?? 48_000;
    stopPcmCapture();
    releaseSessionStream();
    clearTimer();
    pcmChunks.current = [];
    if (cancelled.current) return setState("idle");
    if (!chunks.length) return setState("error");
    try {
      setState("loading-model");
      const { mergePcmChunks, transcribePcmLocally } = await import("@/lib/local-transcribe");
      setState("transcribing");
      const pcm = mergePcmChunks(chunks);
      const text = await transcribePcmLocally(pcm, sampleRate, lang);
      if (cancelled.current) return setState("idle");
      if (text) {
        setState("idle");
        onTextRef.current(text);
        return;
      }
      setState("error");
    } catch (error) {
      console.error("[voice] pcm whisper failed", error);
      setState("error");
    }
  }, [lang]);

  const finishCloud = useCallback(async (blob: Blob) => {
    if (cancelled.current) return setState("idle");
    if (blob.size === 0) return setState("error");
    setState("transcribing");
    const body = new FormData();
    body.append("audio", blob, recorderFilename(blob.type || "audio/webm"));
    const res = await fetch("/api/transcribe", { method: "POST", body }).catch(() => null);
    if (res?.ok) {
      const data = (await res.json().catch(() => null)) as { text?: string } | null;
      if (data?.text?.trim()) {
        setState("idle");
        onTextRef.current(data.text.trim());
        return;
      }
    }
    // Gateway billing / missing key → decode blob with on-device Whisper.
    if (res?.status === 503 || !res?.ok) {
      try {
        setState("loading-model");
        const { transcribeLocally } = await import("@/lib/local-transcribe");
        setState("transcribing");
        const text = await transcribeLocally(blob, lang);
        if (cancelled.current) return setState("idle");
        if (text) {
          setState("idle");
          onTextRef.current(text);
          return;
        }
      } catch (error) {
        console.error("[voice] local whisper failed", error);
      }
      return setState(res?.status === 503 ? "unavailable" : "error");
    }
    setState("error");
  }, [lang]);

  const startCloud = useCallback(async () => {
    cancelled.current = false;
    finalized.current = false;
    setState("recording");
    let stream = sessionStream.current;
    if (!stream) {
      const acquired = await acquireMicStream();
      if (!acquired) return setState("blocked");
      stream = acquired;
      sessionStream.current = acquired;
    }
    if (wantStop.current) {
      releaseSessionStream();
      return setState("idle");
    }
    if (!hasMediaRecorder()) {
      releaseSessionStream();
      return setState("unavailable");
    }
    const mime = preferredRecorderMime();
    const r = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
    const chunks: Blob[] = [];
    r.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    r.onstop = () => {
      releaseSessionStream();
      clearTimer();
      void finishCloud(new Blob(chunks, { type: r.mimeType || mime || "audio/webm" }));
    };
    recorder.current = r;
    try {
      r.start(250);
    } catch {
      r.start();
    }
    if (wantStop.current) {
      try {
        r.requestData?.();
      } catch {
        /* ignore */
      }
      r.stop();
      return;
    }
    timer.current = setTimeout(() => {
      if (r.state === "recording") {
        try {
          r.requestData?.();
        } catch {
          /* ignore */
        }
        r.stop();
      }
    }, MAX_RECORDING_MS);
  }, [finishCloud]);

  /** Capture raw PCM for on-device Whisper — avoids iOS MediaRecorder codec / decode failures. */
  const startPcm = useCallback(async () => {
    cancelled.current = false;
    finalized.current = false;
    pcmChunks.current = [];
    setState("recording");
    let stream = sessionStream.current;
    if (!stream) {
      const acquired = await acquireMicStream();
      if (!acquired) return setState("blocked");
      stream = acquired;
      sessionStream.current = acquired;
    }
    if (wantStop.current) {
      releaseSessionStream();
      return setState("idle");
    }
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) {
      if (hasMediaRecorder()) return startCloud();
      releaseSessionStream();
      return setState("unavailable");
    }
    const ctx = new AudioCtx();
    pcmCtx.current = ctx;
    try {
      if (ctx.state === "suspended") await ctx.resume();
    } catch {
      /* ignore */
    }
    const source = ctx.createMediaStreamSource(stream);
    const processor = ctx.createScriptProcessor(4096, 1, 1);
    const mute = ctx.createGain();
    mute.gain.value = 0;
    processor.onaudioprocess = (event) => {
      pcmChunks.current.push(new Float32Array(event.inputBuffer.getChannelData(0)));
    };
    source.connect(processor);
    processor.connect(mute);
    mute.connect(ctx.destination);
    pcmNodes.current = { source, processor, mute };
    if (wantStop.current) {
      void finishPcm();
      return;
    }
    timer.current = setTimeout(() => {
      void finishPcm();
    }, MAX_RECORDING_MS);
  }, [finishPcm, startCloud]);

  const startBrowser = useCallback(() => {
    const Ctor = speechRecCtor();
    if (!Ctor) return false;
    cancelled.current = false;
    finalized.current = false;
    const ua = navigator.userAgent;
    const apple = isAppleWebKit(ua, navigator.maxTouchPoints ?? 0, navigator.platform ?? "");
    const rec = new Ctor();
    rec.lang = BROWSER_STT[lang] ?? LANGUAGES[lang].speechCode;
    // Apple: one-shot recognition auto-finalizes; continuous mode often hangs.
    rec.continuous = !apple;
    rec.interimResults = true;
    rec.maxAlternatives = 1;

    let finals = "";
    let interim = "";

    const finishWithText = (text: string) => {
      finalized.current = true;
      setPartial("");
      setState("idle");
      releaseSessionStream();
      onTextRef.current(text);
    };

    rec.onresult = (e) => {
      let nextInterim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const row = e.results[i];
        const text = row?.[0]?.transcript ?? "";
        if (row.isFinal) finals += `${text} `;
        else nextInterim += text;
      }
      interim = nextInterim;
      const live = `${finals} ${interim}`.replace(/\s+/g, " ").trim();
      if (live) setPartial(live);
      // One-shot Apple sessions: deliver as soon as we have a final chunk.
      if (apple && finals.trim()) {
        const textOut = finals.replace(/\s+/g, " ").trim();
        try {
          rec.stop();
        } catch {
          /* ignore */
        }
        finishWithText(textOut);
      }
    };

    rec.onerror = (e) => {
      if (cancelled.current) return;
      if (e.error === "aborted") {
        if (!finalized.current) {
          releaseSessionStream();
          setState("idle");
        }
        return;
      }
      if (e.error === "no-speech") {
        releaseSessionStream();
        setState(wantStop.current || apple ? "error" : "idle");
        return;
      }
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        releaseSessionStream();
        setState("blocked");
        return;
      }
      // Network / service failures → on-device Whisper via PCM (skips Gateway billing).
      if (shouldFallbackToCloudStt(ua, e.error) && hasPcmCapture()) {
        finalized.current = true;
        recognition.current = null;
        void startPcm();
        return;
      }
      releaseSessionStream();
      setState("error");
    };

    rec.onend = () => {
      recognition.current = null;
      clearTimer();
      if (finalized.current) return;
      const text = `${finals} ${interim}`.replace(/\s+/g, " ").trim();
      if (!cancelled.current && text) {
        finishWithText(text);
        return;
      }
      if (!cancelled.current) {
        releaseSessionStream();
        setState(wantStop.current || apple ? "error" : "idle");
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
    if (wantStop.current) {
      try {
        rec.stop();
      } catch {
        /* ignore */
      }
      return true;
    }
    timer.current = setTimeout(() => {
      try {
        recognition.current?.stop();
      } catch {
        /* already stopped */
      }
    }, MAX_RECORDING_MS);
    return true;
  }, [lang, startPcm]);

  const start = useCallback(async () => {
    wantStop.current = false;
    cancelled.current = false;
    setPartial("");
    // TTS can steal the audio session on iOS and break the next capture.
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* ignore */
    }
    setState("recording");

    const apple = isAppleWebKit(navigator.userAgent, navigator.maxTouchPoints ?? 0, navigator.platform ?? "");
    if (browserSttAvailable()) {
      if (apple) {
        // Keep the mic stream open for the whole recognition session — WebKit
        // often drops SpeechRecognition when the audio session is released.
        const stream = await acquireMicStream();
        if (!stream) return setState("blocked");
        sessionStream.current = stream;
        micPrimed = true;
      } else {
        await primeMicPermission();
      }
      if (wantStop.current) {
        releaseSessionStream();
        return setState("idle");
      }
      if (startBrowser()) return;
      releaseSessionStream();
    }
    if (hasPcmCapture()) {
      await startPcm();
      return;
    }
    if (hasMediaRecorder()) {
      await startCloud();
      return;
    }
    setState("unavailable");
  }, [startBrowser, startPcm, startCloud]);

  const stop = useCallback(() => {
    wantStop.current = true;
    if (recognition.current) {
      try {
        recognition.current.stop();
      } catch {
        /* ignore */
      }
      return;
    }
    if (pcmNodes.current) {
      void finishPcm();
      return;
    }
    if (recorder.current?.state === "recording") {
      try {
        recorder.current.requestData?.();
      } catch {
        /* ignore */
      }
      recorder.current.stop();
    }
  }, [finishPcm]);

  const cancel = useCallback(() => {
    cancelled.current = true;
    wantStop.current = true;
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
    if (pcmNodes.current) {
      stopPcmCapture();
      pcmChunks.current = [];
      releaseSessionStream();
    } else if (recorder.current?.state === "recording") {
      recorder.current.stop();
    } else {
      releaseSessionStream();
    }
    setPartial("");
    setState("idle");
  }, []);

  useEffect(() => () => cancel(), [cancel]);

  return { supported, state, partial, start, stop, cancel, reset: () => setState("idle") };
}
