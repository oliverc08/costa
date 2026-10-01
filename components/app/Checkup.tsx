"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { APPLY, runCheckup, type CheckupAnswers, type CheckupResult, type IncomePeriod, type ProgramResult } from "@/lib/checkup";
import { addSteps, saveCheckup } from "@/lib/device";
import { APP, type ScreenStatus } from "@/lib/i18n-app";
import type { LanguageCode } from "@/lib/languages";
import { isAppleWebKit, useReadAloud } from "@/lib/speech";
import { NearbyHelp } from "./NearbyHelp";
import { HumanHandoff } from "./HumanHandoff";
import { ArrowRightIcon, CheckIcon, ExternalIcon, PhoneIcon, RefreshIcon, ShieldIcon, SpeakerIcon, StopIcon } from "./Icons";

type StepId = "intro" | "county" | "size" | "who" | "kids" | "income" | "work" | "benefits" | "results";
type WhoKey = keyof CheckupAnswers["who"];

const START: CheckupAnswers = {
  county: "san-mateo",
  householdSize: 1,
  who: { pregnant: false, baby: false, young: false, kid: false, senior: false, disability: false },
  childrenUnder19: 0,
  income: { amount: 0, period: "month" },
  fromWork: true,
  getsBenefits: "no",
};

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

export const STATUS_TONE: Record<ScreenStatus, string> = {
  likely: "border-pine-700 bg-pine-800 text-white",
  possibly: "border-poppy-600 text-poppy-700",
  unlikely: "border-stone-300 text-stone-600",
  "need-more-info": "border-stone-400 text-stone-700",
};

function Choice({ selected, onClick, children, hint }: { selected: boolean; onClick: () => void; children: React.ReactNode; hint?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex min-h-16 w-full items-center justify-between gap-3 rounded-md border px-4 py-3 text-left ${
        selected ? "border-pine-800 bg-pine-50 ring-1 ring-pine-800" : "border-stone-400 bg-white active:bg-stone-100"
      }`}
    >
      <span>
        <span className="block text-[17px] font-semibold leading-snug">{children}</span>
        {hint && <span className="block text-[14px] text-stone-500">{hint}</span>}
      </span>
      <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-sm border-2 ${selected ? "border-pine-800 bg-pine-800 text-white" : "border-stone-400"}`}>
        {selected && <CheckIcon size={16} strokeWidth={3} />}
      </span>
    </button>
  );
}

function Stepper({ value, onChange, min, max }: { value: number; onChange: (n: number) => void; min: number; max: number }) {
  const btn = "grid h-16 w-16 place-items-center rounded-md border border-stone-400 bg-white text-3xl font-bold text-pine-800 active:bg-stone-100 disabled:opacity-30";
  return (
    <div className="flex items-center justify-center gap-6 py-4">
      <button type="button" className={btn} onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min} aria-label="−">
        −
      </button>
      <output className="w-20 text-center text-6xl font-bold tabular-nums" aria-live="polite">
        {value}
      </output>
      <button type="button" className={btn} onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max} aria-label="+">
        +
      </button>
    </div>
  );
}

