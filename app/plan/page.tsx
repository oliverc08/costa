import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { MyPlan } from "@/components/app/MyPlan";
import { resolveUiLanguage } from "@/lib/ui-language";

export const metadata: Metadata = { title: "My plan · Costa" };

export default async function PlanPage({ searchParams }: PageProps<"/plan">) {
  const lang = await resolveUiLanguage((await searchParams).lang);
  return (
    <AppShell lang={lang}>
      <MyPlan lang={lang} />
    </AppShell>
  );
}
