"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getSavedArea, saveArea } from "@/lib/device";
import { track } from "@/lib/analytics";
import type { LanguageCode } from "@/lib/languages";
import { app } from "@/lib/i18n-app";
import type { HelpTopic } from "./PersonRequest";

const CITIES = ["Half Moon Bay", "Pescadero", "Redwood City", "East Palo Alto", "San José", "Gilroy"];

export function HelpAreaForm({
  lang,
  topic,
  initialArea,
  hasCounty,
}: {
  lang: LanguageCode;
  topic: HelpTopic;
  initialArea: string;
  hasCounty: boolean;
}) {
  const a = app(lang);
  const [area, setArea] = useState(initialArea);

  useEffect(() => {
    if (initialArea) {
      saveArea(initialArea);
      return;
    }
    const saved = getSavedArea();
    if (saved && !initialArea) {
      const params = new URLSearchParams();
      if (topic !== "other") params.set("topic", topic);
      params.set("area", saved);
      window.location.replace(`/help?${params.toString()}`);
    }
  }, [initialArea, topic]);

  return (
    <form
      action="/help"
      className="flex flex-col gap-3"
      onSubmit={() => {
        saveArea(area);
        track("help_search", { has_area: Boolean(area.trim()) });
      }}
    >
      {topic !== "other" && <input type="hidden" name="topic" value={topic} />}
      <label htmlFor="area" className="text-[15px] font-semibold">
        {a.help.whereLabel}
      </label>
      <div className="flex gap-2">
        <input
          id="area"
          name="area"
          value={area}
          onChange={(e) => setArea(e.target.value)}
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
            onClick={() => saveArea(c)}
            className={`min-h-10 shrink-0 rounded-md border px-3.5 py-2 text-[15px] font-medium ${area === c ? "border-pine-800 bg-pine-800 text-white" : "border-stone-400 bg-white"}`}
          >
            {c}
          </Link>
        ))}
      </div>
      {area.trim() && !hasCounty && (
        <p className="rounded-md border border-amber-800/20 bg-amber-50 px-4 py-3 text-[15px] leading-relaxed text-amber-950">
          {a.help.outside}
          <span className="mt-2 block text-[14px] font-medium text-amber-900">
            {lang === "es"
              ? "También puede llamar al 211 o a Health Consumer Alliance: 1-888-804-3536."
              : lang === "ko"
                ? "211 또는 Health Consumer Alliance 1-888-804-3536으로도 연락할 수 있습니다."
                : lang === "pt"
                  ? "Também pode ligar para o 211 ou Health Consumer Alliance: 1-888-804-3536."
                  : "You can also call 211 or Health Consumer Alliance: 1-888-804-3536."}
          </span>
        </p>
      )}
    </form>
  );
}