export function Checkup({ lang }: { lang: LanguageCode }) {
  const a = APP[lang];
  const c = a.check;
  const [answers, setAnswers] = useState<CheckupAnswers>(START);
  const [step, setStep] = useState<StepId>("intro");
  const [amountText, setAmountText] = useState("");
  const [savedPlan, setSavedPlan] = useState(false);

  const hasKids = answers.who.baby || answers.who.young || answers.who.kid;
  const hasIncome = answers.income !== null;
  const flow = useMemo<StepId[]>(
    () => ["county", "size", "who", ...(hasKids ? (["kids"] as const) : []), "income", ...(hasIncome ? (["work"] as const) : []), "benefits"],
    [hasKids, hasIncome],
  );
  const index = flow.indexOf(step as (typeof flow)[number]);
  const result = useMemo(() => (step === "results" ? runCheckup(answers) : null), [step, answers]);

  const set = (patch: Partial<CheckupAnswers>) => setAnswers((prev) => ({ ...prev, ...patch }));

  function go(next: StepId) {
    setStep(next);
    window.scrollTo({ top: 0 });
  }

  function forward() {
    if (index === flow.length - 1) {
      const r = runCheckup(answers);
      saveCheckup(r.summary);
      go("results");
    } else go(flow[index + 1]);
  }

  function toggleWho(key: WhoKey | "none") {
    setAnswers((prev) => {
      if (key === "none") return { ...prev, who: { ...START.who }, childrenUnder19: 0 };
      const who = { ...prev.who, [key]: !prev.who[key] };
      const minimum = [who.baby, who.young, who.kid].filter(Boolean).length;
      return { ...prev, who, childrenUnder19: minimum ? Math.max(prev.childrenUnder19, minimum) : 0 };
    });
  }

  function restart() {
    setAnswers(START);
    setAmountText("");
    setSavedPlan(false);
    go("intro");
  }

  if (step === "intro") {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-[30px] leading-tight text-pine-950">{c.title}</h1>
          <p className="text-[17px] text-stone-700">{c.intro}</p>
        </div>
        <ul className="flex flex-col gap-3 rounded-md bg-white p-5 ring-1 ring-stone-200">
          {c.promises.map((p) => (
            <li key={p} className="flex items-start gap-3 text-[16px]">
              <ShieldIcon size={22} className="mt-0.5 shrink-0 text-pine-700" />
              {p}
            </li>
          ))}
        </ul>
        <button type="button" onClick={() => go("county")} className="flex min-h-14 items-center justify-center gap-2 rounded-md bg-pine-800 text-lg font-bold text-white active:bg-pine-900">
          {c.start} <ArrowRightIcon />
        </button>
      </div>
    );
  }

  if (step === "results" && result) {
    const worth = result.programs.filter((p) => p.status === "likely" || p.status === "possibly");
    const stepTexts = worth.map((p) =>
      p.program === "medi-cal" && answers.county !== "other" ? `${c.steps[p.program]} ${APPLY["medi-cal"].phone(answers.county)}` : c.steps[p.program],
    );
    return (
      <ResultsScreen
        lang={lang}
        result={result}
        answers={answers}
        worth={worth}
        stepTexts={stepTexts}
        savedPlan={savedPlan}
        onSave={() => {
          addSteps(stepTexts);
          setSavedPlan(true);
        }}
        onRestart={restart}
      />
    );
  }

  const canContinue =
    step !== "income" || answers.income === null || (answers.income.amount > 0 && Number.isFinite(answers.income.amount));

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-[14px] font-medium text-stone-500">
          <span>{a.common.stepOf(index + 1, flow.length)}</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-stone-200" aria-hidden>
          <div className="h-full rounded-full bg-pine-800 transition-all" style={{ width: `${((index + 1) / flow.length) * 100}%` }} />
        </div>
      </div>

      {step === "county" && (
        <Question q={c.county.q}>
          <Choice selected={answers.county === "san-mateo"} onClick={() => set({ county: "san-mateo" })} hint={c.county.sanMateoHint}>
            {c.county.sanMateo}
          </Choice>
          <Choice selected={answers.county === "santa-clara"} onClick={() => set({ county: "santa-clara" })} hint={c.county.santaClaraHint}>
            {c.county.santaClara}
          </Choice>
          <Choice selected={answers.county === "other"} onClick={() => set({ county: "other" })}>
            {c.county.other}
          </Choice>
        </Question>
      )}

      {step === "size" && (
        <Question q={c.size.q} hint={c.size.hint}>
          <Stepper value={answers.householdSize} onChange={(n) => set({ householdSize: n, childrenUnder19: Math.min(answers.childrenUnder19, n) })} min={1} max={15} />
        </Question>
      )}

      {step === "who" && (
        <Question q={c.who.q} hint={c.who.hint}>
          {(["pregnant", "baby", "young", "kid", "senior", "disability"] as const).map((k) => (
            <Choice key={k} selected={answers.who[k]} onClick={() => toggleWho(k)}>
              {c.who[k]}
            </Choice>
          ))}
          <Choice selected={!Object.values(answers.who).some(Boolean)} onClick={() => toggleWho("none")}>
            {c.who.none}
          </Choice>
        </Question>
      )}

      {step === "kids" && (
        <Question q={c.kids.q}>
          <Stepper value={answers.childrenUnder19} onChange={(n) => set({ childrenUnder19: n })} min={1} max={Math.max(1, answers.householdSize)} />
        </Question>
      )}

      {step === "income" && (
        <Question q={c.income.q} hint={c.income.hint}>
          {answers.income && (
            <>
              <label className="flex flex-col gap-1.5">
                <span className="text-[15px] font-medium text-stone-600">{c.income.amount}</span>
                <span className="flex min-h-16 items-center rounded-md border border-stone-400 bg-white px-4 focus-within:border-pine-700">
                  <span className="text-3xl font-bold text-stone-400">$</span>
                  <input
                    inputMode="decimal"
                    autoFocus
                    value={amountText}
                    onChange={(e) => {
                      const text = e.currentTarget.value.replace(/[^\d.,]/g, "");
                      setAmountText(text);
                      set({ income: { period: answers.income!.period, amount: Number(text.replace(/,/g, "")) || 0 } });
                    }}
                    placeholder="0"
                    className="w-full bg-transparent px-2 text-3xl font-bold tabular-nums outline-none"
                  />
                </span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(["week", "twoWeeks", "month", "year"] as IncomePeriod[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    aria-pressed={answers.income?.period === p}
                    onClick={() => setAnswers((prev) => ({ ...prev, income: { amount: prev.income?.amount ?? 0, period: p } }))}
                    className={`min-h-14 rounded-md border-2 px-3 text-[15px] font-semibold leading-tight ${
                      answers.income?.period === p ? "border-pine-700 bg-pine-50 text-pine-900" : "border-stone-300 bg-white active:bg-stone-50"
                    }`}
                  >
                    {c.income[p]}
                  </button>
                ))}
              </div>
            </>
          )}
          <Choice
            selected={answers.income === null}
            onClick={() => set({ income: answers.income === null ? { amount: Number(amountText.replace(/,/g, "")) || 0, period: "month" } : null })}
          >
            {c.income.none}
          </Choice>
        </Question>
      )}

      {step === "work" && (
        <Question q={c.work.q} hint={c.work.hint}>
          <Choice selected={answers.fromWork} onClick={() => set({ fromWork: true })}>
            {a.common.yes}
          </Choice>
          <Choice selected={!answers.fromWork} onClick={() => set({ fromWork: false })}>
            {a.common.no}
          </Choice>
        </Question>
      )}

      {step === "benefits" && (
        <Question q={c.benefits.q}>
          {(["yes", "no", "not-sure"] as const).map((v) => (
            <Choice key={v} selected={answers.getsBenefits === v} onClick={() => set({ getsBenefits: v })}>
              {v === "yes" ? a.common.yes : v === "no" ? a.common.no : a.common.notSure}
            </Choice>
          ))}
        </Question>
      )}

      <div className="mt-2 flex gap-3">
        <button
          type="button"
          onClick={() => go(index === 0 ? "intro" : flow[index - 1])}
          className="min-h-14 rounded-md px-5 text-[17px] font-semibold text-stone-600 active:bg-stone-200"
        >
          {a.common.back}
        </button>
        <button
          type="button"
          onClick={forward}
          disabled={!canContinue}
          className="flex min-h-14 flex-1 items-center justify-center gap-2 rounded-md bg-pine-800 text-[17px] font-bold text-white active:bg-pine-900 disabled:opacity-40"
        >
          {index === flow.length - 1 ? c.seeResults : a.common.next} <ArrowRightIcon />
        </button>
      </div>
      <p className="text-center text-[13px] text-stone-500">{a.common.stayPrivate}</p>
    </div>
  );
}

