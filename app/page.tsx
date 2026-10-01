import { cookies } from "next/headers";
import { AppShell } from "@/components/app/AppShell";
import { VoiceHome } from "@/components/app/VoiceHome";
import { Welcome } from "@/components/app/Welcome";
import { disclaimer, DISCLAIMER } from "@/lib/i18n";
import { app, APP } from "@/lib/i18n-app";
import { isLanguageCode } from "@/lib/languages";
import { resolveUiLanguage, UI_LANG_COOKIE } from "@/lib/ui-language";

export default async function Home({ searchParams }: PageProps<"/">) {
  const query = (await searchParams).lang;
  const lang = await resolveUiLanguage(query);
  const hasChosen = isLanguageCode((await cookies()).get(UI_LANG_COOKIE)?.value) || isLanguageCode(query);
  if (!hasChosen) return <Welcome suggested={lang} />;

  const a = app(lang);

  return (
    <AppShell lang={lang}>
      <div className="flex flex-col gap-8">
        <VoiceHome lang={lang} />
        <footer className="flex flex-col gap-2 text-[13px] leading-relaxed text-stone-500">
          <p className="font-semibold text-stone-700">{a.common.emergency}</p>
          <p>{disclaimer(lang).site}</p>
        </footer>
      </div>
    </AppShell>
  );
}
