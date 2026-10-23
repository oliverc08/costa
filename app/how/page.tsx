import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/app/AppShell";
import { readEvalSummary } from "@/lib/eval-summary";
import { resolveUiLanguage } from "@/lib/ui-language";

export const metadata: Metadata = {
  title: "How Costa works · Costa",
  description: "How Costa runs locally: multilingual FAQ, deterministic eligibility, verified sources, and human handoff.",
  robots: { index: false },
};

const STEPS = [
  { title: "Speech in", body: "Uses browser speech recognition where available, with an on-device Whisper-tiny path in supported browsers. Costa does not send audio to an AI Gateway." },
  { title: "Language", body: "UI language from the first-screen picker (cookie). Content and TTS use the same language code." },
  { title: "Intent", body: "Common questions match a multilingual FAQ with no model call. Other questions use Costa’s deterministic local agent to search curated sources and the local-help directory." },
  { title: "Eligibility engine", body: "TypeScript rules apply program tables and categories. The checkup runs in the browser. Costa does not ask immigration status or make benefit decisions." },
  { title: "Verified sources", body: "The FAQ and local agent draw from Costa’s curated source files, which include agency and verification details. Optional database-backed embeddings are not needed." },
  { title: "Localized response", body: "Pre-written FAQ answers and local-agent templates support multiple languages. If configured, an optional local model can provide freer chat; it is not required." },
  { title: "Speech out", body: "Device text-to-speech reads results and chat replies aloud so the journey can work without reading." },
  { title: "Human handoff", body: "One tap to call local orgs (ALAS, Puente, 211, county lines) or request a person callback with consent." },
];

const TECH = [
  "Next.js App Router on Vercel",
  "On-device checkup; screening math does not need a server round-trip",
  "FAQ matching and deterministic local agent are the default; no cloud model is called",
  "Optional local model endpoint such as Ollama (COSTA_LOCAL_LLM_URL)",
  "Letter image OCR runs in the browser; redacted extracted text is sent to the Costa app server for analysis",
  "My Plan and checkup details are saved in browser localStorage",
  "In-memory server storage by default; optional Neon database for durable sessions and handoffs",
  "No account; no immigration questions",
  "AI coding assistance disclosed in docs/AI-DISCLOSURE.md (CAC requirement)",
];

export default async function HowPage({ searchParams }: PageProps<"/how">) {
  const lang = await resolveUiLanguage((await searchParams).lang);
  const evalSummary = await readEvalSummary();

  return (
    <AppShell lang={lang} back="/" title="Costa">
      <article className="flex flex-col gap-8">
        <header className="flex flex-col gap-2">
          <p className="text-[13px] font-semibold uppercase tracking-wider text-poppy-700">For judges & partners</p>
          <h1 className="text-[30px] leading-tight text-pine-950">How Costa works</h1>
          <p className="text-[16px] leading-relaxed text-stone-700">
            Costa is intentionally simple on the surface — voice first, large buttons, and spoken answers — with structured rules for screening. The default app runs without a cloud AI service.
          </p>
          {evalSummary ? (
            <p className="rounded-md border border-pine-800/20 bg-pine-50 px-4 py-3 text-[15px] font-semibold text-pine-950">
              Costa Safety Eval: {evalSummary.passed}/{evalSummary.total} passing
              <span className="mt-1 block text-[13px] font-medium text-stone-600">
                Ran {new Date(evalSummary.ranAt).toLocaleDateString("en-US")} · {evalSummary.model}
              </span>
            </p>
          ) : (
            <p className="rounded-md border border-amber-800/20 bg-amber-50 px-4 py-3 text-[14px] leading-relaxed text-amber-950">
              Safety eval score not published yet. Judges can run <code className="font-mono text-[13px]">npm run eval</code> (no API keys or AI Gateway account needed), or review scenarios in <code className="font-mono text-[13px]">evals/scenarios.ts</code>.
            </p>
          )}
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
          <p className="text-[14px] leading-relaxed text-stone-600">
            Full AI and open-source disclosure:{" "}
            <a href="https://github.com/oliverc08/costa/blob/main/docs/AI-DISCLOSURE.md" className="font-semibold text-pine-800 underline">
              docs/AI-DISCLOSURE.md
            </a>
            . Submission checklist:{" "}
            <a href="https://github.com/oliverc08/costa/blob/main/docs/SUBMISSION.md" className="font-semibold text-pine-800 underline">
              docs/SUBMISSION.md
            </a>
            .
          </p>
        </section>

        <p className="text-[14px] leading-relaxed text-stone-600">
          Checkup answers and My Plan stay in browser storage. Ask messages are processed by the Costa app server; when running locally, that is your local development server. Without a database, server-side sessions and handoffs use temporary process memory. If a database is configured, the scheduled purge removes sessions older than 30 days and resolved handoffs older than 30 days. Letter photos are OCR’d in the browser, then redacted extracted text is sent to the app server for analysis. Redaction may miss details, so use a fabricated or carefully reviewed sample. See the privacy and data-flow details in the AI disclosure.
        </p>

        <Link href="/" className="flex min-h-12 items-center justify-center rounded-md bg-pine-800 font-semibold text-white active:bg-pine-900">
          Back to Costa
        </Link>
      </article>
    </AppShell>
  );
}