function Question({ q, hint, children }: { q: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="mb-1 flex flex-col gap-1">
        <span className="block text-[24px] font-bold leading-tight">{q}</span>
        {hint && <span className="block text-[15px] text-stone-600">{hint}</span>}
      </legend>
      {children}
    </fieldset>
  );
}

function whyFor(p: ProgramResult, c: (typeof APP)[LanguageCode]["check"]) {
  if (p.status === "likely") return c.whyLikely;
  if (p.status === "possibly") return c.whyPossibly;
  return c.whyUnlikely;
}

function ResultsScreen({
  lang,
  result,
  answers,
  worth,
  stepTexts,
  savedPlan,
  onSave,
  onRestart,
}: {
  lang: LanguageCode;
  result: CheckupResult;
  answers: CheckupAnswers;
  worth: ProgramResult[];
  stepTexts: string[];
  savedPlan: boolean;
  onSave: () => void;
  onRestart: () => void;
}) {
  const a = APP[lang];
  const c = a.check;
  const read = useReadAloud(lang);
  const headline = worth.length === 0 ? c.mayQualifyNone : c.mayQualify(worth.length);
  const speakText = worth.length === 0 ? c.mayQualifyNone : `${c.speakFound(worth.length)} ${worth.map((p) => c.programs[p.program].name).join(". ")}`;

  useEffect(() => {
    if (!read.available) return;
    if (isAppleWebKit(navigator.userAgent, navigator.maxTouchPoints ?? 0, navigator.platform ?? "")) return;
    const t = window.setTimeout(() => read.speak("results-summary", speakText), 400);
    return () => {
      window.clearTimeout(t);
      read.stop();
    };
    // Speak once when results appear (skipped on Apple — TTS breaks mic).
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional mount-only speak
  }, []);

  const speaking = read.speakingId === "results-summary";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <h1 className="text-[30px] leading-tight text-pine-950">{headline}</h1>
        <p className="text-[15px] text-stone-600">{c.resultsIntro}</p>
        {read.available && (
          <button
            type="button"
            onClick={() => (speaking ? read.stop() : read.speak("results-summary", speakText))}
            className={`flex min-h-12 items-center justify-center gap-2 self-start rounded-md border px-4 text-[16px] font-semibold ${
              speaking ? "border-pine-800 bg-pine-800 text-white" : "border-stone-400 text-pine-950 active:bg-stone-100"
            }`}
          >
            {speaking ? <StopIcon size={18} /> : <SpeakerIcon size={22} />}
            {speaking ? a.common.stop : a.common.listen}
          </button>
        )}
      </div>

      <ul className="flex flex-col gap-4">
        {(worth.length ? worth : result.programs).map((p, i) => (
          <li key={p.program}>
            <ProgramCard p={p} lang={lang} monthly={result.monthlyIncome} county={answers.county} open={i === 0} />
          </li>
        ))}
      </ul>

      {worth.length > 0 && (
        <button
          type="button"
          disabled={savedPlan}
          onClick={onSave}
          className="flex min-h-14 items-center justify-center gap-2 rounded-md bg-pine-800 px-4 text-[17px] font-bold text-white active:bg-pine-900 disabled:bg-pine-100 disabled:text-pine-900"
        >
          {savedPlan ? (
            <>
              <CheckIcon /> {c.saved}
            </>
          ) : (
            c.savePlan
          )}
        </button>
      )}

      <NearbyHelp lang={lang} county={answers.county} />

      <HumanHandoff
        lang={lang}
        program={worth[0]?.program ?? "other"}
        documents={worth.flatMap((p) => [c.needs[p.program]]).slice(0, 4)}
      />

      <Link
        href={`/help?topic=${worth[0]?.program ?? "other"}#person`}
        className="flex min-h-14 items-center justify-center rounded-md border border-pine-800 px-4 text-[17px] font-bold text-pine-900 active:bg-pine-50"
      >
        {c.getHelp}
      </Link>
      <button type="button" onClick={onRestart} className="flex min-h-12 items-center justify-center gap-2 font-semibold text-stone-600">
        <RefreshIcon size={18} /> {c.startOver}
      </button>
      <p className="rounded-md bg-stone-100 px-4 py-3 text-[14px] leading-relaxed text-stone-600">{c.disclaimer}</p>
      {/* keep stepTexts referenced for typecheck when worth empty */}
      <span className="sr-only">{stepTexts.join(" ")}</span>
    </div>
  );
}

