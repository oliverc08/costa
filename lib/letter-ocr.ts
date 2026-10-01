"use client";

import type { LanguageCode } from "@/lib/languages";

const TESS_LANG: Record<LanguageCode, string> = {
  en: "eng",
  es: "eng+spa",
  zh: "eng+chi_sim",
  tl: "eng",
  vi: "eng+vie",
  ko: "eng+kor",
  pt: "eng+por",
};

let workerPromise: Promise<{
  recognize: (image: Blob) => Promise<{ data: { text: string } }>;
  lang: LanguageCode;
}> | null = null;

async function getWorker(lang: LanguageCode) {
  if (workerPromise) {
    const existing = await workerPromise;
    if (existing.lang === lang) return existing;
    // Language changed — recreate.
    workerPromise = null;
  }
  workerPromise = (async () => {
    const { createWorker } = await import("tesseract.js");
    const worker = await createWorker(TESS_LANG[lang]);
    return {
      lang,
      recognize: (image: Blob) => worker.recognize(image),
    };
  })();
  return workerPromise;
}

/** On-device OCR for letter photos when cloud vision is blocked. */
export async function ocrLetterImage(blob: Blob, lang: LanguageCode): Promise<string> {
  const worker = await getWorker(lang);
  const {
    data: { text },
  } = await worker.recognize(blob);
  return text.replace(/\s+/g, " ").trim();
}
