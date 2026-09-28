"use client";

import { APP } from "@/lib/i18n-app";
import { LANGUAGES, LANGUAGE_CODES, type LanguageCode } from "@/lib/languages";
import { ArrowRightIcon } from "./Icons";
import { Logo } from "./AppShell";
import { useSwitchLanguage } from "./SettingsSheet";

/** First visit: pick a language before anything else, each option written in its own language. */
export function Welcome({ suggested }: { suggested: LanguageCode }) {
  const switchLanguage = useSwitchLanguage();
  const ordered = [suggested, ...LANGUAGE_CODES.filter((c) => c !== suggested)];

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col gap-8 px-5 pb-10 pt-[calc(2.5rem+env(safe-area-inset-top))]">
      <Logo />
      <div className="flex flex-col gap-1">
        {ordered.map((code) => (
          <p key={code} lang={code} className={code === suggested ? "text-3xl font-bold leading-tight" : "text-lg text-stone-500"}>
            {APP[code].common.chooseLanguage}
          </p>
        ))}
      </div>
      <ul className="flex flex-col gap-3">
        {ordered.map((code) => (
          <li key={code}>
            <button
              type="button"
              lang={code}
              onClick={() => switchLanguage(code)}
              className={`flex min-h-16 w-full items-center justify-between rounded-2xl px-5 text-left text-xl font-semibold shadow-sm ${
                code === suggested ? "bg-teal-700 text-white active:bg-teal-800" : "border-2 border-stone-200 bg-white active:bg-stone-50"
              }`}
            >
              {LANGUAGES[code].native}
              <ArrowRightIcon />
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-auto text-center text-sm text-stone-500" lang={suggested}>
        {APP[suggested].common.stayPrivate}
      </p>
    </main>
  );
}
