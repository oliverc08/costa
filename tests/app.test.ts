import { describe, expect, it } from "vitest";
import { POST as handoff } from "@/app/api/handoff/route";
import { monthlyIncome, runCheckup, type CheckupAnswers } from "@/lib/checkup";
import { daysFromToday, reminderIcs } from "@/lib/device";
import { FAQS, faqsForTopic } from "@/lib/faq";
import { APP } from "@/lib/i18n-app";
import { LANGUAGE_CODES } from "@/lib/languages";
import { listProviders } from "@/lib/local-help";
import { auditReply } from "@/lib/safety/output";

function allStrings(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (typeof value === "function") return allStrings(value.length >= 2 ? value(2, "$1,000") : value("$1,000"));
  if (Array.isArray(value)) return value.flatMap(allStrings);
  if (value && typeof value === "object") return Object.values(value).flatMap(allStrings);
  return [];
}

const base: CheckupAnswers = {
  county: "san-mateo",
  householdSize: 4,
  who: { pregnant: false, baby: false, young: false, kid: false, senior: false, disability: false },
  childrenUnder19: 0,
  income: { amount: 3000, period: "month" },
  fromWork: true,
  getsBenefits: "no",
};

describe("app strings", () => {
  it.each(LANGUAGE_CODES)("%s strings pass the output safety audit", (lang) => {
    for (const s of allStrings(APP[lang])) expect(auditReply(s), s).toEqual([]);
  });

  it.each(LANGUAGE_CODES)("%s has the same shape as English", (lang) => {
    const keys = (o: object, prefix = ""): string[] =>
      Object.entries(o).flatMap(([k, v]) => (v && typeof v === "object" && !Array.isArray(v) ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`]));
    expect(keys(APP[lang]).sort()).toEqual(keys(APP.en).sort());
  });

  it("every topic has verified answers", () => {
    for (const topic of ["health", "food", "money", "disaster"] as const) expect(faqsForTopic(topic).length).toBeGreaterThan(0);
    expect(new Set(FAQS.map((f) => f.id)).size).toBe(FAQS.length);
  });
});

describe("checkup", () => {
  it("converts pay periods to monthly income", () => {
    expect(monthlyIncome({ amount: 600, period: "week" })).toBe(2600);
    expect(monthlyIncome({ amount: 1200, period: "twoWeeks" })).toBe(2600);
    expect(monthlyIncome({ amount: 24_000, period: "year" })).toBe(2000);
    expect(monthlyIncome(null)).toBe(0);
  });

  it("screens a farmworker family with a pregnancy and a toddler", () => {
    const r = runCheckup({
      ...base,
      who: { ...base.who, pregnant: true, young: true },
      childrenUnder19: 2,
      income: { amount: 36_000, period: "year" },
    });
    const byProgram = Object.fromEntries(r.programs.map((p) => [p.program, p]));
    const medi = byProgram["medi-cal"];
    expect(medi.sizeUsed).toBe(5);
    expect(medi.groups.find((g) => g.group === "children")?.status).toBe("likely");
    expect(medi.groups.find((g) => g.group === "pregnancy")?.status).toBe("likely");
    expect(medi.notes).toContain("kidsAnyStatus");
    expect(byProgram.wic.status).toBe("likely");
    expect(byProgram.calfresh.status).toBe("likely");
    expect(byProgram.caleitc.status).toBe("unlikely");
    expect(r.programs[0].status).toBe("likely");
  });

  it("finds CalEITC and the Young Child Tax Credit for lower earnings", () => {
    const r = runCheckup({ ...base, householdSize: 3, who: { ...base.who, baby: true }, childrenUnder19: 1, income: { amount: 450, period: "week" } });
    const eitc = r.programs.find((p) => p.program === "caleitc")!;
    expect(eitc.status).toBe("possibly");
    expect(eitc.upTo).toBe(2016);
    expect(eitc.yctcUpTo).toBe(1189);
  });

  it("treats families already on Medi-Cal as meeting the WIC income rule", () => {
    const r = runCheckup({ ...base, who: { ...base.who, baby: true }, childrenUnder19: 1, income: { amount: 9000, period: "month" }, getsBenefits: "yes" });
    const wic = r.programs.find((p) => p.program === "wic")!;
    expect(wic.status).toBe("likely");
    expect(wic.notes).toContain("wicAuto");
  });

  it("points higher-income adults to Covered California", () => {
    const r = runCheckup({ ...base, householdSize: 1, income: { amount: 5000, period: "month" } });
    const medi = r.programs.find((p) => p.program === "medi-cal")!;
    expect(medi.status).toBe("unlikely");
    expect(medi.notes).toContain("coveredCa");
  });

  it("builds a helper summary with no phone numbers or identifiers", () => {
    const r = runCheckup({ ...base, who: { ...base.who, kid: true }, childrenUnder19: 2 });
    expect(r.summary).toMatch(/household of 4/);
    expect(auditReply(r.summary)).toEqual([]);
  });
});

describe("reminders", () => {
  it("counts days to a date in local time", () => {
    expect(daysFromToday("2026-10-01", new Date(2026, 8, 27, 23, 30))).toBe(4);
    expect(daysFromToday("2026-09-27", new Date(2026, 8, 27, 8))).toBe(0);
  });

  it("exports an all-day calendar event with two alarms", () => {
    const ics = reminderIcs({ id: "abc", title: "Medi-Cal renewal, MC 216", date: "2026-10-15" }, "Send pay stubs");
    expect(ics).toContain("DTSTART;VALUE=DATE:20261015");
    expect(ics).toContain("DTEND;VALUE=DATE:20261016");
    expect(ics).toContain("SUMMARY:Medi-Cal renewal\\, MC 216");
    expect(ics.match(/BEGIN:VALARM/g)).toHaveLength(2);
  });
});

describe("help directory", () => {
  it("lists the county's local help and puts the chosen program first statewide", () => {
    const { local, statewide } = listProviders("san-mateo", "es", "wic");
    expect(local.map((p) => p.id)).toEqual(expect.arrayContaining(["smc-hsa", "alas", "puente"]));
    expect(local.some((p) => p.id === "scc-ssa")).toBe(false);
    expect(statewide[0].id).toBe("wic");
    expect(statewide.find((p) => p.id === "covered-ca")?.phone).toBe("1-800-300-0213");
  });

  it("shows only statewide lines when the county is unknown", () => {
    expect(listProviders(null, "en").local).toEqual([]);
  });

  it("accepts a general request for a person from the Help screen", async () => {
    const res = await handoff(
      new Request("http://localhost/api/handoff", {
        method: "POST",
        body: JSON.stringify({
          consent: true,
          language: "es",
          area: "Pescadero",
          preferredContact: "sms",
          contact: "(650) 555-0142",
          topic: "calfresh",
          note: "Necesito ayuda con la entrevista",
          checkup: "Checkup: household of 4, san-mateo county.",
        }),
      }),
    );
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.ok).toBe(true);
  });

  it("rejects a request without consent", async () => {
    const res = await handoff(
      new Request("http://localhost/api/handoff", {
        method: "POST",
        body: JSON.stringify({ consent: false, language: "en", area: "Gilroy", preferredContact: "call", contact: "4085550100", topic: "other" }),
      }),
    );
    expect(res.status).toBe(400);
  });
});
