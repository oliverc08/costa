"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { addReminder, downloadIcs } from "@/lib/device";
import { letterUi, ui, LETTER_UI, UI } from "@/lib/i18n";
import { app, APP } from "@/lib/i18n-app";
import type { LanguageCode } from "@/lib/languages";
import type { LetterResult } from "@/lib/letters";
import { CalendarIcon, CameraIcon, CheckIcon, ExternalIcon, PhoneIcon, PlusIcon, SpeakerIcon, StopIcon } from "./app/Icons";
import { HumanHandoff } from "./app/HumanHandoff";
import { PersonRequest } from "./app/PersonRequest";
import { APPLY } from "@/lib/checkup";
import { useReadAloud } from "@/lib/speech";

type Phase =
  | { kind: "idle" }
  | { kind: "ready"; file: File; preview: string | null }
  | { kind: "analyzing"; preview: string | null }
  | { kind: "done"; result: LetterResult; preview: string | null }
  | { kind: "error"; message: string };

const MAX_EDGE = 2000;

type Prepared = { blob: Blob; filename: string };

/** Shrinks photos / rasterizes PDF page 1 to JPEG for on-device OCR. */
async function prepareImage(file: File): Promise<Prepared | null> {
  const name = file.name.toLowerCase();
  if (file.type === "application/pdf" || name.endsWith(".pdf")) {
    try {
      const { pdfFirstPageToJpeg } = await import("@/lib/pdf-to-image");
      const blob = await pdfFirstPageToJpeg(file);
      if (!blob) return null;
      return { blob, filename: "letter.jpg" };
    } catch (error) {
      console.error("[letter] pdf rasterize failed", error);
      return null;
    }
  }
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
    if (!blob) return null;
    return { blob, filename: "letter.jpg" };
  } catch {
    if (/^image\/(jpeg|png|webp|gif)$/i.test(file.type)) {
      return { blob: file, filename: name.endsWith(".png") ? "letter.png" : "letter.jpg" };
    }
    return null;
  }
}

export function LetterUpload({ lang }: { lang: LanguageCode }) {
  const t = ui(lang);
  const l = letterUi(lang);
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);
  const analyzing = useRef(false);

  const preview = "preview" in phase ? phase.preview : null;
  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  async function runAnalyze(file: File, previewUrl: string | null) {
    if (analyzing.current) return;
    analyzing.current = true;
    setPhase({ kind: "analyzing", preview: previewUrl });
    try {
      const prepared = await prepareImage(file);
      if (!prepared) {
        setPhase({ kind: "error", message: l.unreadable });
        return;
      }
      // Local-first: on-device OCR + heuristic explain (no cloud vision).
      try {
        const { ocrLetterImage } = await import("@/lib/letter-ocr");
        const text = await ocrLetterImage(prepared.blob, lang);
        if (!text || text.length < 20) {
          setPhase({ kind: "error", message: l.unreadable });
          return;
        }
        const local = await fetch("/api/letter-text", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ text, language: lang }),
        });
        if (!local.ok) {
          setPhase({ kind: "error", message: l.error });
          return;
        }
        setPhase({ kind: "done", result: (await local.json()) as LetterResult, preview: previewUrl });
      } catch (error) {
        console.error("[letter] local OCR failed", error);
        setPhase({ kind: "error", message: l.error });
      }
    } catch {
      setPhase({ kind: "error", message: l.error });
    } finally {
      analyzing.current = false;
    }
  }

  function choose(file: File | undefined) {
    if (!file) return;
    analyzing.current = false;
    const isImage = file.type.startsWith("image/") || /\.(jpe?g|png|webp|gif|heic|heif)$/i.test(file.name);
    const previewUrl = isImage ? URL.createObjectURL(file) : null;
    setPhase({ kind: "ready", file, preview: previewUrl });
    // Mobile: don't make people find a second button — start reading right away.
    void runAnalyze(file, previewUrl);
  }

  function reset() {
    analyzing.current = false;
    setPhase({ kind: "idle" });
    if (inputRef.current) inputRef.current.value = "";
  }

  function cancelAnalyze() {
    analyzing.current = false;
    setPhase({ kind: "idle" });
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-5">
      {(phase.kind === "idle" || phase.kind === "error") && (
        <>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-md border-2 border-dashed border-pine-600/50 bg-white px-6 py-14 text-center hover:border-pine-600 hover:bg-pine-50/50">
            <span aria-hidden className="grid h-16 w-16 place-items-center rounded-md bg-pine-50 text-pine-800">
              <CameraIcon size={34} />
            </span>
            <span className="text-lg font-semibold text-pine-900">{t.letterChoose}</span>
            <span className="text-sm text-stone-500">Photo works best · JPG · PNG · HEIC · PDF</span>
            <input
              ref={inputRef}
              type="file"
              accept="image/*,image/heic,image/heif,application/pdf"
              capture="environment"
              className="sr-only"
              onChange={(e) => choose(e.currentTarget.files?.[0])}
            />
          </label>
          {phase.kind === "error" && (
            <p role="alert" className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-800">
              {phase.message}
            </p>
          )}
        </>
      )}

      {(phase.kind === "ready" || phase.kind === "analyzing") && (
        <div className="flex flex-col gap-4">
          {phase.preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
            <img src={phase.preview} alt="" className="max-h-80 w-full rounded-md border border-stone-300 object-contain bg-white" />
          ) : (
            <p className="rounded-md border border-stone-300 bg-white px-4 py-6 text-center text-stone-600">PDF</p>
          )}
          <p className="text-center text-[16px] font-medium text-pine-900">{t.letterAnalyzing}</p>
          <div className="h-1.5 overflow-hidden rounded-full bg-stone-200">
            <div className="h-full w-1/3 animate-[pulse_1.2s_ease-in-out_infinite] rounded-full bg-pine-600" />
          </div>
          <button type="button" onClick={cancelAnalyze} className="self-center rounded-md px-5 py-3 font-semibold text-stone-600 hover:text-stone-900">
            {l.back}
          </button>
        </div>
      )}

      {phase.kind === "done" && <LetterResultView result={phase.result} lang={lang} onReset={reset} />}
    </div>
  );
}

