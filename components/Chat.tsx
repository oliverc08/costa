"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useRef, useState } from "react";
import type { UiStrings } from "@/lib/i18n";
import { redact } from "@/lib/safety/redact";

const STORAGE_KEY = "costa_chat_v1";

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
  languagesNote: string;
}

function Linkified({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s)]+)/g);
  return (
    <>
      {parts.map((p, i) =>
        /^https?:\/\//.test(p) ? (
          <a
            key={i}
            href={p}
            target="_blank"
            rel="noreferrer"
            className="break-all text-teal-800 underline underline-offset-2"
          >
            {p}
          </a>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

function ToolCard({ part, t }: { part: UIMessage["parts"][number]; t: UiStrings }) {
  if (!("state" in part) || part.state !== "output-available") return null;
  const output = (part as { output: unknown }).output as Record<string, unknown>;

  if (part.type === "tool-searchBenefits") {
    const results = ((output?.results as SourceResult[]) ?? []).filter(
      (r, i, arr) => arr.findIndex((x) => x.sourceId === r.sourceId) === i,
    );
    if (!output?.found || results.length === 0) return null;
    return (
      <div className="mt-2 flex flex-wrap gap-2" aria-label={t.sources}>
        {results.slice(0, 3).map((r) => (
          <a
            key={r.sourceId}
            href={r.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs text-teal-900 hover:bg-teal-100"
            title={`Last verified ${r.lastVerified}`}
          >
            <span aria-hidden>✓</span>
            <span className="font-medium">{r.agency}</span>
            <span className="text-teal-700">· {r.title}</span>
          </a>
        ))}
      </div>
    );
  }

  if (part.type === "tool-findLocalHelp") {
    const results = (output?.results as HelpResult[]) ?? [];
    if (results.length === 0) return null;
    return (
      <ul className="mt-2 grid gap-2 sm:grid-cols-2">
        {results.slice(0, 4).map((r) => (
          <li key={r.name} className="rounded-xl border border-stone-200 bg-white p-3 text-sm">
            <p className="font-semibold text-stone-900">{r.name}</p>
            {r.phone && (
              <a href={`tel:${r.phone.replace(/[^\d+]/g, "")}`} className="block text-teal-800 underline">
                {r.phone}
              </a>
            )}
            {r.hours && <p className="text-stone-600">{r.hours}</p>}
            <p className="text-xs text-stone-500">{r.languagesNote}</p>
          </li>
        ))}
      </ul>
    );
  }

  if (part.type === "tool-createHumanHandoff" && output?.ok) {
    return (
      <div className="mt-2 rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
        {t.requestSent} <strong className="font-mono">{String(output.reference)}</strong>
      </div>
    );
  }

  return null;
}

export function Chat({ t, suggestions }: { t: UiStrings; suggestions: string[] }) {
  const [input, setInput] = useState("");
  const [redactedNotice, setRedactedNotice] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status, error, setMessages } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setMessages(JSON.parse(saved) as UIMessage[]);
      } catch {
        sessionStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [setMessages]);

  useEffect(() => {
    if (messages.length) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages]);

  const busy = status === "submitted" || status === "streaming";

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    const r = redact(trimmed);
    setRedactedNotice(r.redacted);
    sendMessage({ text: r.text });
    setInput("");
  }

  return (
    <section className="flex flex-col rounded-3xl border border-stone-200 bg-stone-50/80 shadow-sm">
      <div className="flex max-h-[28rem] min-h-[14rem] flex-col gap-4 overflow-y-auto p-4 sm:p-6" aria-live="polite">
        {messages.length === 0 && (
          <div className="flex flex-col gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">{t.commonQuestions}</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border border-stone-300 bg-white px-4 py-2 text-left text-sm text-stone-800 hover:border-teal-500 hover:text-teal-900"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={
                m.role === "user"
                  ? "max-w-[85%] rounded-2xl rounded-br-sm bg-teal-700 px-4 py-2.5 text-white"
                  : "max-w-[95%] text-stone-900"
              }
            >
              {m.parts.map((part, i) =>
                part.type === "text" ? (
                  <p key={i} className="whitespace-pre-wrap leading-relaxed">
                    <Linkified text={part.text} />
                  </p>
                ) : (
                  <ToolCard key={i} part={part} t={t} />
                ),
              )}
            </div>
          </div>
        ))}

        {status === "submitted" && <p className="animate-pulse text-sm text-stone-500">{t.thinking}</p>}
        {error && <p className="text-sm text-red-700">{error.message.includes("configured") ? t.notConfigured : error.message}</p>}
        <div ref={bottomRef} />
      </div>

      {redactedNotice && (
        <p className="mx-4 mb-2 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900 sm:mx-6">{t.redactedWarning}</p>
      )}

      <form
        className="flex gap-2 border-t border-stone-200 p-3 sm:p-4"
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
      >
        <label htmlFor="costa-input" className="sr-only">
          {t.askPlaceholder}
        </label>
        <input
          id="costa-input"
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          placeholder={t.askPlaceholder}
          autoComplete="off"
          className="min-w-0 flex-1 rounded-full border border-stone-300 bg-white px-4 py-3 text-base outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="rounded-full bg-teal-700 px-5 py-3 font-medium text-white hover:bg-teal-800 disabled:opacity-40"
        >
          {t.send}
        </button>
      </form>
      <p className="px-4 pb-3 text-xs text-stone-500 sm:px-6">{t.privacyNote}</p>
    </section>
  );
}
