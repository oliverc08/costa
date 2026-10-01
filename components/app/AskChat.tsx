"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CHAT_STORAGE_KEY } from "@/lib/device";
import { LETTER_UI, UI } from "@/lib/i18n";
import { APP } from "@/lib/i18n-app";
import type { LanguageCode } from "@/lib/languages";
import { redact } from "@/lib/safety/redact";
import { useReadAloud } from "@/lib/speech";
import { HoldToSpeak } from "./HoldToSpeak";
import { PENDING_VOICE_KEY } from "./VoiceHome";
import {
  ArrowRightIcon,
  BasketIcon,
  ChatIcon,
  CheckIcon,
  FlameIcon,
  HeartIcon,
  HomeIcon,
  PeopleIcon,
  PhoneIcon,
  RefreshIcon,
  SendIcon,
  SpeakerIcon,
  StopIcon,
} from "./Icons";
import { RichText } from "./RichText";

interface SourceResult {
  sourceId: string;
  title: string;
  agency: string;
  url: string;
  lastVerified: string;
}

interface HelpResult {
  name: string;
  phone: string | null;
  url: string | null;
  hours: string | null;
}

function ToolCard({ part, lang }: { part: UIMessage["parts"][number]; lang: LanguageCode }) {
  const t = UI[lang];
  if (!("state" in part) || part.state !== "output-available") return null;
  const output = (part as { output: unknown }).output as Record<string, unknown>;

  if (part.type === "tool-searchBenefits") {
    const results = ((output?.results as SourceResult[]) ?? []).filter((r, i, arr) => arr.findIndex((x) => x.sourceId === r.sourceId) === i);
    if (!output?.found || results.length === 0) return null;
    return (
      <div className="flex flex-col gap-1.5" aria-label={t.sources}>
        {results.slice(0, 3).map((r) => {
          const d = new Date(`${r.lastVerified}T12:00:00`);
          const when = Number.isNaN(d.getTime()) ? r.lastVerified : d.toLocaleDateString(lang === "zh" ? "zh-CN" : "en-US", { month: "short", year: "numeric" });
          return (
            <a key={r.sourceId} href={r.url} target="_blank" rel="noreferrer" className="flex items-start gap-2 text-[13px] leading-snug text-stone-600">
              <CheckIcon size={15} strokeWidth={3} className="mt-0.5 shrink-0 text-pine-700" />
              <span>
                <span className="font-semibold text-stone-800 underline decoration-stone-300 underline-offset-2">{r.title}</span>
                <span className="block">
                  {r.agency} · {when}
                </span>
              </span>
            </a>
          );
        })}
      </div>
    );
  }

  if (part.type === "tool-findLocalHelp") {
    const results = (output?.results as HelpResult[]) ?? [];
    if (results.length === 0) return null;
    return (
      <ul className="flex flex-col gap-2">
        {results.slice(0, 3).map((r) => (
          <li key={r.name} className="flex items-center gap-3 rounded-md border border-stone-300 bg-white p-3">
            <span className="min-w-0 flex-1">
              <span className="block font-semibold leading-snug">{r.name}</span>
              {r.hours && <span className="block text-[13px] text-stone-500">{r.hours}</span>}
            </span>
            {r.phone && (
              <a href={`tel:${r.phone.replace(/[^\d+]/g, "")}`} className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-pine-800 text-white active:bg-pine-900" aria-label={r.phone}>
                <PhoneIcon size={20} />
              </a>
            )}
          </li>
        ))}
      </ul>
    );
  }

  if (part.type === "tool-createHumanHandoff" && output?.ok) {
    return (
      <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-[15px] text-amber-950">
        {t.requestSent} <strong className="font-mono">{String(output.reference)}</strong>
      </div>
    );
  }
  return null;
}

const textOf = (m: UIMessage) => m.parts.map((p) => (p.type === "text" ? p.text : "")).join("\n").trim();

const BIG = [
  { key: "food" as const, href: "/topics/food", Icon: BasketIcon },
  { key: "health" as const, href: "/topics/health", Icon: HeartIcon },
  { key: "housing" as const, href: "/help?topic=other", Icon: HomeIcon },
  { key: "family" as const, href: "/check", Icon: PeopleIcon },
  { key: "disaster" as const, href: "/topics/disaster", Icon: FlameIcon },
  { key: "other" as const, prompt: true, Icon: ChatIcon },
];

