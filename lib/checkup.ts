import { screenEligibility, type EligibilityInput, type ScreenResult } from "@/lib/eligibility";
import { CALEITC_2025, RULE_SOURCES } from "@/lib/eligibility/limits";
import type { ProgramId } from "@/lib/i18n-app";

/**
 * The household benefits checkup. Runs entirely on the device with the same
 * deterministic rules the chat agent uses. It never asks about immigration status
 * or for any identifying detail.
 */
export type County = "san-mateo" | "santa-clara" | "other";
export type IncomePeriod = "week" | "twoWeeks" | "month" | "year";
export type MediCalGroup = "adults" | "children" | "pregnancy" | "senior";

export interface CheckupAnswers {
  county: County;
  householdSize: number;
  who: { pregnant: boolean; baby: boolean; young: boolean; kid: boolean; senior: boolean; disability: boolean };
  childrenUnder19: number;
  /** null means no income right now. */
  income: { amount: number; period: IncomePeriod } | null;
  fromWork: boolean;
  getsBenefits: "yes" | "no" | "not-sure";
}

export type NoteKey =
  | "pregnantCounts"
  | "kidsAnyStatus"
  | "seniorRules"
  | "wicAuto"
  | "wicNotInGroup"
  | "wicNoSsn"
  | "eitcFile"
  | "eitcId"
  | "eitcYctc"
  | "eitcNoWork"
  | "coveredCa"
  | "calfreshAmount";

export interface ProgramResult {
  program: ProgramId;
  status: ScreenResult;
  /** Monthly income limit used, when the rule is income-based. */
  limit: number | null;
  /** Household size the limit is for (pregnancy adds the unborn baby for Medi-Cal and WIC). */
  sizeUsed: number;
  groups: { group: MediCalGroup; status: ScreenResult; limit: number | null }[];
  upTo: number | null;
  yctcUpTo: number | null;
  notes: NoteKey[];
  sourceUrl: string;
  sourceAgency: string;
  lastVerified: string;
}

export interface CheckupResult {
  monthlyIncome: number;
  programs: ProgramResult[];
  /** English, no personal details: what a helper sees if the person chooses to share. */
  summary: string;
}

const PER_MONTH: Record<IncomePeriod, number> = { week: 52 / 12, twoWeeks: 26 / 12, month: 1, year: 1 / 12 };

export function monthlyIncome(income: CheckupAnswers["income"]): number {
  if (!income) return 0;
  return Math.round(income.amount * PER_MONTH[income.period]);
}

const RANK: Record<ScreenResult, number> = { likely: 3, possibly: 2, "need-more-info": 1, unlikely: 0 };
const best = (xs: ScreenResult[]) => xs.reduce((a, b) => (RANK[b] > RANK[a] ? b : a), "unlikely" as ScreenResult);

function screen(input: EligibilityInput) {
  const r = screenEligibility(input);
  return { status: r.result, limit: r.limit?.period === "month" ? r.limit.amount : null };
}

function mediCal(a: CheckupAnswers, income: number): ProgramResult {
  const size = a.householdSize + (a.who.pregnant ? 1 : 0);
  const base = { program: "medi-cal", householdSize: size, monthlyIncome: income } as const;
  const hasChildren = a.who.baby || a.who.young || a.who.kid || a.childrenUnder19 > 0;
  const groups: ProgramResult["groups"] = [{ group: "adults", ...screen({ ...base, age: 30 }) }];
  if (hasChildren) groups.push({ group: "children", ...screen({ ...base, age: 10 }) });
  if (a.who.pregnant) groups.push({ group: "pregnancy", ...screen({ ...base, pregnant: true }) });
  if (a.who.senior || a.who.disability) {
    groups.push({ group: "senior", ...screen({ ...base, age: a.who.senior ? 70 : 40, hasDisability: a.who.disability }) });
  }
  const notes: NoteKey[] = [];
  if (a.who.pregnant) notes.push("pregnantCounts");
  if (hasChildren) notes.push("kidsAnyStatus");
  if (a.who.senior || a.who.disability) notes.push("seniorRules");
  if (groups.some((g) => g.status === "unlikely")) notes.push("coveredCa");
  return {
    program: "medi-cal",
    status: best(groups.map((g) => g.status)),
    limit: groups[0].limit,
    sizeUsed: size,
    groups,
    upTo: null,
    yctcUpTo: null,
    notes,
    sourceUrl: RULE_SOURCES["medi-cal"].url,
    sourceAgency: RULE_SOURCES["medi-cal"].agency,
    lastVerified: RULE_SOURCES["medi-cal"].lastVerified,
  };
}

