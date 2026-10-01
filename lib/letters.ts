import { generateText, Output } from "ai";
import { z } from "zod";
import { models } from "@/lib/config";
import { searchBenefits, type SearchHit } from "@/lib/knowledge/search";
import { LANGUAGES, isTranslatedUiLang, type LanguageCode, type TranslatedUiLang } from "@/lib/languages";
import { redact } from "@/lib/safety/redact";

export const MAX_LETTER_BYTES = 8 * 1024 * 1024;
export const LETTER_MEDIA_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"] as const;

export const letterExtractionSchema = z.object({
  isBenefitsLetter: z.boolean().describe("True if this is a letter or form from a government benefits agency."),
  readable: z.boolean().describe("False if the image is too blurry, dark, or cut off to read."),
  agency: z.string().nullable().describe("Agency or county office that sent it."),
  program: z.enum(["medi-cal", "calfresh", "wic", "caleitc", "disaster", "other", "unknown"]),
  noticeType: z.enum([
    "renewal",
    "request-for-information",
    "approval",
    "denial",
    "discontinuance",
    "change-in-benefits",
    "appointment",
    "overpayment",
    "other",
  ]),
  formNumber: z.string().nullable().describe("Form code printed on the page, such as MC 216 or MC 355."),
  deadline: z.string().nullable().describe("Due date or effective date the reader must act by, as YYYY-MM-DD. Null if none is printed."),
  deadlineMeaning: z.string().nullable().describe("What the date is for, e.g. 'return the renewal form' or 'coverage ends'."),
  requestedAction: z.string().describe("In English, one sentence: what the letter asks the reader to do. 'None' if nothing."),
  documentsRequested: z.array(z.string()).describe("Proof or documents requested, in English. Empty if none."),
  contactPhone: z.string().nullable().describe("Phone number printed on the letter for questions."),
  hearingRightsMentioned: z.boolean().describe("True if the letter explains the right to a State Hearing or appeal."),
  keyFacts: z.array(z.string()).max(5).describe("Up to 5 short facts in English. No names, addresses, ID numbers, or birth dates."),
});

export type LetterExtraction = z.infer<typeof letterExtractionSchema>;

const explanationSchema = z.object({
  whatThisMeans: z.string().describe("2-3 short sentences in plain language."),
  whatToDo: z.array(z.string()).min(1).max(4).describe("Concrete steps, most important first."),
  deadline: z.string().nullable().describe("The deadline in plain words with the date, or null."),
  needHelp: z.string().describe("One sentence on where to get help (phone from the letter or sources)."),
  uncertainty: z.string().nullable().describe("What you are unsure about, or null if the letter was clear."),
});

export type LetterExplanation = z.infer<typeof explanationSchema>;

export interface LetterSource {
  sourceId: string;
  title: string;
  agency: string;
  url: string;
  lastVerified: string;
}

export interface LetterAnalysis {
  ok: true;
  language: LanguageCode;
  extraction: LetterExtraction;
  explanation: LetterExplanation;
  daysUntilDeadline: number | null;
  sources: LetterSource[];
}

export type LetterResult = LetterAnalysis | { ok: false; reason: "unreadable" | "not-a-letter" };

const EXTRACTION_PROMPT = `You read photos of mail from California benefits agencies (county social services, DHCS Medi-Cal, CalFresh, WIC, FTB, FEMA) and extract structured facts.
Rules:
- Only report what is printed. If something is not on the page, use null or "unknown". Never guess a deadline.
- Never copy names, street addresses, Social Security numbers, case numbers, Medi-Cal ID (BIC/CIN) numbers, or birth dates.
- The letter may be in English, Spanish, Chinese, Tagalog, or Vietnamese; always answer in English.`;

