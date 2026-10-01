import { normalizeLanguage } from "@/lib/languages";

export const maxDuration = 30;

/**
 * Cloud transcription is disabled — Costa uses browser speech or on-device Whisper
 * (`lib/local-transcribe.ts`). Kept as a 503 stub so older clients fail clearly.
 */
export async function POST() {
  return Response.json(
    {
      error: "use-local-speech",
      message: "Costa transcribes on-device. Use browser speech recognition or the built-in Whisper fallback.",
      language: normalizeLanguage("en"),
    },
    { status: 503 },
  );
}
