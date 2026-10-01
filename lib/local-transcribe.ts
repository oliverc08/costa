"use client";

import type { LanguageCode } from "@/lib/languages";

type AsrResult = { text?: string };
type AsrPipeline = (
  audio: Float32Array,
  options?: { language?: string; task?: string },
) => Promise<AsrResult>;

const WHISPER_LANG: Record<LanguageCode, string> = {
  en: "english",
  es: "spanish",
  zh: "chinese",
  tl: "tagalog",
  vi: "vietnamese",
};

let pipelinePromise: Promise<AsrPipeline> | null = null;

/** Downsample/upsample mono PCM to 16 kHz for Whisper. */
export function resampleMono(input: Float32Array, fromRate: number, toRate = 16_000): Float32Array {
  if (fromRate === toRate) return input.slice();
  const ratio = fromRate / toRate;
  const length = Math.max(1, Math.round(input.length / ratio));
  const out = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    out[i] = input[Math.min(input.length - 1, Math.floor(i * ratio))] ?? 0;
  }
  return out;
}

export function mergePcmChunks(chunks: Float32Array[]): Float32Array {
  const total = chunks.reduce((n, c) => n + c.length, 0);
  const out = new Float32Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

function toMono16k(buffer: AudioBuffer): Float32Array {
  return resampleMono(buffer.getChannelData(0), buffer.sampleRate, 16_000);
}

async function getPipeline(): Promise<AsrPipeline> {
  if (!pipelinePromise) {
    pipelinePromise = (async () => {
      const { pipeline, env } = await import("@huggingface/transformers");
      // Prefer CDN + browser cache; never touch the Next.js server filesystem.
      env.allowLocalModels = false;
      env.useBrowserCache = true;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- pipeline generics explode TS
      const pipe = await (pipeline as any)("automatic-speech-recognition", "Xenova/whisper-tiny", {
        dtype: "q8",
      });
      return pipe as AsrPipeline;
    })();
  }
  return pipelinePromise;
}

async function runWhisper(audio: Float32Array, lang: LanguageCode): Promise<string | null> {
  if (audio.length < 1600) return null; // <100ms — almost certainly silence
  const transcriber = await getPipeline();
  const result = await transcriber(audio, {
    language: WHISPER_LANG[lang],
    task: "transcribe",
  });
  const text = result.text?.replace(/\s+/g, " ").trim() ?? "";
  return text || null;
}

/** On-device Whisper from raw mic PCM (preferred — avoids MediaRecorder codec issues). */
export async function transcribePcmLocally(pcm: Float32Array, sampleRate: number, lang: LanguageCode): Promise<string | null> {
  return runWhisper(resampleMono(pcm, sampleRate, 16_000), lang);
}

/** On-device Whisper from a recorded Blob (MediaRecorder fallback). */
export async function transcribeLocally(blob: Blob, lang: LanguageCode): Promise<string | null> {
  if (blob.size === 0) return null;
  const ctx = new AudioContext();
  try {
    const decoded = await ctx.decodeAudioData(await blob.arrayBuffer());
    return runWhisper(toMono16k(decoded), lang);
  } finally {
    await ctx.close().catch(() => undefined);
  }
}
