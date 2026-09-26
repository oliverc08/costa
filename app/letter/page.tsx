import type { Metadata } from "next";
import Link from "next/link";
import { LanguagePicker } from "@/components/LanguagePicker";
import { LetterUpload } from "@/components/LetterUpload";
import { DISCLAIMER, LETTER_UI, UI } from "@/lib/i18n";
import { resolveUiLanguage } from "@/lib/ui-language";

export const metadata: Metadata = { title: "Explain a letter · Costa" };

export default async function LetterPage({ searchParams }: PageProps<"/letter">) {
  const lang = await resolveUiLanguage((await searchParams).lang);
  const t = UI[lang];

  return (
    <main lang={lang} className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-5 py-8 sm:py-12">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <Link href={`/?lang=${lang}`} className="flex items-center gap-2 text-teal-800 hover:text-teal-950">
          <span aria-hidden>←</span>
          <span className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <span aria-hidden className="grid h-8 w-8 place-items-center rounded-full bg-teal-700 text-base text-white">
              C
            </span>
            Costa
          </span>
          <span className="sr-only">{LETTER_UI[lang].back}</span>
        </Link>
        <LanguagePicker current={lang} />
      </header>

      <section className="flex flex-col gap-3">
        <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{t.letterTitle}</h1>
        <p className="text-lg text-stone-700">{t.letterIntro}</p>
        <p className="text-sm text-stone-500">{t.privacyNote}</p>
      </section>

      <LetterUpload lang={lang} />

      <footer className="pt-4 text-xs text-stone-500">{DISCLAIMER[lang].letter}</footer>
    </main>
  );
}
