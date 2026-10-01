"use client";

import { app } from "@/lib/i18n-app";
import { LANGUAGES, LANGUAGE_CODES, type LanguageCode } from "@/lib/languages";
import { ArrowRightIcon } from "./Icons";
import { Logo } from "./AppShell";
import { useSwitchLanguage } from "./SettingsSheet";

/** First visit: brand, promise, then language — judge-readable in under 10 seconds. */
export function Welcome({ suggested }: { suggested: LanguageCode }) {
  const switchLanguage = useSwitchLanguage();
  const ordered = [suggested, ...LANGUAGE_CODES.filter((c) => c !== suggested)];
  const copy = app(suggested);
  const w = copy.welcome;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-6 pb-10 pt-[calc(2.5rem+env(safe-area-inset-top))]">
      <header className="flex flex-col gap-4 border-b border-stone-300 pb-8">
        <Logo />
        <p lang={suggested} className="max-w-[22rem] text-[22px] font-semibold leading-snug text-pine-950">
          {w.tagline}
        </p>
        <p lang={suggested} className="text-[14px] font-semibold tracking-wide text-stone-500">
          {w.trust}
        </p>
      </header>

      <section className="flex flex-col gap-5 pt-8" aria-labelledby="welcome-lang">
        <h1 id="welcome-lang" lang={suggested} className="text-[26px] leading-tight text-pine-950">
          {copy.common.chooseLanguage}
        </h1>

        <ul className="flex flex-col gap-3">
          {ordered.map((code) => (
            <li key={code}>
              <button
                type="button"
                lang={code}
                onClick={() => switchLanguage(code)}
                className={`flex min-h-[3.75rem] w-full items-center justify-between rounded-md border bg-white px-4 text-left text-[20px] font-bold active:bg-stone-100 ${
                  code === suggested ? "border-pine-800 ring-1 ring-pine-800" : "border-stone-400"
                }`}
              >
                <span className="flex flex-col gap-0.5">
                  <span>{LANGUAGES[code].native}</span>
                  {code !== suggested && (
                    <span className="text-[13px] font-medium text-stone-500">{copy.languageNames[code]}</span>
                  )}
                </span>
                <ArrowRightIcon className="shrink-0 text-pine-800" />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <p className="mt-auto pt-10 text-center text-sm leading-relaxed text-stone-500" lang={suggested}>
        {copy.common.stayPrivate}
      </p>
    </main>
  );
}
