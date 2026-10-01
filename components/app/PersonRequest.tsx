"use client";

import { useState } from "react";
import { useDevice } from "@/lib/device";
import { letterUi, ui, LETTER_UI, UI } from "@/lib/i18n";
import { app, APP } from "@/lib/i18n-app";
import type { LanguageCode } from "@/lib/languages";
import { CheckIcon, MessageIcon, PhoneIcon } from "./Icons";

export type HelpTopic = "medi-cal" | "calfresh" | "wic" | "caleitc" | "disaster" | "other";

export interface LetterContext {
  program: "medi-cal" | "calfresh" | "wic" | "caleitc" | "disaster" | "other" | "unknown";
  noticeType: string;
  formNumber: string | null;
  deadline: string | null;
  requestedAction: string;
}

const TOPICS: HelpTopic[] = ["medi-cal", "calfresh", "wic", "caleitc", "disaster", "other"];

/**
 * "Have a person contact me": creates a handoff in the partner dashboard.
 * Asks only for what a helper needs to reach the person, and only with consent.
 */
export function PersonRequest({
  lang,
  defaultTopic = "other",
  defaultArea = "",
  letter,
}: {
  lang: LanguageCode;
  defaultTopic?: HelpTopic;
  defaultArea?: string;
  letter?: LetterContext;
}) {
  const t = ui(lang);
  const l = letterUi(lang);
  const a = app(lang);
  const { checkup } = useDevice();
  const [topic, setTopic] = useState<HelpTopic>(defaultTopic);
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState(defaultArea);
  const [note, setNote] = useState("");
  const [by, setBy] = useState<"call" | "sms">("call");
  const [shareCheckup, setShareCheckup] = useState(false);
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<{ kind: "idle" | "sending" | "error" } | { kind: "sent"; reference: string }>({ kind: "idle" });

  if (state.kind === "sent") {
    return (
      <div role="status" className="flex flex-col gap-2 rounded-md bg-pine-800 p-5 text-white">
        <CheckIcon size={28} strokeWidth={3} />
        <p className="text-[17px] leading-relaxed">
          {t.requestSent} <strong className="font-mono text-xl">{state.reference}</strong>
        </p>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState({ kind: "sending" });
    const common = { consent, language: lang, area, preferredContact: by, contact: phone };
    const body = letter
      ? { ...common, letter }
      : { ...common, topic, note: note.trim() || undefined, checkup: shareCheckup && checkup ? checkup.summary : undefined };
    const res = await fetch("/api/handoff", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }).catch(() => null);
    const data = (await res?.json().catch(() => null)) as { ok?: boolean; reference?: string } | null;
    setState(data?.ok && data.reference ? { kind: "sent", reference: data.reference } : { kind: "error" });
  }

  const field =
    "min-h-13 w-full rounded-md border border-stone-400 bg-white px-3.5 py-3 text-[17px] text-stone-900 outline-none focus:border-pine-800 focus:ring-2 focus:ring-pine-800/15";

  return (
    <form onSubmit={submit} className="flex flex-col gap-4 border-y border-stone-300 py-5">
      {!letter && (
        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-[15px] font-semibold">{a.help.topicLabel}</legend>
          <div className="flex flex-wrap gap-2">
            {TOPICS.map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={topic === k}
                onClick={() => setTopic(k)}
                className={`min-h-11 rounded-md border px-3.5 text-[15px] font-semibold ${topic === k ? "border-pine-800 bg-pine-800 text-white" : "border-stone-400 bg-white active:bg-stone-100"}`}
              >
                {a.help.topicOptions[k]}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <label className="flex flex-col gap-1.5 text-[15px] font-semibold">
        {t.phoneLabel}
        <input required type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.currentTarget.value)} placeholder="(650) 555-0100" className={field} />
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1 text-[15px] font-semibold">{l.contactBy}</legend>
        <div className="grid grid-cols-2 gap-2">
          {(["call", "sms"] as const).map((v) => (
            <button
              key={v}
              type="button"
              aria-pressed={by === v}
              onClick={() => setBy(v)}
              className={`flex min-h-13 items-center justify-center gap-2 rounded-md border py-3 font-semibold ${by === v ? "border-pine-800 bg-pine-50 text-pine-900 ring-1 ring-pine-800" : "border-stone-400 active:bg-stone-100"}`}
            >
              {v === "call" ? <PhoneIcon size={18} /> : <MessageIcon size={18} />}
              {v === "call" ? l.callMe : l.textMe}
            </button>
          ))}
        </div>
      </fieldset>

      <label className="flex flex-col gap-1.5 text-[15px] font-semibold">
        {l.areaLabel}
        <input required minLength={2} value={area} onChange={(e) => setArea(e.currentTarget.value)} placeholder="Half Moon Bay" className={field} />
      </label>

      {!letter && (
        <label className="flex flex-col gap-1.5 text-[15px] font-semibold">
          {a.help.noteLabel}
          <textarea value={note} onChange={(e) => setNote(e.currentTarget.value)} maxLength={400} rows={2} placeholder={a.help.notePlaceholder} className={`${field} resize-none`} />
        </label>
      )}

      {!letter && checkup && (
        <label className="flex items-start gap-3 text-[15px]">
          <input type="checkbox" checked={shareCheckup} onChange={(e) => setShareCheckup(e.currentTarget.checked)} className="mt-0.5 h-6 w-6 shrink-0 accent-pine-700" />
          {a.help.includeCheckup}
        </label>
      )}

      <label className="flex items-start gap-3 rounded-md bg-stone-100 p-3 text-[15px] leading-relaxed">
        <input required type="checkbox" checked={consent} onChange={(e) => setConsent(e.currentTarget.checked)} className="mt-0.5 h-6 w-6 shrink-0 accent-pine-700" />
        {t.consentLabel}
      </label>

      <p className="text-[13px] text-stone-500">{t.privacyNote}</p>

      {state.kind === "error" && (
        <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-[15px] text-red-800">
          {l.error}
        </p>
      )}
      <button type="submit" disabled={state.kind === "sending" || !consent} className="min-h-14 rounded-md bg-pine-800 text-[17px] font-bold text-white active:bg-pine-900 disabled:opacity-40">
        {state.kind === "sending" ? l.sending : t.requestHelp}
      </button>
    </form>
  );
}
