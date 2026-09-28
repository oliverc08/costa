import Link from "next/link";
import { APP } from "@/lib/i18n-app";
import type { LanguageCode } from "@/lib/languages";
import { BottomNav } from "./BottomNav";
import { ArrowLeftIcon } from "./Icons";
import { SettingsSheet } from "./SettingsSheet";

export function Logo() {
  return (
    <span className="flex items-center gap-2 text-[22px] font-bold tracking-tight text-teal-900">
      <span aria-hidden className="grid h-9 w-9 place-items-center rounded-xl bg-teal-700 text-white">
        <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M3 15c2 0 2-2 4.5-2s2.5 2 4.5 2 2-2 4.5-2 2.5 2 4.5 2" />
          <path d="M3 19c2 0 2-2 4.5-2s2.5 2 4.5 2 2-2 4.5-2 2.5 2 4.5 2" />
          <circle cx="12" cy="7" r="3" />
        </svg>
      </span>
      Costa
    </span>
  );
}

export function AppShell({
  lang,
  children,
  back,
  title,
}: {
  lang: LanguageCode;
  children: React.ReactNode;
  back?: string;
  title?: string;
}) {
  const a = APP[lang];
  return (
    <div lang={lang} className="mx-auto flex min-h-dvh w-full max-w-lg flex-col">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-stone-200/70 bg-[#fbfaf7]/95 px-4 pt-[env(safe-area-inset-top)] backdrop-blur">
        {back ? (
          <Link href={back} className="-ml-2 flex h-11 min-w-0 items-center gap-1 rounded-full pl-1 pr-3 text-teal-900 active:bg-stone-200/60">
            <ArrowLeftIcon />
            <span className="truncate text-[17px] font-semibold">{title ?? a.common.back}</span>
          </Link>
        ) : (
          <Link href="/" aria-label="Costa">
            <Logo />
          </Link>
        )}
        <SettingsSheet lang={lang} />
      </header>
      <main className="flex flex-1 flex-col px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-4">{children}</main>
      <BottomNav labels={a.nav} />
    </div>
  );
}
