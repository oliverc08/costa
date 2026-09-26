import { describe, expect, it } from "vitest";
import { screenEligibility } from "@/lib/eligibility";
import { annualFpl, monthlyFplLimit } from "@/lib/eligibility/limits";

describe("FPL math", () => {
  it("uses the 2026 poverty guidelines", () => {
    expect(annualFpl(1)).toBe(15_960);
    expect(annualFpl(4)).toBe(33_000);
  });

  it("rounds monthly limits up like DHCS", () => {
    expect(monthlyFplLimit(1, 138)).toBe(1836);
    expect(monthlyFplLimit(4, 138)).toBe(3795);
  });
});

describe("Medi-Cal screen", () => {
  it("asks for missing inputs", () => {
    const r = screenEligibility({ program: "medi-cal", householdSize: 3 });
    expect(r.result).toBe("need-more-info");
    expect(r.missing).toEqual(["monthlyIncome"]);
  });

  it("adult under 138% FPL is likely", () => {
    const r = screenEligibility({ program: "medi-cal", householdSize: 4, monthlyIncome: 3000, age: 35 });
    expect(r.result).toBe("likely");
    expect(r.limit?.amount).toBe(3795);
  });

  it("adult just over the limit is possibly", () => {
    const r = screenEligibility({ program: "medi-cal", householdSize: 1, monthlyIncome: 1900, age: 30 });
    expect(r.result).toBe("possibly");
  });

  it("adult well over the limit is unlikely and mentions Covered California", () => {
    const r = screenEligibility({ program: "medi-cal", householdSize: 1, monthlyIncome: 4000, age: 30 });
    expect(r.result).toBe("unlikely");
    expect(r.reasons.join(" ")).toMatch(/Covered California/);
  });

  it("children use the 266% limit", () => {
    const r = screenEligibility({ program: "medi-cal", householdSize: 4, monthlyIncome: 6500, age: 8 });
    expect(r.result).toBe("likely");
  });

  it("children between 266% and 322% point to C-CHIP", () => {
    const r = screenEligibility({ program: "medi-cal", householdSize: 4, monthlyIncome: 8500, age: 8 });
    expect(r.result).toBe("possibly");
    expect(r.reasons.join(" ")).toMatch(/C-CHIP/);
  });

  it("pregnancy uses 213% then MCAP", () => {
    expect(screenEligibility({ program: "medi-cal", householdSize: 2, monthlyIncome: 3800, pregnant: true }).result).toBe(
      "likely",
    );
    const mcap = screenEligibility({ program: "medi-cal", householdSize: 2, monthlyIncome: 5000, pregnant: true });
    expect(mcap.result).toBe("possibly");
    expect(mcap.reasons.join(" ")).toMatch(/MCAP/);
  });

  it("65+ is routed to the aged and disabled rules", () => {
    const r = screenEligibility({ program: "medi-cal", householdSize: 1, monthlyIncome: 1500, age: 70 });
    expect(r.result).toBe("possibly");
    expect(r.reasons.join(" ")).toMatch(/asset/);
  });

  it("never asserts a final decision", () => {
    const r = screenEligibility({ program: "medi-cal", householdSize: 2, monthlyIncome: 1000, age: 40 });
    expect(r.disclaimer).toMatch(/not a decision/);
    expect(JSON.stringify(r)).not.toMatch(/you qualify/i);
  });
});

describe("CalFresh screen", () => {
  it("uses the 200% gross table", () => {
    expect(screenEligibility({ program: "calfresh", householdSize: 3, monthlyIncome: 4400 }).result).toBe("likely");
    expect(screenEligibility({ program: "calfresh", householdSize: 3, monthlyIncome: 6000 }).result).toBe("unlikely");
  });

  it("extends the table past 8 people", () => {
    const r = screenEligibility({ program: "calfresh", householdSize: 10, monthlyIncome: 1 });
    expect(r.limit?.amount).toBe(9026 + 918 * 2);
  });
});

describe("WIC screen", () => {
  it("requires a WIC category", () => {
    expect(screenEligibility({ program: "wic", householdSize: 2, monthlyIncome: 1000 }).result).toBe("need-more-info");
  });

  it("is unlikely when nobody is in a WIC category", () => {
    expect(screenEligibility({ program: "wic", wicCategory: "none" }).result).toBe("unlikely");
  });

  it("Medi-Cal enrollment gives adjunctive eligibility", () => {
    const r = screenEligibility({ program: "wic", wicCategory: "infant", receivesMediCalCalFreshOrCalWorks: true });
    expect(r.result).toBe("likely");
  });

  it("uses the 185% table", () => {
    expect(
      screenEligibility({ program: "wic", wicCategory: "pregnant", householdSize: 2, monthlyIncome: 3300 }).result,
    ).toBe("likely");
    expect(
      screenEligibility({ program: "wic", wicCategory: "pregnant", householdSize: 2, monthlyIncome: 4000 }).result,
    ).toBe("unlikely");
  });
});

describe("CalEITC screen", () => {
  it("works with an ITIN and adds the Young Child Tax Credit", () => {
    const r = screenEligibility({
      program: "caleitc",
      annualEarnedIncome: 20_000,
      qualifyingChildren: 2,
      youngestChildAge: 3,
      hasSsnOrItin: true,
    });
    expect(r.result).toBe("likely");
    expect(r.estimate).toMatch(/\$3,339/);
    expect(r.estimate).toMatch(/\$1,189/);
    expect(r.notes.join(" ")).toMatch(/ITIN/);
  });

  it("is unlikely above the earned income limit", () => {
    const r = screenEligibility({ program: "caleitc", annualEarnedIncome: 40_000, qualifyingChildren: 1, hasSsnOrItin: true });
    expect(r.result).toBe("unlikely");
  });

  it("points to Form W-7 without an SSN or ITIN", () => {
    const r = screenEligibility({ program: "caleitc", annualEarnedIncome: 15_000, qualifyingChildren: 0, hasSsnOrItin: false });
    expect(r.result).toBe("possibly");
    expect(r.reasons.join(" ")).toMatch(/W-7/);
  });
});
