import { voice, VOICE } from "@/lib/i18n";
import { LANGUAGES, type LanguageCode } from "@/lib/languages";

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function attrs(a: Record<string, string | number | undefined>): string {
  return Object.entries(a)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => ` ${k}="${esc(String(v))}"`)
    .join("");
}

export const say = (lang: LanguageCode, text: string) =>
  `<Say${attrs({ voice: LANGUAGES[lang].ttsVoice })}>${esc(text)}</Say>`;

export const pause = (seconds = 1) => `<Pause length="${seconds}"/>`;

export const redirect = (url: string) => `<Redirect method="POST">${esc(url)}</Redirect>`;

export const response = (...verbs: string[]) =>
  `<?xml version="1.0" encoding="UTF-8"?><Response>${verbs.join("")}</Response>`;

/** Listens for the caller's next question in a known language. */
export function gatherSpeech(lang: LanguageCode, prompt: string): string {
  return `<Gather${attrs({
    input: "speech",
    language: LANGUAGES[lang].speechCode,
    action: `/api/voice/turn?lang=${lang}`,
    method: "POST",
    speechTimeout: "auto",
    timeout: 6,
  })}>${say(lang, prompt)}</Gather>`;
}

/** Speaks an answer, asks if there's anything else, and hangs up politely on silence. */
export function answerAndListen(lang: LanguageCode, text: string, endCall = false): string {
  const v = voice(lang);
  if (endCall) return response(say(lang, text), say(lang, v.goodbye), "<Hangup/>");
  return response(say(lang, text), gatherSpeech(lang, v.anythingElse), say(lang, v.goodbye), "<Hangup/>");
}

/** Turns a chat-style answer into something that sounds natural when spoken. */
export function toSpeech(text: string): string {
  return text
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\bwww\.\S+/g, "")
    .replace(/[*_#`>|]/g, "")
    .replace(/^\s*[-•]\s+/gm, "")
    .replace(/\(\s*\)/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 900);
}

export const GREETING = {
  en: "Hi, this is Costa, free help with benefits like Medi-Cal. Costa uses official information and can't decide eligibility. After the tone, tell me how I can help, in your language. Or press 1 for English.",
  es: "Hola, soy Costa, ayuda gratis con beneficios como Medi-Cal. Después del tono, dígame en qué le puedo ayudar. Para español, oprima 2.",
  zh: "中文请按3。",
  tl: "Para sa Tagalog, pindutin ang 4.",
  vi: "Tiếng Việt, xin bấm 5.",
  ko: "한국어는 6번을 누르세요.",
  pt: "Para português, pressione 7.",
} satisfies Record<LanguageCode, string>;

export const DIGIT_LANGUAGES: Record<string, LanguageCode> = {
  "1": "en",
  "2": "es",
  "3": "zh",
  "4": "tl",
  "5": "vi",
  "6": "ko",
  "7": "pt",
};
