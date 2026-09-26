export const LANGUAGES = {
  en: {
    name: "English",
    native: "English",
    speechCode: "en-US",
    ttsVoice: "Google.en-US-Neural2-F",
  },
  es: {
    name: "Spanish",
    native: "Español",
    speechCode: "es-US",
    ttsVoice: "Google.es-US-Neural2-A",
  },
  zh: {
    name: "Mandarin Chinese",
    native: "中文",
    speechCode: "cmn-Hans-CN",
    ttsVoice: "Google.cmn-CN-Standard-A",
  },
  tl: {
    name: "Tagalog",
    native: "Tagalog",
    speechCode: "fil-PH",
    ttsVoice: "Google.fil-PH-Standard-A",
  },
  vi: {
    name: "Vietnamese",
    native: "Tiếng Việt",
    speechCode: "vi-VN",
    ttsVoice: "Google.vi-VN-Standard-A",
  },
} as const;

export type LanguageCode = keyof typeof LANGUAGES;

export const LANGUAGE_CODES = Object.keys(LANGUAGES) as LanguageCode[];

export function isLanguageCode(v: unknown): v is LanguageCode {
  return typeof v === "string" && v in LANGUAGES;
}

const WHISPER_NAMES: Record<string, LanguageCode> = {
  english: "en",
  spanish: "es",
  chinese: "zh",
  mandarin: "zh",
  tagalog: "tl",
  filipino: "tl",
  vietnamese: "vi",
};

/** Maps ISO codes or Whisper language names ("spanish") to a supported code. */
export function normalizeLanguage(v: string | null | undefined): LanguageCode | null {
  if (!v) return null;
  const s = v.toLowerCase().trim();
  if (isLanguageCode(s)) return s;
  const base = s.split(/[-_]/)[0];
  if (base === "cmn" || base === "yue") return "zh";
  if (base === "fil") return "tl";
  if (isLanguageCode(base)) return base;
  return WHISPER_NAMES[s] ?? null;
}

const VI_CHARS = /[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i;
const HAN = /[\u3400-\u4dbf\u4e00-\u9fff]/;

const STOPWORDS: Record<"en" | "es" | "tl", string[]> = {
  en: ["the", "is", "my", "i", "and", "to", "what", "how", "do", "can", "have", "for", "you", "a", "of", "need", "it", "me", "am", "does", "with", "this", "got", "help", "please", "want"],
  es: ["el", "la", "que", "de", "y", "mi", "es", "en", "por", "para", "como", "cómo", "qué", "tengo", "puedo", "un", "una", "los", "las", "necesito", "ayuda", "no", "me", "si", "sí", "hola", "quiero", "carta", "gracias", "con", "está"],
  tl: ["ang", "ng", "sa", "ko", "ako", "po", "na", "mga", "paano", "ano", "ba", "may", "kailangan", "ito", "hindi", "at", "ay", "gusto", "kong", "salamat", "tulong", "ninyo", "nyo", "akin", "aking", "naman", "lang"],
};

/**
 * Deterministic language guess for the five supported languages. Used to pick
 * TTS voices and to score evals; the model itself also detects language.
 */
export function detectLanguage(text: string): LanguageCode | null {
  const t = text.trim();
  if (!t) return null;
  if (HAN.test(t)) return "zh";
  if (VI_CHARS.test(t)) return "vi";

  const words = t.toLowerCase().normalize("NFC").match(/[\p{L}']+/gu) ?? [];
  if (words.length === 0) return null;
  const scores = { en: 0, es: 0, tl: 0 };
  for (const w of words) {
    for (const lang of ["en", "es", "tl"] as const) {
      if (STOPWORDS[lang].includes(w)) scores[lang]++;
    }
  }
  if (/[ñ¿¡áéíóú]/i.test(t)) scores.es += 2;
  const best = (Object.entries(scores) as [keyof typeof scores, number][]).sort(
    (a, b) => b[1] - a[1],
  )[0];
  if (best[1] === 0) return null;
  return best[0];
}
