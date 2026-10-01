"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { app, APP } from "@/lib/i18n-app";
import type { LanguageCode } from "@/lib/languages";
import {
  BasketIcon,
  FlameIcon,
  HeartIcon,
  HomeIcon,
  PeopleIcon,
  ChatIcon,
} from "./Icons";
import { HoldToSpeak } from "./HoldToSpeak";

const BIG = [
  { key: "food" as const, href: "/topics/food", Icon: BasketIcon },
  { key: "health" as const, href: "/topics/health", Icon: HeartIcon },
  { key: "housing" as const, href: "/help?topic=other", Icon: HomeIcon },
  { key: "family" as const, href: "/check", Icon: PeopleIcon },
  { key: "disaster" as const, href: "/topics/disaster", Icon: FlameIcon },
  { key: "other" as const, href: "/ask", Icon: ChatIcon },
];

export const PENDING_VOICE_KEY = "costa_pending_voice";

/** Voice-first home: huge mic + topic tiles. Letter, checkup, and plan live on their own tabs. */
export function VoiceHome({ lang }: { lang: LanguageCode }) {
  const a = app(lang);
  const router = useRouter();

  function onSpeech(text: string) {
    sessionStorage.setItem(PENDING_VOICE_KEY, text);
    router.push("/ask");
  }

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col items-center gap-5 pt-2 select-none [-webkit-touch-callout:none]">
        <h1 className="text-center text-[28px] leading-tight text-pine-950">{a.home.voicePrompt}</h1>
        <HoldToSpeak lang={lang} onText={onSpeech} />
        <Link href="/ask" className="text-[16px] font-medium text-pine-800 underline decoration-pine-300 underline-offset-4">
          {a.home.orType}
        </Link>
      </section>

      <section className="flex flex-col gap-3" aria-labelledby="topics-title">
        <h2 id="topics-title" className="text-[21px] text-pine-950">
          {a.home.topicsTitle}
        </h2>
        <ul className="grid grid-cols-2 gap-3.5">
          {BIG.map(({ key, href, Icon }) => (
            <li key={key}>
              <Link
                href={href}
                className="flex min-h-[6.75rem] flex-col items-start justify-between gap-3 rounded-md border border-stone-400 bg-white p-4 active:bg-stone-100"
              >
                <Icon size={28} strokeWidth={1.8} className="text-pine-800" />
                <span className="text-[18px] font-semibold leading-snug text-pine-950">{a.home.bigTopics[key]}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <Link href="/how" className="text-center text-[14px] font-medium text-stone-500 underline underline-offset-2">
        {a.home.howItWorks}
      </Link>
    </div>
  );
}
