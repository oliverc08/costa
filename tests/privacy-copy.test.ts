import { describe, expect, it } from "vitest";
import { analyzeLetterFromText } from "@/lib/letter-from-text";
import { app } from "@/lib/i18n-app";
import { SMS_CONSENT, ui } from "@/lib/i18n";
import { LANGUAGE_CODES, TRANSLATED_UI_LANGS, type LanguageCode, type TranslatedUiLang } from "@/lib/languages";

const privacyTerms: Record<LanguageCode, { memory: string; resolved: string; unresolved: string }> = {
  en: { memory: "temporary process memory", resolved: "resolved requests", unresolved: "unresolved requests" },
  es: { memory: "memoria temporal del proceso", resolved: "solicitudes resueltas", unresolved: "solicitudes sin resolver" },
  zh: { memory: "进程内存", resolved: "已解决的求助请求", unresolved: "未解决的请求" },
  tl: { memory: "memorya ng proseso", resolved: "nalutas na request", unresolved: "hindi pa nalulutas" },
  vi: { memory: "bộ nhớ tiến trình", resolved: "đã giải quyết", unresolved: "chưa giải quyết" },
  ko: { memory: "프로세스 메모리", resolved: "해결된 요청", unresolved: "해결되지 않은 요청" },
  pt: { memory: "memória temporária do processo", resolved: "pedidos resolvidos", unresolved: "pedidos não resolvidos" },
};

const analysisTerms: Record<TranslatedUiLang, { browser: string; server: string }> = {
  en: { browser: "browser", server: "app server" },
  es: { browser: "navegador", server: "servidor de la aplicación" },
  zh: { browser: "浏览器", server: "应用服务器" },
  tl: { browser: "browser", server: "app server" },
  vi: { browser: "trình duyệt", server: "máy chủ ứng dụng" },
};

const sampleLetter = `San Mateo County Human Services Agency\nMedi-Cal Renewal Form MC 216\nPlease return this renewal before 03/15/2027.`;

describe("privacy and processing copy", () => {
  it.each(LANGUAGE_CODES)("%s explains the configured retention behavior", (language) => {
    const body = app(language).privacy.body;
    const terms = privacyTerms[language];
    expect(body).toContain(terms.memory);
    expect(body).toContain("30");
    expect(body).toContain(terms.resolved);
    expect(body).toContain(terms.unresolved);
  });

  it.each(TRANSLATED_UI_LANGS)("%s SMS greeting makes no retention promise", (language) => {
    expect(SMS_CONSENT[language]).not.toMatch(/30\s*(?:days?|d[ií]as?|天|araw|ngày)/i);
  });

  it.each(LANGUAGE_CODES)("%s recovery copy does not imply an AI service must be configured", (language) => {
    expect(ui(language).notConfigured).not.toMatch(/\bAI\b|configured|configurad[oa]|配置|naka-configure|cấu hình/i);
  });

  it.each(TRANSLATED_UI_LANGS)("%s letter result identifies browser OCR and server analysis", async (language) => {
    const result = await analyzeLetterFromText({ text: sampleLetter, language });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.explanation.uncertainty).toContain(analysisTerms[language].browser);
    expect(result.explanation.uncertainty).toContain(analysisTerms[language].server);
    expect(result.explanation.uncertainty).not.toMatch(/cloud AI|offline|on your phone/i);
  });
});
