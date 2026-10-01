"use client";

import { usePathname, useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { APP } from "@/lib/i18n-app";
import { clearDeviceData } from "@/lib/device";
import { LANGUAGES, LANGUAGE_CODES, type LanguageCode } from "@/lib/languages";
import { CheckIcon, CloseIcon, GlobeIcon, ShieldIcon, TrashIcon } from "./Icons";

export function rememberLanguage(code: LanguageCode) {
  document.cookie = `costa_lang=${code}; path=/; max-age=31536000; samesite=lax`;
}

export function useSwitchLanguage() {
  const router = useRouter();
  const pathname = usePathname();
  return (code: LanguageCode) => {
    rememberLanguage(code);
    const params = new URLSearchParams(window.location.search);
    params.set("lang", code);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    router.refresh();
  };
}

/** Language picker plus privacy controls, opened from the globe button in the top bar. */
export function SettingsSheet({ lang }: { lang: LanguageCode }) {
  const a = APP[lang];
  const dialog = useRef<HTMLDialogElement>(null);
  const switchLanguage = useSwitchLanguage();
  const [deleted, setDeleted] = useState(false);

  function close() {
    dialog.current?.close();
  }

  async function wipe() {
    if (!window.confirm(a.privacy.confirm)) return;
    await clearDeviceData();
    setDeleted(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setDeleted(false);
          dialog.current?.showModal();
        }}
        className="flex h-11 items-center gap-1.5 rounded-md border border-stone-300 bg-white px-3 text-[15px] font-medium text-stone-800 active:bg-stone-100"
      >
        <GlobeIcon size={20} />
        <span lang={lang}>{LANGUAGES[lang].native}</span>
      </button>

      <dialog
        ref={dialog}
        onClick={(e) => e.target === dialog.current && close()}
        className="fixed inset-x-0 bottom-0 top-auto m-0 mx-auto w-full max-w-lg rounded-t-lg bg-paper p-0 text-stone-900 backdrop:bg-stone-900/50 open:animate-[sheet_200ms_ease-out]"
      >
        <div className="flex max-h-[85dvh] flex-col gap-6 overflow-y-auto px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] pt-3">
          <div className="mx-auto h-1.5 w-10 rounded-full bg-stone-300" aria-hidden />
          <div className="flex items-center justify-between">
            <h2 className="text-[21px] text-pine-950">{a.common.chooseLanguage}</h2>
            <button type="button" onClick={close} className="grid h-11 w-11 place-items-center rounded-full active:bg-stone-100" aria-label={a.common.close}>
              <CloseIcon />
            </button>
          </div>

          <ul className="divide-y divide-stone-300 border-y border-stone-300">
            {LANGUAGE_CODES.map((code) => (
              <li key={code}>
                <button
                  type="button"
                  lang={code}
                  onClick={() => {
                    switchLanguage(code);
                    close();
                  }}
                  aria-pressed={code === lang}
                  className={`flex min-h-14 w-full items-center justify-between text-left text-lg ${
                    code === lang ? "font-bold text-pine-900" : "font-medium active:bg-stone-200/50"
                  }`}
                >
                  <span>
                    {LANGUAGES[code].native}
                    {code !== lang && <span className="ml-2 text-sm font-normal text-stone-500">{a.languageNames[code]}</span>}
                  </span>
                  {code === lang && <CheckIcon className="text-pine-700" />}
                </button>
              </li>
            ))}
          </ul>

          <section className="flex flex-col gap-3 rounded-md border border-stone-300 bg-white p-4">
            <h3 className="flex items-center gap-2 font-semibold">
              <ShieldIcon size={20} className="text-pine-700" />
              {a.privacy.title}
            </h3>
            <p className="text-[15px] leading-relaxed text-stone-700">{a.privacy.body}</p>
            {deleted ? (
              <p role="status" className="flex items-center gap-2 font-medium text-pine-800">
                <CheckIcon size={20} /> {a.privacy.done}
              </p>
            ) : (
              <button
                type="button"
                onClick={wipe}
                className="flex min-h-12 items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-4 font-semibold text-red-700 active:bg-red-50"
              >
                <TrashIcon size={20} /> {a.privacy.deleteButton}
              </button>
            )}
          </section>
        </div>
      </dialog>
    </>
  );
}
