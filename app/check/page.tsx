import type { Metadata } from "next";
import { AppShell } from "@/components/app/AppShell";
import { Checkup } from "@/components/app/Checkup";
import { MyPlan } from "@/components/app/MyPlan";
import { resolveUiLanguage } from "@/lib/ui-language";

export const metadata: Metadata = { title: "Benefits checkup · Costa" };

export default async function CheckPage({ searchParams }: PageProps<"/check">) {
  const lang = await resolveUiLanguage((await searchParams).lang);
  return (
    <AppShell lang={lang}>
      <div className="flex flex-col gap-10">
        <Checkup lang={lang} />
        <div id="plan">
          <MyPlan lang={lang} />
        </div>
      </div>
    </AppShell>
  );
}
