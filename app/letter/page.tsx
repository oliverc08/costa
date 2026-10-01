import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { ShieldIcon } from "@/components/app/Icons";
import { LetterUpload } from "@/components/LetterUpload";
import { DISCLAIMER, UI } from "@/lib/i18n";
import { resolveUiLanguage } from "@/lib/ui-language";

export const metadata: Metadata = { title: "Understand a letter · Costa" };

export default async function LetterPage({ searchParams }: PageProps<"/letter">) {
  const lang = await resolveUiLanguage((await searchParams).lang);
  const t = UI[lang];

  return (
    <AppShell lang={lang}>
      <div className="flex flex-col gap-5">
        <header className="flex flex-col gap-2">
          <h1 className="text-[30px] leading-tight text-pine-950">{t.letterTitle}</h1>
          <p className="text-[17px] leading-relaxed text-stone-700">{t.letterIntro}</p>
          <p className="flex items-start gap-2 rounded-md bg-stone-100 px-3 py-2.5 text-[14px] text-stone-700">
            <ShieldIcon size={18} className="mt-0.5 shrink-0 text-pine-700" />
            {t.privacyNote}
          </p>
        </header>

        <LetterUpload lang={lang} />

        <footer className="text-[13px] leading-relaxed text-stone-500">{DISCLAIMER[lang].letter}</footer>
      </div>
    </AppShell>
  );
}
