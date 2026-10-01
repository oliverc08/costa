import { hasLocalLlm } from "@/lib/config";
import { isLanguageCode } from "@/lib/languages";
import { analyzeLetter, LETTER_MEDIA_TYPES, MAX_LETTER_BYTES } from "@/lib/letters";

export const maxDuration = 60;

function sniffMediaType(file: File): string {
  const typed = file.type.toLowerCase();
  if (typed) return typed;
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) return "application/pdf";
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".webp")) return "image/webp";
  if (name.endsWith(".gif")) return "image/gif";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  return "";
}

/**
 * Optional local-LLM vision path. The web UI prefers on-device OCR → /api/letter-text.
 * Returns 503 unless COSTA_LOCAL_LLM_URL is set (small local models via Ollama).
 */
export async function POST(req: Request) {
  if (!hasLocalLlm()) {
    return Response.json({ error: "not-configured", hint: "Use on-device OCR or set COSTA_LOCAL_LLM_URL" }, { status: 503 });
  }

  const form = await req.formData().catch(() => null);
  if (!form) return Response.json({ error: "missing-file" }, { status: 400 });
  const file = form.get("file");
  const language = form.get("language");
  if (!(file instanceof File)) return Response.json({ error: "missing-file" }, { status: 400 });
  if (file.size > MAX_LETTER_BYTES) return Response.json({ error: "too-large" }, { status: 413 });
  const mediaType = sniffMediaType(file);
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
    console.error("[letter] local vision failed", error);
    return Response.json({ error: "analysis-failed" }, { status: 502 });
  }
}
