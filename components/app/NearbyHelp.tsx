"use client";

import Link from "next/link";
import { listProviders, type ProviderCard } from "@/lib/local-help";
import { APP } from "@/lib/i18n-app";
import type { LanguageCode } from "@/lib/languages";
import type { County } from "@/lib/checkup";
import { ExternalIcon, MapPinIcon, PhoneIcon } from "./Icons";

function Row({ p, lang }: { p: ProviderCard; lang: LanguageCode }) {
  const a = APP[lang];
  const tel = p.phone?.replace(/[^\d+]/g, "");
  return (
    <li className="flex flex-col gap-2 py-4">
      <p className="text-[12px] font-semibold uppercase tracking-wider text-poppy-700">{a.help.kinds[p.kind]}</p>
      <p className="text-[17px] font-bold leading-snug">{p.name}</p>
      {p.address && <p className="text-[14px] text-stone-600">{p.address}</p>}
      <div className="flex flex-wrap gap-2 pt-1">
        {p.phone && tel && (
          <a href={`tel:${tel}`} className="flex min-h-12 flex-1 items-center justify-center gap-2 rounded-md bg-pine-800 px-3 font-semibold text-white active:bg-pine-900">
            <PhoneIcon size={18} /> {p.phone}
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

/** Local orgs for checkup results — one-tap call / map. */
export function NearbyHelp({ lang, county }: { lang: LanguageCode; county: County }) {
  const a = APP[lang];
  const resolved = county === "other" ? null : county;
  const { local, statewide } = listProviders(resolved, lang, "any");
  const rows = (resolved ? local : statewide).slice(0, 4);

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-[21px] text-pine-950">{a.check.nearbyTitle}</h2>
      <ul className="divide-y divide-stone-300 border-y border-stone-300">
        {rows.map((p) => (
          <Row key={p.id} p={p} lang={lang} />
        ))}
      </ul>
      <Link href="/help#person" className="pt-2 text-[16px] font-semibold text-pine-800 underline decoration-pine-300 underline-offset-4">
        {a.check.getHelp}
      </Link>
    </section>
  );
}
