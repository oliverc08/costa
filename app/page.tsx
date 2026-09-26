import Link from "next/link";
import { Chat } from "@/components/Chat";
import { LanguagePicker } from "@/components/LanguagePicker";
import { UI } from "@/lib/i18n";
import { resolveUiLanguage } from "@/lib/ui-language";
import { readEvalSummary } from "@/lib/eval-summary";

function formatPhone(e164: string | undefined): string | null {
  if (!e164) return null;
  const d = e164.replace(/\D/g, "").replace(/^1/, "");
  if (d.length !== 10) return e164;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

export default async function Home({ searchParams }: PageProps<"/">) {
  const lang = await resolveUiLanguage((await searchParams).lang);
  const t = UI[lang];
  const phone = process.env.TWILIO_PHONE_NUMBER;
  const phoneDisplay = formatPhone(phone);
  const evals = await readEvalSummary();

  return (
    <main lang={lang} className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-5 py-8 sm:py-12">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <span className="flex items-center gap-2 text-xl font-bold tracking-tight text-teal-800">
          <span aria-hidden className="grid h-8 w-8 place-items-center rounded-full bg-teal-700 text-base text-white">
            C
          </span>
          Costa
        </span>
        <LanguagePicker current={lang} />
      </header>

      <section className="flex flex-col gap-5">
        <h1 className="text-4xl font-bold leading-tight tracking-tight sm:text-5xl">{t.tagline}</h1>
        <p className="max-w-2xl text-lg text-stone-700">{t.subtitle}</p>
        <div className="flex flex-wrap gap-3">
          <a
            href={phone ? `tel:${phone}` : "#ask"}
            className="inline-flex items-center gap-2 rounded-full bg-teal-700 px-6 py-3.5 text-lg font-semibold text-white shadow-sm hover:bg-teal-800"
          >
            <span aria-hidden>☎</span> {t.call}
            {phoneDisplay && <span className="font-normal opacity-90">{phoneDisplay}</span>}
          </a>
          <a
            href={phone ? `sms:${phone}` : "#ask"}
            className="inline-flex items-center gap-2 rounded-full border-2 border-teal-700 px-6 py-3 text-lg font-semibold text-teal-800 hover:bg-teal-50"
          >
            <span aria-hidden>✉</span> {t.text}
          </a>
        </div>
      </section>

      <section id="ask" className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">{t.ask}</h2>
        <Chat t={t} />
        <Link
          href={`/letter?lang=${lang}`}
          className="flex items-center justify-between rounded-2xl border border-stone-200 bg-white px-5 py-4 font-medium text-stone-900 hover:border-teal-600"
        >
          <span>
            <span aria-hidden className="mr-2">📷</span>
            {t.letterCta}
          </span>
          <span aria-hidden>→</span>
        </Link>
      </section>

      <section className="rounded-3xl bg-stone-900 p-6 text-stone-100 sm:p-8">
        <h2 className="text-xl font-semibold text-white">{t.safetyTitle}</h2>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {t.safetyItems.map((item) => (
            <li key={item} className="flex gap-2 text-sm leading-relaxed">
              <span aria-hidden className="text-teal-300">✓</span>
              {item}
            </li>
          ))}
        </ul>
        {evals && (
          <p className="mt-6 border-t border-stone-700 pt-4 font-mono text-sm text-teal-200">
            Costa Safety Eval: {evals.passed}/{evals.total} passing
            <span className="text-stone-400"> · {new Date(evals.ranAt).toLocaleDateString("en-US")}</span>
          </p>
        )}
      </section>

      <footer className="pb-6 text-xs text-stone-500">
        Costa is a student project and is not a government agency. It gives general information from official
        sources and cannot decide eligibility. For emergencies, call 911.
      </footer>
    </main>
  );
}
