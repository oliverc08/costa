"use client";

import { useEffect, useRef, useState } from "react";
import { LETTER_UI, UI } from "@/lib/i18n";
import type { LanguageCode } from "@/lib/languages";
import type { LetterResult } from "@/lib/letters";

type Phase =
  | { kind: "idle" }
  | { kind: "ready"; file: File; preview: string | null }
  | { kind: "analyzing"; preview: string | null }
  | { kind: "done"; result: LetterResult; preview: string | null }
  | { kind: "error"; message: string };

const MAX_EDGE = 2000;

/** Shrinks large phone photos and converts them to JPEG (also handles HEIC where the browser can decode it). */
async function prepareImage(file: File): Promise<Blob> {
  if (file.type === "application/pdf") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode failed"))), "image/jpeg", 0.85),
    );
  } catch {
    return file;
  }
}

export function LetterUpload({ lang }: { lang: LanguageCode }) {
  const t = UI[lang];
  const l = LETTER_UI[lang];
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);

  const preview = "preview" in phase ? phase.preview : null;
  useEffect(() => () => void (preview && URL.revokeObjectURL(preview)), [preview]);

  function choose(file: File | undefined) {
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    setPhase({ kind: "ready", file, preview: isImage ? URL.createObjectURL(file) : null });
  }

  async function analyze() {
    if (phase.kind !== "ready") return;
    const { file, preview } = phase;
    setPhase({ kind: "analyzing", preview });
    try {
      const blob = await prepareImage(file);
      const body = new FormData();
      body.append("file", blob, file.type === "application/pdf" ? "letter.pdf" : "letter.jpg");
      body.append("language", lang);
      const res = await fetch("/api/letter", { method: "POST", body });
      if (res.status === 503) return setPhase({ kind: "error", message: t.notConfigured });
      if (!res.ok) return setPhase({ kind: "error", message: res.status === 415 ? l.unreadable : l.error });
      setPhase({ kind: "done", result: (await res.json()) as LetterResult, preview });
    } catch {
      setPhase({ kind: "error", message: l.error });
    }
  }

  function reset() {
    setPhase({ kind: "idle" });
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="flex flex-col gap-5">
      {(phase.kind === "idle" || phase.kind === "error") && (
        <>
          <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed border-teal-600/50 bg-white px-6 py-14 text-center hover:border-teal-600 hover:bg-teal-50/50">
            <span aria-hidden className="text-5xl">📷</span>
            <span className="text-lg font-semibold text-teal-900">{t.letterChoose}</span>
            <span className="text-sm text-stone-500">JPG · PNG · PDF</span>
            <input
              ref={inputRef}
              type="file"
              accept="image/*,application/pdf"
              className="sr-only"
              onChange={(e) => choose(e.currentTarget.files?.[0])}
            />
          </label>
          {phase.kind === "error" && (
            <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800">
              {phase.message}
            </p>
          )}
        </>
      )}

      {(phase.kind === "ready" || phase.kind === "analyzing") && (
        <div className="flex flex-col gap-4">
          {phase.preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
            <img src={phase.preview} alt="" className="max-h-80 w-full rounded-2xl border border-stone-200 object-contain bg-white" />
          ) : (
            <p className="rounded-2xl border border-stone-200 bg-white px-4 py-6 text-center text-stone-600">PDF</p>
          )}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={analyze}
              disabled={phase.kind === "analyzing"}
              className="rounded-full bg-teal-700 px-6 py-3 text-lg font-semibold text-white hover:bg-teal-800 disabled:opacity-60"
            >
              {phase.kind === "analyzing" ? t.letterAnalyzing : t.letterAnalyze}
            </button>
            {phase.kind === "ready" && (
              <button type="button" onClick={reset} className="rounded-full px-5 py-3 text-stone-600 hover:text-stone-900">
                {l.back}
              </button>
            )}
          </div>
          {phase.kind === "analyzing" && <div className="h-1.5 overflow-hidden rounded-full bg-stone-200"><div className="h-full w-1/3 animate-[pulse_1.2s_ease-in-out_infinite] rounded-full bg-teal-600" /></div>}
        </div>
      )}

      {phase.kind === "done" && <LetterResultView result={phase.result} lang={lang} onReset={reset} />}
    </div>
  );
}