function DeadlineBadge({ days, label, lang }: { days: number | null; label: string; lang: LanguageCode }) {
  const l = letterUi(lang);
  const urgent = days !== null && days <= 10;
  return (
    <div className={`rounded-md p-4 ${urgent ? "bg-red-50 text-red-900" : "bg-amber-50 text-amber-950"}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{ui(lang).deadline}</p>
      <p className="mt-1 text-lg font-semibold">{label}</p>
      {days !== null && (
        <p className="mt-1 text-sm font-medium">
          {days > 0 ? l.daysLeft(days) : days === 0 ? l.dueToday : l.overdue}
        </p>
      )}
    </div>
  );
}

function LetterResultView({ result, lang, onReset }: { result: LetterResult; lang: LanguageCode; onReset: () => void }) {
  const t = ui(lang);
  const l = letterUi(lang);
  const a = app(lang);
  const letter = a.letter;
  const read = useReadAloud(lang);
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  if (!result.ok) {
    return (
      <div className="flex flex-col gap-4">
        <p role="alert" className="rounded-md bg-amber-50 px-4 py-3 text-amber-900">
          {result.reason === "unreadable" ? l.unreadable : l.notLetter}
        </p>
        <button type="button" onClick={onReset} className="self-start rounded-md bg-pine-800 px-5 py-3 font-semibold text-white">
          {l.another}
        </button>
      </div>
    );
  }

  const { explanation: e, extraction: x } = result;
  const noticeKey = x.noticeType in letter.noticeTypes ? x.noticeType : "other";
  const speakText = [e.whatThisMeans, e.deadline, e.whatToDo.join(". "), e.needHelp].filter(Boolean).join(". ");
  const speaking = read.speakingId === "letter-explain";
  const programKey = x.program === "medi-cal" || x.program === "calfresh" || x.program === "wic" || x.program === "caleitc" ? x.program : null;
  const apply = programKey ? APPLY[programKey] : null;

  useEffect(() => {
    if (!read.available) return;
    // Letter page: auto-speak is the demo win (Spanish parent hears the explanation).
    const timer = window.setTimeout(() => read.speak("letter-explain", speakText), 500);
    return () => {
      window.clearTimeout(timer);
      read.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- speak once when this result mounts
  }, []);

  return (
    <div className="flex flex-col gap-4" aria-live="polite">
      <p className="rounded-md bg-pine-800 px-4 py-3 text-[15px] font-medium leading-snug text-white">
        <span className="block text-[12px] font-semibold uppercase tracking-wider text-pine-200">{letter.noticeLabel}</span>
        <span className="mt-1 block text-[17px] font-semibold">{letter.noticeTypes[noticeKey]}</span>
        {x.formNumber && <span className="mt-1 block text-[13px] text-pine-100">{x.formNumber}{x.agency ? ` · ${x.agency}` : ""}</span>}
      </p>

      <section className="rounded-md border border-stone-300 bg-white p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-sans text-[13px] font-semibold uppercase tracking-wider text-poppy-700">{t.whatThisMeans}</h2>
          {read.available && (
            <button
              type="button"
              onClick={() => (speaking ? read.stop() : read.speak("letter-explain", speakText))}
              className={`flex min-h-11 shrink-0 items-center gap-1.5 rounded-md border px-3 text-[14px] font-semibold ${
                speaking ? "border-pine-800 bg-pine-800 text-white" : "border-stone-400 text-pine-950 active:bg-stone-100"
              }`}
            >
              {speaking ? <StopIcon size={16} /> : <SpeakerIcon size={18} />}
              {speaking ? a.common.stop : a.common.listen}
            </button>
          )}
        </div>
        <p className="mt-2 text-lg leading-relaxed text-stone-900">{e.whatThisMeans}</p>
      </section>

      {e.deadline && (
        <div className="flex flex-col gap-2">
          <DeadlineBadge days={result.daysUntilDeadline} label={e.deadline} lang={lang} />
          <SaveDeadline result={result} lang={lang} />
        </div>
      )}

      <section className="rounded-md border-2 border-pine-800 bg-white p-5 sm:p-6">
        <h2 className="font-sans text-[13px] font-semibold uppercase tracking-wider text-pine-800">{letter.requiredAction}</h2>
        <p className="mt-2 text-[18px] font-semibold leading-snug text-pine-950">{x.requestedAction}</p>
        {(apply || x.contactPhone) && (
          <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {apply && (
              <a
                href={apply.url}
                target="_blank"
                rel="noreferrer"
                className="flex min-h-12 items-center justify-center gap-1.5 rounded-md bg-pine-800 px-3 text-[15px] font-semibold text-white active:bg-pine-900"
              >
                {letter.applyOnline} <ExternalIcon size={16} />
              </a>
            )}
            {x.contactPhone && (
              <a
                href={`tel:${x.contactPhone.replace(/[^\d+]/g, "")}`}
                className="flex min-h-12 items-center justify-center gap-1.5 rounded-md border-2 border-pine-800/40 px-3 text-[15px] font-semibold text-pine-950"
              >
                <PhoneIcon size={18} /> {letter.callAgency}
              </a>
            )}
          </div>
        )}
      </section>

      <section className="rounded-md border border-stone-300 bg-white p-5 sm:p-6">
        <h2 className="font-sans text-[13px] font-semibold uppercase tracking-wider text-poppy-700">{letter.checklist}</h2>
        <ul className="mt-3 flex flex-col gap-2">
          {e.whatToDo.map((step, i) => {
            const on = !!checked[i];
            return (
              <li key={i}>
                <button
                  type="button"
                  onClick={() => setChecked((prev) => ({ ...prev, [i]: !prev[i] }))}
                  aria-pressed={on}
                  className={`flex w-full items-start gap-3 rounded-md border px-3 py-3 text-left ${
                    on ? "border-pine-700 bg-pine-50" : "border-stone-300 bg-white active:bg-stone-50"
                  }`}
                >
                  <span
                    className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-sm border-2 ${
                      on ? "border-pine-800 bg-pine-800 text-white" : "border-stone-400"
                    }`}
                  >
                    {on ? <CheckIcon size={16} strokeWidth={3} /> : <span className="text-sm font-bold text-stone-500">{i + 1}</span>}
                  </span>
                  <span className={`pt-0.5 leading-relaxed ${on ? "text-stone-500 line-through" : "text-stone-900"}`}>{step}</span>
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-stone-700">{e.needHelp}</p>
      </section>

      {e.uncertainty && (
        <p className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <strong>{l.uncertain}</strong> {e.uncertainty}
        </p>
      )}

      <details className="rounded-md border border-stone-300 bg-stone-50 px-4 py-3 text-sm text-stone-700">
        <summary className="cursor-pointer font-medium">{l.fromLetter}</summary>
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
          {x.agency && (
            <>
              <dt className="text-stone-500">Agency</dt>
              <dd>{x.agency}</dd>
            </>
          )}
          {x.formNumber && (
            <>
              <dt className="text-stone-500">Form</dt>
              <dd>{x.formNumber}</dd>
            </>
          )}
          {x.deadline && (
            <>
              <dt className="text-stone-500">Date</dt>
              <dd>
                {x.deadline}
                {x.deadlineMeaning ? ` (${x.deadlineMeaning})` : ""}
              </dd>
            </>
          )}
          {x.documentsRequested.length > 0 && (
            <>
              <dt className="text-stone-500">Documents</dt>
              <dd>{x.documentsRequested.join("; ")}</dd>
            </>
          )}
          {x.contactPhone && (
            <>
              <dt className="text-stone-500">Phone</dt>
              <dd>
                <a className="text-pine-800 underline" href={`tel:${x.contactPhone.replace(/[^\d+]/g, "")}`}>
                  {x.contactPhone}
                </a>
              </dd>
            </>
          )}
        </dl>
      </details>

      <section className="flex flex-col gap-2">
        <h2 className="text-[13px] font-semibold uppercase tracking-wider text-pine-800">{letter.trustedTitle}</h2>
        {result.sources.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {result.sources.slice(0, 3).map((s) => (
              <li key={s.sourceId}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex flex-col gap-0.5 rounded-md border border-pine-200 bg-pine-50 px-4 py-3 active:bg-pine-100"
                >
                  <span className="text-[15px] font-semibold text-pine-950">
                    {s.agency} · {s.title}
                  </span>
                  <span className="text-[13px] text-pine-800">{letter.sourceLine(s.agency, s.lastVerified)}</span>
                  <span className="text-[12px] text-stone-500">{letter.whyThisSource}</span>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-md bg-stone-100 px-3 py-2 text-[13px] text-stone-600">{letter.whyThisSource}</p>
        )}
      </section>

      <HumanHandoff lang={lang} program={x.program} documents={x.documentsRequested} letterPhone={x.contactPhone} />

      <section className="flex flex-col gap-3">
        <div>
          <h2 className="text-[21px] text-pine-950">{t.needHelp}</h2>
          <p className="text-[15px] text-stone-600">{t.needHelpBody}</p>
        </div>
        <PersonRequest
          lang={lang}
          letter={{
            program: x.program,
            noticeType: x.noticeType,
            formNumber: x.formNumber,
            deadline: x.deadline,
            requestedAction: x.requestedAction,
          }}
        />
      </section>

      <button type="button" onClick={onReset} className="self-start rounded-full px-1 py-2 text-pine-800 underline underline-offset-4">
        {l.another}
      </button>
    </div>
  );
}

function SaveDeadline({ result, lang }: { result: Extract<LetterResult, { ok: true }>; lang: LanguageCode }) {
  const a = app(lang);
  const [saved, setSaved] = useState(false);
  const x = result.extraction;
  if (!x.deadline || !/^\d{4}-\d{2}-\d{2}$/.test(x.deadline) || (result.daysUntilDeadline ?? -1) < 0) return null;
  const program = x.program in a.check.programs ? a.check.programs[x.program as keyof typeof a.check.programs].name : null;
  const reminder = {
    id: `letter-${x.deadline}`,
    title: [a.letter.reminderTitle, program, x.formNumber].filter(Boolean).join(" · "),
    date: x.deadline,
  };
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          disabled={saved}
          onClick={() => {
            addReminder(reminder.title, reminder.date);
            setSaved(true);
          }}
          className="flex min-h-12 items-center justify-center gap-1.5 rounded-md bg-amber-900 px-3 text-[15px] font-semibold text-white disabled:bg-amber-100 disabled:text-amber-950"
        >
          {saved ? <CheckIcon size={18} /> : <CalendarIcon size={18} />} {saved ? a.letter.deadlineSaved : a.letter.saveDeadline}
        </button>
        <button
          type="button"
          onClick={() => downloadIcs(reminder, result.explanation.whatToDo.join("\n"))}
          className="flex min-h-12 items-center justify-center gap-1.5 rounded-md border-2 border-amber-900/30 px-3 text-[15px] font-semibold text-amber-950"
        >
          <PlusIcon size={18} /> {a.home.addToCalendar}
        </button>
      </div>
      {saved && (
        <Link href="/plan" className="text-center text-[15px] font-semibold text-pine-800 underline decoration-pine-300 underline-offset-4">
          {a.home.planTitle}
        </Link>
      )}
    </div>
  );
}
