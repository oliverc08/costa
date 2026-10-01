"use client";

import { APP } from "@/lib/i18n-app";
import { LANGUAGES, LANGUAGE_CODES, type LanguageCode } from "@/lib/languages";
import { ArrowRightIcon } from "./Icons";
import { Logo } from "./AppShell";
import { useSwitchLanguage } from "./SettingsSheet";

/** First visit: brand, promise, then language — judge-readable in under 10 seconds. */
export function Welcome({ suggested }: { suggested: LanguageCode }) {
  const switchLanguage = useSwitchLanguage();
  const ordered = [suggested, ...LANGUAGE_CODES.filter((c) => c !== suggested)];
  const w = APP[suggested].welcome;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-7 px-6 pb-10 pt-[calc(2.5rem+env(safe-area-inset-top))]">
      <div className="flex flex-col gap-3">
        <Logo />
        <p lang={suggested} className="text-[20px] font-semibold leading-snug text-pine-950">
          {w.tagline}
        </p>
        <p lang={suggested} className="text-[14px] font-medium tracking-wide text-stone-600">
          {w.trust}
        </p>
      </div>

      <div className="flex flex-col gap-1">
        {ordered.map((code) =>
          code === suggested ? (
            <h1 key={code} lang={code} className="text-[28px] leading-tight text-pine-950">
              {APP[code].common.chooseLanguage}
            </h1>
          ) : (
            <p key={code} lang={code} className="text-lg text-stone-500">
              {APP[code].common.chooseLanguage}
            </p>
          ),
        )}
      </div>

      <ul className="divide-y divide-stone-300 border-y border-stone-300">
        {ordered.map((code) => (
          <li key={code}>
            <button
              type="button"
              lang={code}
              onClick={() => switchLanguage(code)}
              className="flex min-h-16 w-full items-center justify-between text-left text-[21px] font-semibold active:bg-stone-200/50"
            >
              {LANGUAGES[code].native}
              <ArrowRightIcon className="text-pine-800" />
            </button>
          </li>
        ))}
      </ul>

      <p className="mt-auto text-center text-sm leading-relaxed text-stone-500" lang={suggested}>
        {APP[suggested].common.stayPrivate}
      </p>
    </main>
  );
}
