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
import { CheckIcon, MicIcon, PeopleIcon, PhoneIcon, RefreshIcon, SendIcon, SpeakerIcon, StopIcon } from "./Icons";
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
            className="flex items-start gap-2 rounded-xl bg-teal-50 px-3 py-2 text-[13px] leading-snug text-teal-900 active:bg-teal-100"
          >
            <CheckIcon size={16} strokeWidth={3} className="mt-0.5 shrink-0" />
            <span>
              <span className="font-semibold">{r.title}</span>
              <span className="block text-teal-700">{r.agency}</span>
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
          <li key={r.name} className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3">
            <span className="min-w-0 flex-1">
              <span className="block font-semibold leading-snug">{r.name}</span>
              {r.hours && <span className="block text-[13px] text-stone-500">{r.hours}</span>}
            </span>
            {r.phone && (
              <a href={`tel:${r.phone.replace(/[^\d+]/g, "")}`} className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-teal-700 text-white active:bg-teal-800" aria-label={r.phone}>
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
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-3 text-[15px] text-amber-950">
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

  const voice = useVoiceInput(send);

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
        <h1 className="text-[24px] font-bold">{a.ask.title}</h1>
        {messages.length > 0 && (
          <button type="button" onClick={newChat} className="flex min-h-11 items-center gap-1.5 rounded-full px-3 text-[15px] font-semibold text-teal-800 active:bg-teal-50">
            <RefreshIcon size={18} /> {a.ask.newChat}
          </button>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-4" aria-live="polite">
        {messages.length === 0 && (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1 rounded-3xl bg-teal-50 p-5">
              <p className="text-[19px] font-bold text-teal-950">{a.ask.emptyTitle}</p>
              <p className="text-[15px] text-teal-900">{a.ask.emptyBody}</p>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-[13px] font-bold uppercase tracking-wide text-stone-500">{t.commonQuestions}</p>
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="min-h-12 rounded-2xl border border-stone-200 bg-white px-4 py-3 text-left text-[16px] font-medium leading-snug active:border-teal-700 active:bg-teal-50"
                >
                  {s}
                </button>
              ))}
              <Link href="/help#person" className="flex min-h-12 items-center gap-2 rounded-2xl border border-violet-200 bg-violet-50 px-4 py-3 text-[16px] font-semibold text-violet-900 active:bg-violet-100">
                <PeopleIcon size={20} /> {a.ask.talkToPerson}
              </Link>
            </div>
          </div>
        )}

        {messages.map((m) => {
          if (m.role === "user") {
            return (
              <div key={m.id} className="flex justify-end">
                <p className="max-w-[85%] whitespace-pre-wrap rounded-3xl rounded-br-md bg-teal-700 px-4 py-2.5 text-[17px] text-white">{textOf(m)}</p>
              </div>
            );
          }
          const text = textOf(m);
          const speaking = read.speakingId === m.id;
          return (
            <div key={m.id} className="flex flex-col gap-2.5 rounded-3xl rounded-bl-md border border-stone-200 bg-white p-4 shadow-sm">
              {m.parts.map((part, i) =>
                part.type === "text" ? <RichText key={i} text={part.text} className="text-[17px]" /> : <ToolCard key={i} part={part} lang={lang} />,
              )}
              {read.available && text && status !== "streaming" && (
                <button
                  type="button"
                  onClick={() => (speaking ? read.stop() : read.speak(m.id, text))}
                  className={`flex min-h-11 items-center gap-2 self-start rounded-full px-4 text-[15px] font-semibold ${speaking ? "bg-teal-700 text-white" : "bg-stone-100 text-stone-800 active:bg-stone-200"}`}
                >
                  {speaking ? <StopIcon size={16} /> : <SpeakerIcon size={20} />}
                  {speaking ? a.common.stop : a.common.listen}
                </button>
              )}
            </div>
          );
        })}

        {status === "submitted" && (
          <div className="flex items-center gap-2 self-start rounded-3xl bg-white px-4 py-3 text-[15px] text-stone-500 shadow-sm ring-1 ring-stone-200">
            <span className="flex gap-1" aria-hidden>
              {[0, 1, 2].map((i) => (
                <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-teal-600" style={{ animationDelay: `${i * 150}ms` }} />
              ))}
            </span>
            {t.thinking}
          </div>
        )}
        {error && (
          <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-[15px] text-red-800">
            {error.message.includes("configured") ? t.notConfigured : LETTER_UI[lang].error}
          </p>
        )}
        <div ref={bottomRef} className="h-28 shrink-0" />
      </div>

      <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 border-t border-stone-200 bg-[#fbfaf7]/95 backdrop-blur">
        <div className="mx-auto flex max-w-lg flex-col gap-2 px-3 py-2.5">
          {(redactedNotice || voiceNote) && (
            <p className="rounded-xl bg-amber-50 px-3 py-2 text-[13px] text-amber-900">{voiceNote ?? t.redactedWarning}</p>
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
                  className={`grid h-12 w-12 shrink-0 place-items-center rounded-full bg-teal-700 text-white active:bg-teal-800 disabled:opacity-40 ${micHint && messages.length === 0 ? "ring-4 ring-teal-300" : ""}`}
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
                className="min-h-12 min-w-0 flex-1 rounded-full border border-stone-300 bg-white px-4 text-[17px] outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-stone-900 text-white disabled:opacity-25"
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
