import { hasAiGateway } from "@/lib/config";
import { isLanguageCode } from "@/lib/languages";
import { analyzeLetter, LETTER_MEDIA_TYPES, MAX_LETTER_BYTES } from "@/lib/letters";

export const maxDuration = 60;

/** Explains an uploaded letter photo. The image is processed in memory and never stored. */
export async function POST(req: Request) {
  if (!hasAiGateway()) {
    return Response.json({ error: "not-configured" }, { status: 503 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const language = form.get("language");
  if (!(file instanceof File)) return Response.json({ error: "missing-file" }, { status: 400 });
  if (file.size > MAX_LETTER_BYTES) return Response.json({ error: "too-large" }, { status: 413 });
  const mediaType = file.type.toLowerCase();
  if (!(LETTER_MEDIA_TYPES as readonly string[]).includes(mediaType)) {
    return Response.json({ error: "unsupported-type" }, { status: 415 });
  }

  try {
    const result = await analyzeLetter({
      data: new Uint8Array(await file.arrayBuffer()),
      mediaType,
      language: isLanguageCode(language) ? language : "en",
    });
    return Response.json(result);
  } catch (error) {
    console.error("[letter] analysis failed", error);
    return Response.json({ error: "analysis-failed" }, { status: 502 });
  }
}
