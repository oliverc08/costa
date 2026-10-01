import type { Metadata } from "next";
import Link from "next/link";
import { AppShell } from "@/components/app/AppShell";
import { ExternalIcon, MapPinIcon, PhoneIcon } from "@/components/app/Icons";
import { PersonRequest, type HelpTopic } from "@/components/app/PersonRequest";
import { app, APP } from "@/lib/i18n-app";
import type { LanguageCode } from "@/lib/languages";
import { listProviders, normalizeArea, type HelpProgram, type ProviderCard } from "@/lib/local-help";
import { resolveUiLanguage } from "@/lib/ui-language";

export const metadata: Metadata = { title: "Free help · Costa" };

const CITIES = ["Half Moon Bay", "Pescadero", "Redwood City", "East Palo Alto", "San José", "Gilroy"];
const TOPICS: HelpTopic[] = ["medi-cal", "calfresh", "wic", "caleitc", "disaster", "other"];
function languagesLine(p: ProviderCard, lang: LanguageCode) {
  const a = app(lang);
  if (p.languages === "interpreters") return a.help.interpreters;
  return a.help.speaks(p.languages.map((l) => a.languageNames[l]).join(lang === "zh" ? "、" : ", "));
}

function Provider({ p, lang }: { p: ProviderCard; lang: LanguageCode }) {
  const a = app(lang);
  const tel = p.phone?.replace(/[^\d+]/g, "");
  return (
    <li className="flex flex-col gap-3 py-4">
      <div className="flex flex-col gap-1">
        <span className="text-[12px] font-semibold uppercase tracking-wider text-poppy-700">{a.help.kinds[p.kind]}</span>
        <p className="text-[17px] font-bold leading-snug">{p.name}</p>
        {p.address && <p className="text-[15px] text-stone-600">{p.address}</p>}
        {p.hours && <p className="text-[15px] text-stone-600">{p.hours}</p>}
        <p className="text-[14px] text-stone-500">{languagesLine(p, lang)}</p>
      </div>
      <div className="flex gap-2">
        {p.phone && tel && (
          <a href={`tel:${tel}`} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-md bg-pine-800 px-3 font-semibold text-white active:bg-pine-900">
            <PhoneIcon size={18} /> <span className="whitespace-nowrap">{p.phone}</span>
          </a>
        )}
        {p.address && (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${p.name}, ${p.address}, CA`)}`}
            target="_blank"
            rel="noreferrer"
            className="flex min-h-12 items-center justify-center gap-1.5 rounded-md border border-stone-400 bg-white px-3 font-semibold active:bg-stone-100"
          >
            <MapPinIcon size={18} /> {a.common.map}
          </a>
        )}
        <a href={p.url} target="_blank" rel="noreferrer" aria-label={`${a.common.website}: ${p.name}`} className="flex min-h-12 items-center justify-center rounded-md border border-stone-400 bg-white px-3 active:bg-stone-100">
          <ExternalIcon size={18} />
        </a>
      </div>
    </li>
  );
}

export default async function HelpPage({ searchParams }: PageProps<"/help">) {
  const params = await searchParams;
  const lang = await resolveUiLanguage(params.lang);
  const a = app(lang);
  const area = typeof params.area === "string" ? params.area.trim().slice(0, 80) : "";
  const topicParam = typeof params.topic === "string" ? params.topic : "";
  const topic: HelpTopic = (TOPICS as string[]).includes(topicParam) ? (topicParam as HelpTopic) : "other";
  const county = area ? normalizeArea(area) : null;
  const program: HelpProgram | "any" = topic === "other" ? "any" : topic;
  const { local, statewide } = listProviders(county, lang, program);

  return (
    <AppShell lang={lang}>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-2">
          <h1 className="text-[30px] leading-tight text-pine-950">{a.help.title}</h1>
          <p className="text-[16px] leading-relaxed text-stone-700">{a.help.intro}</p>
        </header>

        <form action="/help" className="flex flex-col gap-3">
          {topic !== "other" && <input type="hidden" name="topic" value={topic} />}
          <label htmlFor="area" className="text-[15px] font-semibold">
            {a.help.whereLabel}
          </label>
          <div className="flex gap-2">
            <input
              id="area"
              name="area"
              defaultValue={area}
              placeholder={a.help.wherePlaceholder}
              autoComplete="address-level2"
              enterKeyHint="search"
              className="min-h-13 min-w-0 flex-1 rounded-md border border-stone-400 bg-white px-3.5 text-[17px] outline-none focus:border-pine-800 focus:ring-2 focus:ring-pine-800/15"
            />
            <button type="submit" className="min-h-13 rounded-md bg-stone-900 px-4 font-semibold text-white active:bg-stone-700">
              {a.help.search}
            </button>
          </div>
          <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
            {CITIES.map((c) => (
              <Link
                key={c}
                href={`/help?area=${encodeURIComponent(c)}${topic !== "other" ? `&topic=${topic}` : ""}`}
                className={`min-h-10 shrink-0 rounded-md border px-3.5 py-2 text-[15px] font-medium ${area === c ? "border-pine-800 bg-pine-800 text-white" : "border-stone-400 bg-white"}`}
              >
                {c}
              </Link>
            ))}
          </div>
        </form>

        {county && (
          <section className="flex flex-col gap-3">
            <h2 className="text-[21px] text-pine-950">{a.help.localTitle}</h2>
            <p className="-mt-1 text-[15px] font-medium text-pine-800">{a.help.showingFor[county]}</p>
            <ul className="divide-y divide-stone-300 border-y border-stone-300">
              {local.map((p) => (
                <Provider key={p.id} p={p} lang={lang} />
              ))}
            </ul>
          </section>
        )}
        {area && !county && <p className="rounded-md bg-amber-50 px-4 py-3 text-[15px] leading-relaxed text-amber-950">{a.help.outside}</p>}

        <section id="person" className="flex scroll-mt-20 flex-col gap-3">
          <div className="flex flex-col gap-1">
            <h2 className="text-[21px] text-pine-950">{a.help.personTitle}</h2>
            <p className="text-[15px] text-stone-600">{a.help.personBody}</p>
          </div>
          <PersonRequest lang={lang} defaultTopic={topic} defaultArea={area} />
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-[21px] text-pine-950">{a.help.statewideTitle}</h2>
          <ul className="divide-y divide-stone-300 border-y border-stone-300">
            {statewide.map((p) => (
              <Provider key={p.id} p={p} lang={lang} />
            ))}
          </ul>
        </section>

        <footer className="flex flex-col gap-2 text-[13px] text-stone-500">
          <p className="font-semibold text-stone-700">{a.common.emergency}</p>
          <Link href="/partners" className="self-start underline underline-offset-2">
            {a.help.partners}
          </Link>
        </footer>
      </div>
    </AppShell>
  );
}
