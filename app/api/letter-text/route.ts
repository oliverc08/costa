import { isLanguageCode } from "@/lib/languages";
import { analyzeLetterFromText } from "@/lib/letter-from-text";

export const maxDuration = 30;

/** Explains a letter from client-side OCR text when vision AI Gateway is unavailable. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { text?: unknown; language?: unknown } | null;
  const text = typeof body?.text === "string" ? body.text.trim() : "";
  if (text.length < 20) return Response.json({ error: "missing-text" }, { status: 400 });
  if (text.length > 20_000) return Response.json({ error: "too-large" }, { status: 413 });

  try {
    const result = await analyzeLetterFromText({
      text,
      language: isLanguageCode(body?.language) ? body.language : "en",
    });
    return Response.json(result);
  } catch (error) {
    console.error("[letter-text] analysis failed", error);
    return Response.json({ error: "analysis-failed" }, { status: 502 });
  }
}
