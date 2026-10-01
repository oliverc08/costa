import Link from "next/link";
import { app, APP } from "@/lib/i18n-app";
import type { LanguageCode } from "@/lib/languages";
import { BottomNav } from "./BottomNav";
import { ArrowLeftIcon } from "./Icons";
import { SettingsSheet } from "./SettingsSheet";

export function Logo() {
  return (
    <span className="flex items-center gap-1.5 font-display text-[24px] font-bold tracking-tight text-pine-900">
      <svg aria-hidden viewBox="0 0 24 24" width="24" height="24" fill="none" strokeLinecap="round">
        <circle cx="12" cy="8" r="3.2" className="fill-poppy-500" />
        <path d="M2.5 15.5c2.2 0 2.2-2 4.75-2s2.55 2 4.75 2 2.2-2 4.75-2 2.55 2 4.75 2" stroke="currentColor" strokeWidth="2.2" />
        <path d="M2.5 20c2.2 0 2.2-2 4.75-2s2.55 2 4.75 2 2.2-2 4.75-2 2.55 2 4.75 2" stroke="currentColor" strokeWidth="2.2" />
      </svg>
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
  const a = app(lang);
  return (
    <div lang={lang} className="mx-auto flex min-h-dvh w-full max-w-lg flex-col">
      <header className="sticky top-0 z-20 flex h-16 items-center justify-between gap-3 border-b border-stone-300 bg-paper px-5 pt-[env(safe-area-inset-top)]">
        {back ? (
          <Link href={back} className="-ml-2 flex h-11 min-w-0 items-center gap-1 rounded-full pl-1 pr-3 text-pine-900 active:bg-stone-200/60">
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
      <main className="flex flex-1 flex-col px-5 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-5">{children}</main>
      <BottomNav labels={a.nav} />
    </div>
  );
}
