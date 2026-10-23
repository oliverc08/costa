import { isLanguageCode } from "@/lib/languages";
import { analyzeLetterFromText } from "@/lib/letter-from-text";
import { redact } from "@/lib/safety/redact";

export const maxDuration = 30;

/** Redacts private OCR fields again at the server boundary as a defense in depth. */
export function redactLetterOcrText(input: string): string {
  let text = redact(input).text;
  text = text.replace(
    /(^|\b)(case\s*(?:number|no\.?|#|id)|client\s*(?:number|no\.?|#|id)|member\s*(?:number|no\.?|#|id)|recipient\s*(?:number|no\.?|#|id)|benefit\s*(?:number|no\.?|#|id)|account\s*(?:number|no\.?|#|id)|application\s*(?:number|no\.?|#|id)|household\s*(?:number|no\.?|#|id)|subscriber\s*(?:number|no\.?|#|id)|Medi[- ]Cal\s*(?:number|no\.?|#|id)|Medicaid\s*(?:number|no\.?|#|id))\s*[:#-]?\s*([A-Z0-9-]*\d[A-Z0-9-]*(?:\s+[A-Z0-9-]*\d[A-Z0-9-]*)?)/gi,
    (_match, prefix: string, label: string) => `${prefix}${label} [REDACTED]`,
  );
  text = text.replace(
    /(\b(?:date\s+of\s+birth|birth\s+date|DOB)\s*[:#-]?\s*)(?:\d{1,2}[/.\-]\d{1,2}[/.\-]\d{2,4}|\d{4}[/.\-]\d{1,2}[/.\-]\d{1,2}|[A-Z][a-z]+\s+\d{1,2},?\s+\d{4})/gi,
    "$1[REDACTED]",
  );
  text = text.replace(
    /(^|\n)([ \t]*(?:(?:recipient|client|applicant|beneficiary|member|patient|parent|guardian)\s+)?name\s*[:#-]\s*)[^\r\n]*/gim,
    "$1$2[REDACTED]",
  );
  text = text.replace(
    /(^|\n)([ \t]*(?:(?:mailing|home|residential)\s+)?address\s*[:#-]\s*)[^\r\n]*/gim,
    "$1$2[REDACTED]",
  );
  return text.replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, "[REDACTED]");
}

/** Explains a letter from on-device OCR text using local rules and sources. */
export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { text?: unknown; language?: unknown } | null;
  const rawText = typeof body?.text === "string" ? body.text.trim() : "";
  const text = redactLetterOcrText(rawText);
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
