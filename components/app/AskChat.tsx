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
import { useReadAloud, useVoiceInput } from "@/lib/speech";
import { ArrowRightIcon, CheckIcon, MicIcon, PeopleIcon, PhoneIcon, RefreshIcon, SendIcon, SpeakerIcon, StopIcon } from "./Icons";
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
        {results.slice(0, 3).map((r) => (
          <a
            key={r.sourceId}
            href={r.url}
            target="_blank"
            rel="noreferrer"
            className="flex items-start gap-2 text-[13px] leading-snug text-stone-600"
          >
            <CheckIcon size={15} strokeWidth={3} className="mt-0.5 shrink-0 text-pine-700" />
            <span>
              <span className="font-semibold text-stone-800 underline decoration-stone-300 underline-offset-2">{r.title}</span>
              <span className="block">{r.agency}</span>
            </span>
          </a>
        ))}
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
              <a href={`tel:${r.phone.replace(/[^\d+]/g, "")}`} className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-pine-800 text-white active:bg-pine-900" aria-label={r.phone}>
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

export function AskChat({ lang, suggestions, micHint }: { lang: LanguageCode; suggestions: string[]; micHint: boolean }) {
  const t = UI[lang];
  const a = APP[lang];
  const [input, setInput] = useState("");
  const [redactedNotice, setRedactedNotice] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat", body: { language: lang } }), [lang]);
  const { messages, sendMessage, status, error, setMessages, stop: stopStream } = useChat({ transport });
  const read = useReadAloud(lang);
  const busy = status === "submitted" || status === "streaming";

  useEffect(() => {
    const saved = sessionStorage.getItem(CHAT_STORAGE_KEY);
    if (!saved) return;
    try {
      setMessages(JSON.parse(saved) as UIMessage[]);
    } catch {
      sessionStorage.removeItem(CHAT_STORAGE_KEY);
    }
  }, [setMessages]);

  useEffect(() => {
    if (messages.length) sessionStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, status]);

  const send = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || busy) return;
      const r = redact(trimmed);
      setRedactedNotice(r.redacted);
      read.stop();
      void sendMessage({ text: r.text });
      setInput("");
    },
    [busy, read, sendMessage],
  );

  const voice = useVoiceInput(lang, send);

  function newChat() {
    stopStream();
    read.stop();
    setMessages([]);
    sessionStorage.removeItem(CHAT_STORAGE_KEY);
    setRedactedNotice(false);
  }

  const voiceNote =
    voice.state === "error" ? a.ask.micError : voice.state === "blocked" ? a.ask.micBlocked : voice.state === "unavailable" ? t.notConfigured : null;

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between pb-3">
        <h1 className="text-[28px] leading-tight text-pine-950">{a.ask.title}</h1>
        {messages.length > 0 && (
          <button type="button" onClick={newChat} className="flex min-h-11 items-center gap-1.5 rounded-full px-3 text-[15px] font-semibold text-pine-800 active:bg-pine-50">
            <RefreshIcon size={18} /> {a.ask.newChat}
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4" aria-live="polite">
        {messages.length === 0 && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <p className="text-[18px] font-semibold text-pine-950">{a.ask.emptyTitle}</p>
              <p className="text-[15px] text-stone-600">{a.ask.emptyBody}</p>
            </div>
            <div className="flex flex-col">
              <p className="pb-1 text-[13px] font-semibold uppercase tracking-wider text-stone-500">{t.commonQuestions}</p>
              <ul className="divide-y divide-stone-300 border-y border-stone-300">
                {suggestions.map((s) => (
                  <li key={s}>
                    <button
                      type="button"
                      onClick={() => send(s)}
                      className="-mx-2 flex min-h-14 w-[calc(100%+1rem)] items-center gap-3 px-2 py-3 text-left text-[16px] leading-snug active:bg-stone-200/50"
                    >
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

      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 border-t border-stone-300 bg-paper">
        <div className="mx-auto flex max-w-lg flex-col gap-2 px-5 py-2.5">
          {(redactedNotice || voiceNote) && (
            <p className="rounded-md bg-amber-50 px-3 py-2 text-[13px] text-amber-900">{voiceNote ?? t.redactedWarning}</p>
          )}
          {voice.state === "recording" || voice.state === "transcribing" ? (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={voice.stop}
                disabled={voice.state === "transcribing"}
                className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-red-600 text-white disabled:bg-stone-400"
                style={voice.state === "recording" ? { animation: "pulse-ring 1.2s ease-out infinite" } : undefined}
                aria-label={a.ask.micStop}
              >
                <StopIcon size={20} />
              </button>
              <p className="flex-1 text-[16px] font-semibold text-stone-800">{voice.state === "recording" ? a.ask.micStop : a.ask.transcribing}</p>
              {voice.state === "recording" && (
                <button type="button" onClick={voice.cancel} className="min-h-11 rounded-full px-3 font-semibold text-stone-600">
                  {a.common.close}
                </button>
              )}
            </div>
          ) : (
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
            >
              {voice.supported && (
                <button
                  type="button"
                  onClick={() => {
                    voice.reset();
                    void voice.start();
                  }}
                  disabled={busy}
                  className={`grid h-12 w-12 shrink-0 place-items-center rounded-md bg-pine-800 text-white active:bg-pine-900 disabled:opacity-40 ${micHint && messages.length === 0 ? "ring-4 ring-poppy-300" : ""}`}
                  aria-label={a.ask.micStart}
                >
                  <MicIcon size={22} />
                </button>
              )}
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
                className="min-h-12 min-w-0 flex-1 rounded-md border border-stone-400 bg-white px-3.5 text-[17px] outline-none focus:border-pine-800 focus:ring-2 focus:ring-pine-800/15"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="grid h-12 w-12 shrink-0 place-items-center rounded-md bg-stone-900 text-white disabled:opacity-25"
                aria-label={t.send}
              >
                <SendIcon size={20} />
              </button>
            </form>
          )}
          <p className="text-center text-[12px] text-stone-500">{t.privacyNote}</p>
        </div>
      </div>
    </div>
  );
}