export function AskChat({ lang, suggestions, micHint }: { lang: LanguageCode; suggestions: string[]; micHint: boolean }) {
  const t = UI[lang];
  const a = APP[lang];
  const [input, setInput] = useState("");
  const [redactedNotice, setRedactedNotice] = useState(false);
  const [showType, setShowType] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const spokenIds = useRef(new Set<string>());
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat", body: { language: lang } }), [lang]);
  const { messages, sendMessage, status, error, setMessages, stop: stopStream } = useChat({ transport });
  const read = useReadAloud(lang);
  const busy = status === "submitted" || status === "streaming";

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || busy) return;
      const r = redact(trimmed);
      setRedactedNotice(r.redacted);
      read.stop();
      void sendMessage({ text: r.text });
      setInput("");
      setShowType(false);
    },
    [busy, read, sendMessage],
  );

  useEffect(() => {
    const pending = sessionStorage.getItem(PENDING_VOICE_KEY);
    if (pending) {
      sessionStorage.removeItem(PENDING_VOICE_KEY);
      queueMicrotask(() => send(pending));
      return;
    }
    const saved = sessionStorage.getItem(CHAT_STORAGE_KEY);
    if (!saved) return;
    try {
      setMessages(JSON.parse(saved) as UIMessage[]);
    } catch {
      sessionStorage.removeItem(CHAT_STORAGE_KEY);
    }
  }, [send, setMessages]);

  useEffect(() => {
    if (messages.length) sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, status]);

  // Auto-speak finished assistant replies so the journey works without reading.
  useEffect(() => {
    if (!read.available || status === "streaming" || status === "submitted") return;
    const last = messages[messages.length - 1];
    if (!last || last.role !== "assistant") return;
    const text = textOf(last);
    if (!text || spokenIds.current.has(last.id)) return;
    spokenIds.current.add(last.id);
    read.speak(last.id, text);
  }, [messages, status, read]);

  function newChat() {
    stopStream();
    read.stop();
    setMessages([]);
    spokenIds.current.clear();
    sessionStorage.removeItem(CHAT_STORAGE_KEY);
    setRedactedNotice(false);
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between pb-3">
        <h1 className="text-[28px] leading-tight text-pine-950">{messages.length ? a.ask.title : a.home.voicePrompt}</h1>
        {messages.length > 0 && (
          <button type="button" onClick={newChat} className="flex min-h-11 items-center gap-1.5 rounded-md px-3 text-[15px] font-semibold text-pine-800 active:bg-pine-50">
            <RefreshIcon size={18} /> {a.ask.newChat}
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4" aria-live="polite">
        {messages.length === 0 && (
          <div className="flex flex-col gap-6">
            <HoldToSpeak lang={lang} onText={send} />
            {!showType ? (
              <button type="button" onClick={() => setShowType(true)} className="text-center text-[16px] font-medium text-pine-800 underline decoration-pine-300 underline-offset-4">
                {a.home.orType}
              </button>
            ) : (
              <form
                className="flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input);
                }}
              >
                <input
                  value={input}
                  onChange={(e) => setInput(e.currentTarget.value)}
                  placeholder={t.askPlaceholder}
                  autoFocus
                  className="min-h-12 min-w-0 flex-1 rounded-md border border-stone-400 bg-white px-3.5 text-[17px] outline-none focus:border-pine-800"
                />
                <button type="submit" disabled={!input.trim()} className="grid h-12 w-12 place-items-center rounded-md bg-stone-900 text-white disabled:opacity-25" aria-label={t.send}>
                  <SendIcon size={20} />
                </button>
              </form>
            )}

            <div className="flex flex-col gap-3">
              <p className="text-[17px] font-semibold text-pine-950">{a.home.topicsTitle}</p>
              <ul className="grid grid-cols-2 gap-3">
                {BIG.map(({ key, href, Icon, prompt }) => (
                  <li key={key}>
                    {prompt ? (
                      <button
                        type="button"
                        onClick={() => setShowType(true)}
                        className="flex min-h-[5.5rem] w-full flex-col items-start justify-between gap-2 rounded-md border border-stone-400 bg-white p-3 text-left active:bg-stone-100"
                      >
                        <Icon size={24} strokeWidth={1.8} className="text-pine-800" />
                        <span className="text-[16px] font-semibold">{a.home.bigTopics[key]}</span>
                      </button>
                    ) : (
                      <Link href={href!} className="flex min-h-[5.5rem] flex-col items-start justify-between gap-2 rounded-md border border-stone-400 bg-white p-3 active:bg-stone-100">
                        <Icon size={24} strokeWidth={1.8} className="text-pine-800" />
                        <span className="text-[16px] font-semibold">{a.home.bigTopics[key]}</span>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col">
              <p className="pb-1 text-[13px] font-semibold uppercase tracking-wider text-stone-500">{t.commonQuestions}</p>
              <ul className="divide-y divide-stone-300 border-y border-stone-300">
                {suggestions.slice(0, 4).map((s) => (
                  <li key={s}>
                    <button type="button" onClick={() => send(s)} className="-mx-2 flex min-h-14 w-[calc(100%+1rem)] items-center gap-3 px-2 py-3 text-left text-[16px] leading-snug active:bg-stone-200/50">
                      <span className="flex-1">{s}</span>
                      <ArrowRightIcon size={18} className="shrink-0 text-stone-400" />
                    </button>
                  </li>
                ))}
              </ul>
              <Link href="/help#person" className="mt-4 flex min-h-12 items-center gap-2 text-[16px] font-semibold text-pine-800 underline decoration-pine-300 underline-offset-4">
                <PeopleIcon size={20} /> {a.ask.talkToPerson}
              </Link>
            </div>
            {micHint && <p className="sr-only">{a.ask.micStart}</p>}
          </div>
        )}

        {messages.map((m) => {
          if (m.role === "user") {
            return (
              <div key={m.id} className="flex justify-end">
                <p className="max-w-[85%] whitespace-pre-wrap rounded-md bg-stone-200 px-4 py-2.5 text-[17px] text-stone-900">{textOf(m)}</p>
              </div>
            );
          }
          const text = textOf(m);
          const speaking = read.speakingId === m.id;
          return (
            <div key={m.id} className="flex flex-col gap-2.5 border-l-2 border-pine-700 pl-4">
              <p className="text-[12px] font-semibold uppercase tracking-wider text-pine-700">Costa</p>
              {m.parts.map((part, i) =>
                part.type === "text" ? <RichText key={i} text={part.text} className="text-[17px]" /> : <ToolCard key={i} part={part} lang={lang} />,
              )}
              {read.available && text && status !== "streaming" && (
                <button
                  type="button"
                  onClick={() => (speaking ? read.stop() : read.speak(m.id, text))}
                  className={`flex min-h-11 items-center gap-2 self-start rounded-md border px-3.5 text-[15px] font-semibold ${speaking ? "border-pine-800 bg-pine-800 text-white" : "border-stone-300 text-stone-800 active:bg-stone-200"}`}
                >
                  {speaking ? <StopIcon size={16} /> : <SpeakerIcon size={20} />}
                  {speaking ? a.common.stop : a.common.listen}
                </button>
              )}
            </div>
          );
        })}

        {status === "submitted" && (
          <div className="flex items-center gap-2 self-start border-l-2 border-pine-700 py-1 pl-4 text-[15px] text-stone-500">
            <span className="animate-pulse">{t.thinking}</span>
          </div>
        )}
        {error && (
          <p role="alert" className="rounded-md bg-red-50 px-4 py-3 text-[15px] text-red-800">
            {error.message.includes("configured") ? t.notConfigured : LETTER_UI[lang].error}
          </p>
        )}
        <div ref={bottomRef} className="h-28 shrink-0" />
      </div>

      {messages.length > 0 && (
        <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 border-t border-stone-300 bg-paper">
          <div className="mx-auto flex max-w-lg flex-col gap-2 px-5 py-2.5">
            {redactedNotice && <p className="rounded-md bg-amber-50 px-3 py-2 text-[13px] text-amber-900">{t.redactedWarning}</p>}
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              <HoldToSpeak lang={lang} onText={send} size="bar" />
              <label htmlFor="costa-input" className="sr-only">
                {t.askPlaceholder}
              </label>
              <input
                id="costa-input"
                value={input}
                onChange={(e) => setInput(e.currentTarget.value)}
                placeholder={t.askPlaceholder}
                autoComplete="off"
                enterKeyHint="send"
                disabled={busy}
                className="min-h-12 min-w-0 flex-1 rounded-md border border-stone-400 bg-white px-3.5 text-[17px] outline-none focus:border-pine-800 focus:ring-2 focus:ring-pine-800/15"
              />
              <button type="submit" disabled={busy || !input.trim()} className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-stone-900 text-white disabled:opacity-25" aria-label={t.send}>
                <SendIcon size={20} />
              </button>
            </form>
            <p className="text-center text-[12px] text-stone-500">{t.privacyNote}</p>
          </div>
        </div>
      )}
    </div>
  );
}