function calFresh(a: CheckupAnswers, income: number): ProgramResult {
  const r = screen({
    program: "calfresh",
    householdSize: a.householdSize,
    monthlyIncome: income,
    age: a.who.senior ? 70 : undefined,
    hasDisability: a.who.disability || undefined,
  });
  return { program: "calfresh", ...r, sizeUsed: a.householdSize, groups: [], upTo: null, yctcUpTo: null, notes: ["calfreshAmount"], sourceUrl: RULE_SOURCES.calfresh.url, sourceAgency: RULE_SOURCES.calfresh.agency, lastVerified: RULE_SOURCES.calfresh.lastVerified };
}

function wic(a: CheckupAnswers, income: number): ProgramResult {
  const category = a.who.pregnant ? "pregnant" : a.who.baby ? "infant" : a.who.young ? "child-under-5" : "none";
  const size = a.householdSize + (a.who.pregnant ? 1 : 0);
  const automatic = a.getsBenefits === "yes";
  const r = screen({ program: "wic", wicCategory: category, householdSize: size, monthlyIncome: income, receivesMediCalCalFreshOrCalWorks: automatic });
  const notes: NoteKey[] = category === "none" ? ["wicNotInGroup"] : [...(automatic ? (["wicAuto"] as const) : []), "wicNoSsn"];
  if (category !== "none" && a.who.pregnant) notes.unshift("pregnantCounts");
  return {
    program: "wic",
    status: r.status,
    limit: automatic ? null : r.limit,
    sizeUsed: size,
    groups: [],
    upTo: null,
    yctcUpTo: null,
    notes,
    sourceUrl: RULE_SOURCES.wic.url,
    sourceAgency: RULE_SOURCES.wic.agency,
    lastVerified: RULE_SOURCES.wic.lastVerified,
  };
}

function calEitc(a: CheckupAnswers, income: number): ProgramResult {
  const kids = a.childrenUnder19;
  const youngest = a.who.baby ? 0 : a.who.young ? 3 : a.who.kid || kids > 0 ? 10 : undefined;
  const earned = a.fromWork ? income * 12 : 0;
  const r = screenEligibility({ program: "caleitc", annualEarnedIncome: earned, qualifyingChildren: kids, youngestChildAge: youngest });
  const hasYoung = youngest !== undefined && youngest < 6 && kids > 0;
  const within = r.result === "likely" || r.result === "possibly";
  const notes: NoteKey[] = [];
  if (!a.fromWork || income === 0) notes.push("eitcNoWork");
  if (within) notes.push("eitcFile", "eitcId");
  if (within && hasYoung) notes.push("eitcYctc");
  return {
    program: "caleitc",
    status: r.result,
    limit: null,
    sizeUsed: a.householdSize,
    groups: [],
    upTo: within && earned > 0 ? CALEITC_2025.maxCredit[Math.min(kids, 3)] : null,
    yctcUpTo: within && hasYoung ? CALEITC_2025.yctcMax : null,
    notes,
    sourceUrl: RULE_SOURCES.caleitc.url,
    sourceAgency: RULE_SOURCES.caleitc.agency,
    lastVerified: RULE_SOURCES.caleitc.lastVerified,
  };
}

export function runCheckup(a: CheckupAnswers): CheckupResult {
  const income = monthlyIncome(a.income);
  const programs = [mediCal(a, income), calFresh(a, income), wic(a, income), calEitc(a, income)].sort(
    (x, y) => RANK[y.status] - RANK[x.status],
  );

  const who = Object.entries(a.who)
    .filter(([, v]) => v)
    .map(([k]) => ({ pregnant: "pregnancy", baby: "baby under 1", young: "child 1-5", kid: "child 6-18", senior: "someone 65+", disability: "someone with a disability" })[k]);
  const summary = [
    `Checkup: household of ${a.householdSize}${who.length ? ` (${who.join(", ")})` : ""}, ${a.county === "other" ? "outside CA-16 counties" : `${a.county} county`}.`,
    `About $${income.toLocaleString("en-US")}/month${income ? (a.fromWork ? " mostly from work" : " mostly not from work") : ""}. Already gets Medi-Cal/CalFresh/CalWORKs: ${a.getsBenefits}.`,
    `Screening: ${programs
      .map((p) => `${p.program} ${p.status}${p.groups.length > 1 ? ` (${p.groups.map((g) => `${g.group} ${g.status}`).join(", ")})` : ""}`)
      .join("; ")}.`,
  ].join(" ");

  return { monthlyIncome: income, programs, summary };
}

export const APPLY: Record<ProgramId, { url: string; phone: (county: County) => string }> = {
  "medi-cal": {
    url: "https://benefitscal.com",
    phone: (c) => (c === "san-mateo" ? "1-800-223-8383" : c === "santa-clara" ? "1-877-962-3633" : "1-800-300-1506"),
  },
  calfresh: { url: "https://benefitscal.com", phone: () => "1-877-847-3663" },
  wic: { url: "https://myfamily.wic.ca.gov", phone: () => "1-800-852-5770" },
  caleitc: { url: "https://www.irs.gov/vita", phone: () => "1-800-906-9887" },
};