function ProgramCard({ p, lang, monthly, county, open }: { p: ProgramResult; lang: LanguageCode; monthly: number; county: CheckupAnswers["county"]; open: boolean }) {
  const a = APP[lang];
  const c = a.check;
  const name = c.programs[p.program];
  const apply = APPLY[p.program];
  const phone = apply.phone(county);
  const worth = p.status === "likely" || p.status === "possibly";
  const read = useReadAloud(lang);
  const cardId = `program-${p.program}`;
  const listenText = [name.name, whyFor(p, c), `${c.needLabel}: ${c.needs[p.program]}`, `${c.nextLabel}: ${c.steps[p.program]}`].join(". ");
  const speaking = read.speakingId === cardId;

  return (
    <details open={open} className="group overflow-hidden rounded-md border border-stone-300 bg-white">
      <summary className="flex cursor-pointer items-center gap-3 p-4">
        <span className="min-w-0 flex-1">
          <span className="block text-[20px] font-bold">{name.name}</span>
          <span className="block text-[14px] text-stone-500">{name.what}</span>
        </span>
        <span className={`shrink-0 rounded-sm border px-2 py-0.5 text-[12px] font-semibold uppercase tracking-wide ${STATUS_TONE[p.status]}`}>{c.status[p.status]}</span>
      </summary>
      <div className="flex flex-col gap-4 border-t border-stone-200 px-4 pb-4 pt-3 text-[15px]">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-wider text-stone-500">{c.whyLabel}</p>
          <p className="mt-1 leading-relaxed text-stone-800">{whyFor(p, c)}</p>
          {p.limit !== null && (
            <p className="mt-2 rounded-md bg-stone-50 px-3 py-2 text-stone-700">
              {c.yourIncome(usd(monthly))}
              <br />
              {c.limitFor(p.sizeUsed, usd(p.limit))}
            </p>
          )}
          {p.notes.slice(0, 2).map((n) => (
            <p key={n} className="mt-2 leading-relaxed text-stone-700">
              {n === "eitcYctc" ? c.notes.eitcYctc(usd(p.yctcUpTo ?? 0)) : c.notes[n]}
            </p>
          ))}
        </div>

        <div>
          <p className="text-[12px] font-semibold uppercase tracking-wider text-stone-500">{c.needLabel}</p>
          <p className="mt-1 font-medium text-stone-900">{c.needs[p.program]}</p>
        </div>

        <div>
          <p className="text-[12px] font-semibold uppercase tracking-wider text-stone-500">{c.nextLabel}</p>
          <p className="mt-1 font-medium text-stone-900">{c.steps[p.program]}</p>
        </div>

        {p.upTo !== null && <p className="text-lg font-bold text-pine-900">{c.upTo(usd(p.upTo))}</p>}

        <div className="grid grid-cols-2 gap-2">
          {read.available && (
            <button
              type="button"
              onClick={() => (speaking ? read.stop() : read.speak(cardId, listenText))}
              className={`flex min-h-12 items-center justify-center gap-1.5 rounded-md border px-3 font-semibold ${
                speaking ? "border-pine-800 bg-pine-800 text-white" : "border-stone-400 text-pine-950 active:bg-stone-100"
              }`}
            >
              {speaking ? <StopIcon size={16} /> : <SpeakerIcon size={18} />} {speaking ? a.common.stop : a.common.listen}
            </button>
          )}
          {worth && (
            <a href={`tel:${phone.replace(/\D/g, "")}`} className="flex min-h-12 items-center justify-center gap-1.5 rounded-md border border-pine-800 px-3 font-semibold text-pine-900 active:bg-pine-50">
              <PhoneIcon size={18} /> {a.common.call}
            </a>
          )}
          {worth && (
            <a href={apply.url} target="_blank" rel="noreferrer" className="col-span-2 flex min-h-12 items-center justify-center gap-1.5 rounded-md bg-pine-800 px-3 font-semibold text-white active:bg-pine-900">
              {c.nextLabel}: {a.common.website} <ExternalIcon size={16} />
            </a>
          )}
        </div>

        <a href={p.sourceUrl} target="_blank" rel="noreferrer" className="text-[13px] leading-snug text-stone-500 underline underline-offset-2">
          {c.sourceLine(p.sourceAgency, p.lastVerified)}
        </a>
      </div>
    </details>
  );
}
