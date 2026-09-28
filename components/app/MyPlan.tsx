"use client";

import { useState } from "react";
import { APP } from "@/lib/i18n-app";
import { LETTER_UI } from "@/lib/i18n";
import type { LanguageCode } from "@/lib/languages";
import { addReminder, daysFromToday, downloadIcs, removeReminder, removeStep, toggleStep, useDevice } from "@/lib/device";
import { CalendarIcon, CheckIcon, CloseIcon, PlusIcon } from "./Icons";
import { RichText } from "./RichText";

function formatDate(date: string, lang: LanguageCode) {
  const [y, m, d] = date.split("-").map(Number);
  const locale = { en: "en-US", es: "es-US", zh: "zh-CN", tl: "fil-PH", vi: "vi-VN" }[lang];
  return new Date(y, m - 1, d).toLocaleDateString(locale, { weekday: "short", month: "long", day: "numeric" });
}

export function DaysLeft({ date, lang }: { date: string; lang: LanguageCode }) {
  const l = LETTER_UI[lang];
  const days = daysFromToday(date);
  const tone = days < 0 ? "bg-stone-200 text-stone-700" : days <= 7 ? "bg-red-100 text-red-800" : days <= 21 ? "bg-amber-100 text-amber-900" : "bg-teal-100 text-teal-900";
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-[13px] font-semibold ${tone}`}>
      {days > 0 ? l.daysLeft(days) : days === 0 ? l.dueToday : l.overdue.split(".")[0]}
    </span>
  );
}

export function MyPlan({ lang }: { lang: LanguageCode }) {
  const a = APP[lang];
  const { reminders, steps } = useDevice();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const done = steps.filter((s) => s.done).length;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !date) return;
    addReminder(title.trim(), date);
    setTitle("");
    setDate("");
    setAdding(false);
  }

  const field = "min-h-12 w-full rounded-xl border border-stone-300 bg-white px-3 text-base outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-700/20";

  return (
    <section className="flex flex-col gap-3" aria-labelledby="plan-title">
      <div className="flex items-baseline justify-between">
        <h2 id="plan-title" className="text-xl font-bold">
          {a.home.planTitle}
        </h2>
        {steps.length > 0 && <span className="text-sm font-medium text-stone-500">{a.home.stepsProgress(done, steps.length)}</span>}
      </div>

      <div className="flex flex-col divide-y divide-stone-100 overflow-hidden rounded-3xl border border-stone-200 bg-white">
        {reminders.length === 0 && steps.length === 0 && !adding && <p className="px-4 py-4 text-[15px] text-stone-500">{a.home.planEmpty}</p>}

        {reminders.map((r) => (
          <div key={r.id} className="flex items-start gap-3 px-4 py-3.5">
            <span className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-amber-100 text-amber-800">
              <CalendarIcon size={20} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold leading-snug">{r.title}</p>
              <p className="mt-0.5 flex flex-wrap items-center gap-2 text-[15px] text-stone-600">
                {formatDate(r.date, lang)} <DaysLeft date={r.date} lang={lang} />
              </p>
              <button
                type="button"
                onClick={() => downloadIcs(r, "Costa")}
                className="mt-1.5 inline-flex min-h-9 items-center gap-1.5 text-[15px] font-semibold text-teal-800"
              >
                <PlusIcon size={16} /> {a.home.addToCalendar}
              </button>
            </div>
            <button type="button" onClick={() => removeReminder(r.id)} aria-label={a.common.remove} className="grid h-10 w-10 place-items-center rounded-full text-stone-400 active:bg-stone-100">
              <CloseIcon size={18} />
            </button>
          </div>
        ))}

        {steps.map((s) => (
          <div key={s.id} className="flex items-start gap-3 px-4 py-3.5">
            <button
              type="button"
              role="checkbox"
              aria-checked={s.done}
              aria-label={s.text}
              onClick={() => toggleStep(s.id)}
              className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg border-2 ${s.done ? "border-teal-700 bg-teal-700 text-white" : "border-stone-300 bg-white"}`}
            >
              {s.done && <CheckIcon size={18} strokeWidth={3} />}
            </button>
            <RichText text={s.text} className={`min-w-0 flex-1 pt-0.5 text-[16px] ${s.done ? "text-stone-400 line-through" : ""}`} />
            <button type="button" onClick={() => removeStep(s.id)} aria-label={a.common.remove} className="grid h-10 w-10 place-items-center rounded-full text-stone-400 active:bg-stone-100">
              <CloseIcon size={18} />
            </button>
          </div>
        ))}

        {adding ? (
          <form onSubmit={submit} className="flex flex-col gap-3 bg-stone-50 px-4 py-4">
            <label className="flex flex-col gap-1 text-[15px] font-medium">
              {a.home.reminderWhat}
              <input value={title} onChange={(e) => setTitle(e.currentTarget.value)} placeholder={a.home.reminderWhatPlaceholder} className={field} required maxLength={80} />
            </label>
            <label className="flex flex-col gap-1 text-[15px] font-medium">
              {a.home.reminderWhen}
              <input type="date" value={date} onChange={(e) => setDate(e.currentTarget.value)} className={field} required />
            </label>
            <div className="flex gap-2">
              <button type="submit" className="min-h-12 flex-1 rounded-xl bg-teal-700 font-semibold text-white active:bg-teal-800">
                {a.common.save}
              </button>
              <button type="button" onClick={() => setAdding(false)} className="min-h-12 rounded-xl px-4 font-semibold text-stone-600 active:bg-stone-200">
                {a.common.close}
              </button>
            </div>
          </form>
        ) : (
          <button type="button" onClick={() => setAdding(true)} className="flex min-h-14 items-center gap-2 px-4 font-semibold text-teal-800 active:bg-stone-50">
            <PlusIcon size={20} /> {a.home.addReminder}
          </button>
        )}
      </div>
    </section>
  );
}