function DeadlineBadge({ days, label, lang }: { days: number | null; label: string; lang: LanguageCode }) {
  const l = LETTER_UI[lang];
  const urgent = days !== null && days <= 10;
  return (
    <div className={`rounded-2xl p-4 ${urgent ? "bg-red-50 text-red-900" : "bg-amber-50 text-amber-950"}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-70">{UI[lang].deadline}</p>
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
  const t = UI[lang];
  const l = LETTER_UI[lang];

  if (!result.ok) {
    return (
      <div className="flex flex-col gap-4">
        <p role="alert" className="rounded-xl bg-amber-50 px-4 py-3 text-amber-900">
          {result.reason === "unreadable" ? l.unreadable : l.notLetter}
        </p>
        <button type="button" onClick={onReset} className="self-start rounded-full bg-teal-700 px-5 py-3 font-semibold text-white">
          {l.another}
        </button>
      </div>
    );
  }

  const { explanation: e, extraction: x } = result;
  return (
    <div className="flex flex-col gap-4" aria-live="polite">
      <section className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-teal-800">{t.whatThisMeans}</h2>
        <p className="mt-2 text-lg leading-relaxed text-stone-900">{e.whatThisMeans}</p>
      </section>

      {e.deadline && <DeadlineBadge days={result.daysUntilDeadline} label={e.deadline} lang={lang} />}

      <section className="rounded-3xl border border-stone-200 bg-white p-5 sm:p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-teal-800">{t.whatToDo}</h2>
        <ol className="mt-3 flex flex-col gap-3">
          {e.whatToDo.map((step, i) => (
            <li key={i} className="flex gap-3 text-stone-900">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-teal-700 text-sm font-bold text-white">
                {i + 1}
              </span>
              <span className="pt-0.5 leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
        <p className="mt-4 text-stone-700">{e.needHelp}</p>
      </section>

      {e.uncertainty && (
        <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          <strong>{l.uncertain}</strong> {e.uncertainty}
        </p>
      )}

      <details className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-700">
        <summary className="cursor-pointer font-medium">{l.fromLetter}</summary>
        <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
          {x.agency && (<><dt className="text-stone-500">Agency</dt><dd>{x.agency}</dd></>)}
          {x.formNumber && (<><dt className="text-stone-500">Form</dt><dd>{x.formNumber}</dd></>)}
          {x.deadline && (<><dt className="text-stone-500">Date</dt><dd>{x.deadline}{x.deadlineMeaning ? ` (${x.deadlineMeaning})` : ""}</dd></>)}
          {x.documentsRequested.length > 0 && (<><dt className="text-stone-500">Documents</dt><dd>{x.documentsRequested.join("; ")}</dd></>)}
          {x.contactPhone && (<><dt className="text-stone-500">Phone</dt><dd><a className="text-teal-800 underline" href={`tel:${x.contactPhone.replace(/[^\d+]/g, "")}`}>{x.contactPhone}</a></dd></>)}
        </dl>
      </details>

      {result.sources.length > 0 && (
        <div className="flex flex-wrap gap-2" aria-label={t.sources}>
          {result.sources.slice(0, 3).map((s) => (
            <a
              key={s.sourceId}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              title={`Last verified ${s.lastVerified}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs text-teal-900 hover:bg-teal-100"
            >
              <span aria-hidden>✓</span>
              <span className="font-medium">{s.agency}</span>
              <span className="text-teal-700">· {s.title}</span>
            </a>
          ))}
        </div>
      )}

      <HandoffForm result={result} lang={lang} />

      <button type="button" onClick={onReset} className="self-start rounded-full px-1 py-2 text-teal-800 underline underline-offset-4">
        {l.another}
      </button>
    </div>
  );
}

function HandoffForm({ result, lang }: { result: Extract<LetterResult, { ok: true }>; lang: LanguageCode }) {
  const t = UI[lang];
  const l = LETTER_UI[lang];
  const [phone, setPhone] = useState("");
  const [area, setArea] = useState("");
  const [by, setBy] = useState<"call" | "sms">("call");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<{ kind: "idle" | "sending" } | { kind: "sent"; reference: string } | { kind: "error"; message: string }>({ kind: "idle" });

  if (state.kind === "sent") {
    return (
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-950">
        {t.requestSent} <strong className="font-mono text-lg">{state.reference}</strong>
      </div>
    );
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setState({ kind: "sending" });
    const x = result.extraction;
    const res = await fetch("/api/handoff", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        consent,
        language: lang,
        area,
        preferredContact: by,
        contact: phone,
        letter: {
          program: x.program,
          noticeType: x.noticeType,
          formNumber: x.formNumber,
          deadline: x.deadline,
          requestedAction: x.requestedAction,
        },
      }),
    }).catch(() => null);
    const data = (await res?.json().catch(() => null)) as { ok?: boolean; reference?: string } | null;
    if (data?.ok && data.reference) setState({ kind: "sent", reference: data.reference });
    else setState({ kind: "error", message: l.error });
  }

  const field = "w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-base outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20";
  return (
    <form onSubmit={submit} className="flex flex-col gap-3 rounded-3xl bg-teal-900 p-5 text-teal-50 sm:p-6">
      <div>
        <h2 className="text-lg font-semibold text-white">{t.needHelp}</h2>
        <p className="text-sm text-teal-100">{t.needHelpBody}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          {t.phoneLabel}
          <input required type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.currentTarget.value)} className={`${field} text-stone-900`} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          {l.areaLabel}
          <input required value={area} onChange={(e) => setArea(e.currentTarget.value)} placeholder="Half Moon Bay" className={`${field} text-stone-900`} />
        </label>
      </div>
      <fieldset className="flex flex-wrap items-center gap-4 text-sm">
        <legend className="mb-1">{l.contactBy}</legend>
        {(["call", "sms"] as const).map((v) => (
          <label key={v} className="flex items-center gap-2">
            <input type="radio" name="by" checked={by === v} onChange={() => setBy(v)} className="accent-teal-300" />
            {v === "call" ? l.callMe : l.textMe}
          </label>
        ))}
      </fieldset>
      <label className="flex items-start gap-2 text-sm">
        <input required type="checkbox" checked={consent} onChange={(e) => setConsent(e.currentTarget.checked)} className="mt-1 accent-teal-300" />
        {t.consentLabel}
      </label>
      {state.kind === "error" && <p role="alert" className="text-sm text-red-200">{state.message}</p>}
      <button
        type="submit"
        disabled={state.kind === "sending" || !consent}
        className="self-start rounded-full bg-white px-5 py-3 font-semibold text-teal-900 hover:bg-teal-50 disabled:opacity-50"
      >
        {state.kind === "sending" ? l.sending : t.requestHelp}
      </button>
    </form>
  );
}
