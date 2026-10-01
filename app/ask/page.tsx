import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { AskChat } from "@/components/app/AskChat";
import { faqQuestions } from "@/lib/faq";
import { resolveUiLanguage } from "@/lib/ui-language";

export const metadata: Metadata = { title: "Ask · Costa" };

export default async function AskPage({ searchParams }: PageProps<"/ask">) {
  const params = await searchParams;
  const lang = await resolveUiLanguage(params.lang);
  return (
    <AppShell lang={lang}>
      <AskChat lang={lang} suggestions={faqQuestions(lang).slice(0, 8)} micHint={params.mic === "1"} />
    </AppShell>
  );
}