/** Whole days from today (Pacific time) until an ISO date; negative if it has passed. */
export function daysUntil(isoDate: string | null, now = new Date()): number | null {
  if (!isoDate || !/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return null;
  const today = new Date(now.toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" }));
  const target = new Date(isoDate);
  if (Number.isNaN(target.getTime())) return null;
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

function scrub(e: LetterExtraction): LetterExtraction {
  const r = (s: string) => redact(s).text;
  return {
    ...e,
    agency: e.agency && r(e.agency),
    requestedAction: r(e.requestedAction),
    documentsRequested: e.documentsRequested.map(r),
    keyFacts: e.keyFacts.map(r),
    deadlineMeaning: e.deadlineMeaning && r(e.deadlineMeaning),
  };
}

function sourceQuery(e: LetterExtraction): string {
  const parts = [e.program === "unknown" || e.program === "other" ? "" : e.program, e.noticeType.replace(/-/g, " ")];
  if (e.formNumber) parts.push(e.formNumber);
  if (e.noticeType === "denial" || e.noticeType === "discontinuance") parts.push("state hearing appeal");
  if (e.noticeType === "renewal") parts.push("renewal form due date");
  if (e.noticeType === "request-for-information") parts.push("send documents proof");
  return parts.filter(Boolean).join(" ");
}

export async function analyzeLetter(opts: {
  data: Uint8Array;
  mediaType: string;
  language: LanguageCode;
}): Promise<LetterResult> {
  const { output: raw } = await generateText({
    model: models.vision,
    instructions: EXTRACTION_PROMPT,
    output: Output.object({ schema: letterExtractionSchema }),
    temperature: 0,
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Extract the facts from this letter." },
          { type: "file", mediaType: opts.mediaType, data: opts.data },
        ],
      },
    ],
  });

  if (!raw.readable) return { ok: false, reason: "unreadable" };
  if (!raw.isBenefitsLetter) return { ok: false, reason: "not-a-letter" };
  const extraction = scrub(raw);

  const program = ["medi-cal", "calfresh", "wic", "caleitc", "disaster"].includes(extraction.program)
    ? (extraction.program as SearchHit["program"])
    : undefined;
  const search = await searchBenefits({ query: sourceQuery(extraction), program });
  const days = daysUntil(extraction.deadline);
  const lang = LANGUAGES[opts.language];

  const { output: explanation } = await generateText({
    model: models.chat,
    instructions: `You explain benefits letters to people with limited English. Write ONLY in ${lang.name} (${lang.native}), at a 5th-grade reading level. Keep official program and form names in English in parentheses the first time.
Use only the extracted letter facts and the verified sources below. If they disagree or something is missing, say so in "uncertainty". Never say the person qualifies or will lose benefits for sure; the agency decides. Never invent phone numbers: use the letter's number or one from the sources.
If there is a denial or discontinuance, mention the right to ask for a State Hearing within 90 days.`,
    output: Output.object({ schema: explanationSchema }),
    temperature: 0.2,
    prompt: JSON.stringify({
      today: new Date().toLocaleDateString("en-CA", { timeZone: "America/Los_Angeles" }),
      daysUntilDeadline: days,
      letter: extraction,
      verifiedSources: search.results.map((h) => ({
        title: h.title,
        agency: h.agency,
        heading: h.heading,
        excerpt: h.excerpt,
        nextAction: h.nextAction,
      })),
      sourceGuidance: search.guidance,
    }),
  });

  const seen = new Set<string>();
  const sources = search.results
    .filter((h) => !seen.has(h.sourceId) && seen.add(h.sourceId))
    .map((h) => ({ sourceId: h.sourceId, title: h.title, agency: h.agency, url: h.url, lastVerified: h.lastVerified }));

  return { ok: true, language: opts.language, extraction, explanation, daysUntilDeadline: days, sources };
}

const SMS_LABELS: Record<TranslatedUiLang, { means: string; todo: string; deadline: string; help: string; source: string; unreadable: string; notLetter: string }> = {
  en: { means: "What this means", todo: "What to do", deadline: "Deadline", help: "Help", source: "Source", unreadable: "Costa couldn't read that photo. Please send a clear photo of the whole page in good light.", notLetter: "That doesn't look like a benefits letter. Send a photo of the letter, or text your question." },
  es: { means: "Qué significa", todo: "Qué hacer", deadline: "Fecha límite", help: "Ayuda", source: "Fuente", unreadable: "Costa no pudo leer la foto. Envíe una foto clara de toda la página con buena luz.", notLetter: "No parece una carta de beneficios. Envíe una foto de la carta o escriba su pregunta." },
  zh: { means: "这是什么意思", todo: "该怎么做", deadline: "截止日期", help: "帮助", source: "来源", unreadable: "Costa 无法看清这张照片。请在光线充足处拍一张完整清晰的照片。", notLetter: "这看起来不像福利信件。请发送信件照片，或直接输入您的问题。" },
  tl: { means: "Ano ang ibig sabihin", todo: "Ano ang gagawin", deadline: "Deadline", help: "Tulong", source: "Source", unreadable: "Hindi mabasa ni Costa ang larawan. Magpadala ng malinaw na larawan ng buong pahina sa maliwanag na lugar.", notLetter: "Mukhang hindi ito sulat tungkol sa benepisyo. Magpadala ng larawan ng sulat, o i-text ang tanong mo." },
  vi: { means: "Ý nghĩa", todo: "Cần làm gì", deadline: "Hạn chót", help: "Trợ giúp", source: "Nguồn", unreadable: "Costa không đọc được ảnh. Hãy gửi ảnh rõ của cả trang, đủ ánh sáng.", notLetter: "Đây có vẻ không phải thư phúc lợi. Hãy gửi ảnh lá thư hoặc nhắn câu hỏi của bạn." },
};

export function formatLetterSms(result: LetterResult, language: LanguageCode): string {
  const L = isTranslatedUiLang(language) ? SMS_LABELS[language] : SMS_LABELS.en;
  if (!result.ok) return result.reason === "unreadable" ? L.unreadable : L.notLetter;
  const e = result.explanation;
  const lines = [
    `${L.means}: ${e.whatThisMeans}`,
    `${L.todo}: ${e.whatToDo.map((s, i) => `${i + 1}) ${s}`).join(" ")}`,
  ];
  if (e.deadline) lines.push(`${L.deadline}: ${e.deadline}`);
  lines.push(`${L.help}: ${e.needHelp}`);
  if (result.sources[0]) lines.push(`${L.source}: ${result.sources[0].agency} ${result.sources[0].url}`);
  return lines.join("\n\n").slice(0, 1500);
}
