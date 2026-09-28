import { gateway, transcribe } from "ai";
import { hasAiGateway, models } from "@/lib/config";
import { normalizeLanguage } from "@/lib/languages";

export const maxDuration = 30;

const MAX_AUDIO_BYTES = 10 * 1024 * 1024;

/** Speech-to-text for the mic button in the web app. The audio is not stored. */
export async function POST(req: Request) {
  if (!hasAiGateway()) {
    return Response.json({ error: "Costa is not configured yet: set AI_GATEWAY_API_KEY." }, { status: 503 });
  }
  const form = await req.formData().catch(() => null);
  const audio = form?.get("audio");
  if (!(audio instanceof Blob) || audio.size === 0) {
    return Response.json({ error: "missing-audio" }, { status: 400 });
  }
  if (audio.size > MAX_AUDIO_BYTES) {
    return Response.json({ error: "too-large" }, { status: 413 });
  }
  try {
    const result = await transcribe({
      model: gateway.transcriptionModel(models.transcription),
      audio: new Uint8Array(await audio.arrayBuffer()),
    });
    return Response.json({ text: result.text.trim(), language: normalizeLanguage(result.language) });
  } catch (error) {
    console.error("[transcribe] failed", error);
    return Response.json({ error: "transcription-failed" }, { status: 502 });
  }
}
