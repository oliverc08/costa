import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/app/AppShell";
import { resolveUiLanguage } from "@/lib/ui-language";

export const metadata: Metadata = {
  title: "How Costa works · Costa",
  description: "Architecture for judges: speech, deterministic eligibility, verified-source RAG, and human handoff.",
  robots: { index: false },
};

const STEPS = [
  { title: "Speech in", body: "Browser speech recognition (Web Speech API) in the user’s language. Falls back to Whisper via AI Gateway only when needed." },
  { title: "Language", body: "UI language from the first-screen picker (cookie). Content and TTS use the same language code." },
  { title: "Intent", body: "Common questions match a multilingual FAQ bank with zero model calls. Open questions go to the chat agent." },
  { title: "Eligibility engine", body: "Deterministic on-device rules (FPL tables, WIC categories, CalEITC). Never asks immigration status. AI does not invent eligibility." },
  { title: "Verified-source RAG", body: "Answers cite government sources with agency and last-verified date. pgvector search over an ingested knowledge base when AI is used." },
  { title: "Localized response", body: "Pre-written FAQ answers in en / es / zh / tl / vi. Model replies stay in the user’s language with safety audits." },
  { title: "Speech out", body: "Device text-to-speech reads results and chat replies aloud so the journey can work without reading." },
  { title: "Human handoff", body: "One tap to call local orgs (ALAS, Puente, 211, county lines) or request a person callback with consent." },
];

const TECH = [
  "Next.js App Router on Vercel",
  "On-device checkup (no server round-trip for screening math)",
  "FAQ shortcut before the LLM",
  "AI Gateway only for open chat, letters, and Whisper fallback",
  "Output safety audit for definite eligibility claims",
  "localStorage plan / reminders; chats expire after 30 days",
  "No account; no immigration questions",
];

export default async function HowPage({ searchParams }: PageProps<"/how">) {
  const lang = await resolveUiLanguage((await searchParams).lang);

  return (
    <AppShell lang={lang} back="/" title="Costa">
      <article className="flex flex-col gap-8">
        <header className="flex flex-col gap-2">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-poppy-700">For judges & partners</p>
          <h1 className="text-[30px] leading-tight text-pine-950">How Costa works</h1>
          <p className="text-[16px] leading-relaxed text-stone-700">
            Costa is intentionally simple on the surface — voice first, huge buttons, listen on every important answer — with serious engineering underneath. AI explains; structured rules decide screening.
          </p>
        </header>

        <section aria-label="Pipeline" className="flex flex-col">
          <ol className="divide-y divide-stone-300 border-y border-stone-300">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-4 py-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-pine-800 text-[15px] font-bold text-white">{i + 1}</span>
                <div className="min-w-0">
                  <h2 className="font-sans text-[17px] font-bold text-pine-950">{s.title}</h2>
                  <p className="mt-1 text-[15px] leading-relaxed text-stone-700">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-[21px] text-pine-950">What judges should notice</h2>
          <ul className="flex flex-col gap-2">
            {TECH.map((item) => (
              <li key={item} className="flex gap-2 text-[15px] leading-relaxed text-stone-800">
                <span aria-hidden className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-poppy-500" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        <p className="text-[14px] leading-relaxed text-stone-600">
          Privacy claim: checkup and plan stay on the phone. Questions may be processed to answer you; chats are deleted from the server after 30 days. We do not claim fully on-device AI.
        </p>

        <Link href="/" className="flex min-h-12 items-center justify-center rounded-md bg-pine-800 font-semibold text-white active:bg-pine-900">
          Back to Costa
        </Link>
      </article>
    </AppShell>
  );
}
