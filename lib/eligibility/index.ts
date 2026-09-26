import { z } from "zod";
import {
  CALEITC_2025,
  CALFRESH_ADDITIONAL,
  CALFRESH_GROSS_LIMITS,
  MEDI_CAL_PERCENT,
  RULE_SOURCES,
  WIC_ADDITIONAL,
  WIC_MONTHLY_LIMITS,
  monthlyFplLimit,
  tableLimit,
} from "./limits";

export const eligibilityInputSchema = z.object({
  program: z.enum(["medi-cal", "calfresh", "wic", "caleitc"]),
  householdSize: z
    .number()
    .int()
    .min(1)
    .max(20)
    .optional()
    .describe("People in the household. For pregnancy, count the unborn baby (or babies)."),
  monthlyIncome: z
    .number()
    .min(0)
    .optional()
    .describe("Household gross monthly income before taxes, in US dollars."),
  annualEarnedIncome: z
    .number()
    .min(0)
    .optional()
    .describe("CalEITC only: yearly earned income from work, in US dollars."),
  age: z.number().int().min(0).max(120).optional().describe("Age of the person being screened."),
  pregnant: z.boolean().optional(),
  hasDisability: z.boolean().optional(),
  receivesMediCalCalFreshOrCalWorks: z
    .boolean()
    .optional()
    .describe("WIC only: someone in the family already gets Medi-Cal, CalFresh, or CalWORKs."),
  wicCategory: z
    .enum(["pregnant", "breastfeeding", "postpartum", "infant", "child-under-5", "none"])
    .optional(),
  qualifyingChildren: z.number().int().min(0).max(15).optional().describe("CalEITC only."),
  youngestChildAge: z.number().int().min(0).max(25).optional().describe("CalEITC only, for the Young Child Tax Credit."),
  hasSsnOrItin: z
    .boolean()
    .optional()
    .describe("CalEITC only: has a Social Security number or ITIN. Never ask about immigration status."),
});

export type EligibilityInput = z.infer<typeof eligibilityInputSchema>;

export type ScreenResult = "likely" | "possibly" | "unlikely" | "need-more-info";

export interface EligibilityOutput {
  program: EligibilityInput["program"];
  result: ScreenResult;
  reasons: string[];
  missing: string[];
  notes: string[];
  /** Background to mention only if the user raised immigration status. */
  immigrationContext?: string;
  limit?: { amount: number; period: "month" | "year"; description: string };
  estimate?: string;
  rulesSource: (typeof RULE_SOURCES)[keyof typeof RULE_SOURCES];
  disclaimer: string;
}

const DISCLAIMER =
  "This is a screening estimate, not a decision. Only the county or agency can decide eligibility after an application. Say 'may qualify', never 'qualifies'.";

const usd = (n: number) => `$${n.toLocaleString("en-US")}`;

function base(program: EligibilityInput["program"]): Pick<EligibilityOutput, "program" | "rulesSource" | "disclaimer"> {
  return { program, rulesSource: RULE_SOURCES[program], disclaimer: DISCLAIMER };
}

function compare(income: number, limit: number): ScreenResult {
  if (income <= limit) return "likely";
  if (income <= limit * 1.05) return "possibly";
  return "unlikely";
}

function screenMediCal(i: EligibilityInput): EligibilityOutput {
  const missing: string[] = [];
  if (i.householdSize === undefined) missing.push("householdSize");
  if (i.monthlyIncome === undefined) missing.push("monthlyIncome");
  if (missing.length) {
    return { ...base("medi-cal"), result: "need-more-info", reasons: ["Medi-Cal uses household size and monthly income before taxes."], missing, notes: [] };
  }
  const size = i.householdSize!;
  const income = i.monthlyIncome!;
  const notes: string[] = [];
  const immigrationContext =
    "Since January 1, 2026, some adults 19 and older can only newly get restricted-scope Medi-Cal because of immigration status. Children under 19 and pregnant people can still get full-scope Medi-Cal. The county decides.";

  if (i.pregnant) {
    const full = monthlyFplLimit(size, MEDI_CAL_PERCENT.pregnant);
    const mcap = monthlyFplLimit(size, MEDI_CAL_PERCENT.mcapMax);
    if (income <= full) {
      return {
        ...base("medi-cal"),
        result: "likely",
        reasons: [`Income ${usd(income)}/month is at or below the pregnancy limit of ${usd(full)}/month for ${size} people (213% FPL).`],
        missing: [],
        notes: ["A pregnant person counts as two (or more) people.", "Presumptive Eligibility can give immediate prenatal coverage."],
        immigrationContext,
        limit: { amount: full, period: "month", description: "Medi-Cal for pregnant people, 213% FPL" },
      };
    }
    return {
      ...base("medi-cal"),
      result: income <= mcap ? "possibly" : "unlikely",
      reasons: [
        income <= mcap
          ? `Income is above the no-cost limit (${usd(full)}/month) but at or below ${usd(mcap)}/month, so the Medi-Cal Access Program (MCAP) may apply.`
          : `Income is above the MCAP limit of ${usd(mcap)}/month for ${size} people. Covered California may be an option.`,
      ],
      missing: [],
      notes,
      immigrationContext,
      limit: { amount: mcap, period: "month", description: "Medi-Cal Access Program (MCAP), 322% FPL" },
    };
  }

  if (i.age !== undefined && i.age < 19) {
    const limit = monthlyFplLimit(size, MEDI_CAL_PERCENT.child);
    const cchip = monthlyFplLimit(size, MEDI_CAL_PERCENT.cchipMax);
    const r = compare(income, limit);
    return {
      ...base("medi-cal"),
      result: r === "unlikely" && income <= cchip ? "possibly" : r,
      reasons: [
        r === "likely"
          ? `Income ${usd(income)}/month is at or below the children's limit of ${usd(limit)}/month for ${size} people (266% FPL).`
          : income <= cchip
            ? `Income is above ${usd(limit)}/month but at or below ${usd(cchip)}/month. In San Mateo and Santa Clara counties, the County Children's Health Initiative Program (C-CHIP) may apply.`
            : `Income is above the children's limits for ${size} people.`,
      ],
      missing: [],
      notes: ["Children under 19 can get full-scope Medi-Cal regardless of immigration status if they meet income rules."],
      limit: { amount: limit, period: "month", description: "Medi-Cal for children under 19, 266% FPL" },
    };
  }

  const limit = monthlyFplLimit(size, MEDI_CAL_PERCENT.adult);
  if ((i.age !== undefined && i.age >= 65) || i.hasDisability) {
    return {
      ...base("medi-cal"),
      result: "possibly",
      reasons: [
        `People who are 65 or older or have a disability use different Medi-Cal rules, including an asset limit ($130,000 for one person plus $65,000 per additional person through June 30, 2027). The income guide is about ${usd(limit)}/month for ${size} people (138% FPL), but other programs may apply above it.`,
      ],
      missing: [],
      notes: ["The county reviews both income and assets for this group."],
      immigrationContext,
      limit: { amount: limit, period: "month", description: "Aged and Disabled FPL program, 138% FPL" },
    };
  }

  if (i.age === undefined) notes.push("Used the adult limit. Children under 19 and pregnant people have higher limits.");
  const r = compare(income, limit);
  return {
    ...base("medi-cal"),
    result: r,
    reasons: [
      r === "likely"
        ? `Income ${usd(income)}/month is at or below the adult limit of ${usd(limit)}/month for ${size} people (138% FPL).`
        : r === "possibly"
          ? `Income ${usd(income)}/month is just above the adult limit of ${usd(limit)}/month. Some income may not count, so it is worth applying.`
          : `Income ${usd(income)}/month is above the adult limit of ${usd(limit)}/month for ${size} people. Covered California with financial help may be an option.`,
    ],
    missing: [],
    notes,
    immigrationContext,
    limit: { amount: limit, period: "month", description: "Medi-Cal for adults 19-64, 138% FPL" },
  };
}

function screenCalFresh(i: EligibilityInput): EligibilityOutput {
  const missing: string[] = [];
  if (i.householdSize === undefined) missing.push("householdSize");
  if (i.monthlyIncome === undefined) missing.push("monthlyIncome");
  if (missing.length) {
    return { ...base("calfresh"), result: "need-more-info", reasons: ["CalFresh uses household size and gross monthly income."], missing, notes: [] };
  }
  const size = i.householdSize!;
  const income = i.monthlyIncome!;
  const limit = tableLimit(CALFRESH_GROSS_LIMITS, CALFRESH_ADDITIONAL, size);
  const immigrationContext =
    "Since April 1, 2026, many lawfully present immigrants no longer qualify for CalFresh because of a federal law (H.R. 1). The county decides who in the household can get benefits.";
  if ((i.age !== undefined && i.age >= 60) || i.hasDisability) {
    return {
      ...base("calfresh"),
      result: income <= limit ? "likely" : "possibly",
      reasons: [`Households with someone 60+ or with a disability can have different rules. The general gross limit is ${usd(limit)}/month for ${size} people.`],
      missing: [],
      notes: ["The benefit amount depends on income and expenses like rent and utilities."],
      immigrationContext,
      limit: { amount: limit, period: "month", description: "CalFresh gross income limit, 200% FPL" },
    };
  }
  const r = compare(income, limit);
  return {
    ...base("calfresh"),
    result: r,
    reasons: [
      r === "likely"
        ? `Gross income ${usd(income)}/month is at or below the CalFresh limit of ${usd(limit)}/month for ${size} people.`
        : r === "possibly"
          ? `Gross income is just above the limit of ${usd(limit)}/month; the county may count income differently.`
          : `Gross income ${usd(income)}/month is above the CalFresh limit of ${usd(limit)}/month for ${size} people.`,
    ],
    missing: [],
    notes: ["The benefit amount depends on income and expenses like rent and utilities.", "Some adults may need to meet work rules to keep CalFresh (since June 1, 2026)."],
    immigrationContext,
    limit: { amount: limit, period: "month", description: "CalFresh gross income limit, 200% FPL" },
  };
}

function screenWic(i: EligibilityInput): EligibilityOutput {
  if (!i.wicCategory) {
    return {
      ...base("wic"),
      result: "need-more-info",
      reasons: ["WIC is for people who are pregnant, breastfeeding, or recently had a baby, and for children under 5."],
      missing: ["wicCategory"],
      notes: [],
    };
  }
  if (i.wicCategory === "none") {
    return {
      ...base("wic"),
      result: "unlikely",
      reasons: ["WIC only serves pregnant people, breastfeeding parents (baby under 1), people within 6 months after pregnancy, infants, and children under 5."],
      missing: [],
      notes: ["Fathers, grandparents, and guardians can apply for an eligible child."],
    };
  }
  if (i.receivesMediCalCalFreshOrCalWorks) {
    return {
      ...base("wic"),
      result: "likely",
      reasons: ["People who get Medi-Cal, CalFresh, or CalWORKs automatically meet WIC's income rule."],
      missing: [],
      notes: ["WIC staff still do a short nutrition check.", "WIC does not ask about immigration status."],
    };
  }
  const missing: string[] = [];
  if (i.householdSize === undefined) missing.push("householdSize");
  if (i.monthlyIncome === undefined) missing.push("monthlyIncome");
  if (missing.length) {
    return {
      ...base("wic"),
      result: "need-more-info",
      reasons: ["WIC uses household size and gross monthly income, unless the family already gets Medi-Cal, CalFresh, or CalWORKs."],
      missing: [...missing, "receivesMediCalCalFreshOrCalWorks"],
      notes: [],
    };
  }
  const size = i.householdSize!;
  const limit = tableLimit(WIC_MONTHLY_LIMITS, WIC_ADDITIONAL, size);
  const r = compare(i.monthlyIncome!, limit);
  return {
    ...base("wic"),
    result: r,
    reasons: [
      r === "unlikely"
        ? `Gross income is above the WIC limit of ${usd(limit)}/month for ${size} people.`
        : `Gross income ${usd(i.monthlyIncome!)}/month compared with the WIC limit of ${usd(limit)}/month for ${size} people.`,
    ],
    missing: [],
    notes: ["An unborn baby counts in household size.", "WIC does not ask about immigration status.", "WIC staff make the final decision."],
    limit: { amount: limit, period: "month", description: "WIC gross income limit, 185% FPL" },
  };
}

function screenCalEitc(i: EligibilityInput): EligibilityOutput {
  const missing: string[] = [];
  if (i.annualEarnedIncome === undefined) missing.push("annualEarnedIncome");
  if (i.qualifyingChildren === undefined) missing.push("qualifyingChildren");
  if (missing.length) {
    return {
      ...base("caleitc"),
      result: "need-more-info",
      reasons: ["CalEITC uses yearly earned income and the number of qualifying children."],
      missing,
      notes: [],
    };
  }
  const earned = i.annualEarnedIncome!;
  const kids = i.qualifyingChildren!;
  const hasYoungChild = i.youngestChildAge !== undefined && i.youngestChildAge < 6 && kids > 0;
  const maxCredit = CALEITC_2025.maxCredit[Math.min(kids, 3)];
  const notes = [
    "You must file a California tax return (Form 540 with FTB 3514) to get it.",
    "The federal EITC requires a Social Security number; ITIN filers can still get CalEITC and the Young Child Tax Credit.",
  ];

  if (i.hasSsnOrItin === false) {
    return {
      ...base("caleitc"),
      result: "possibly",
      reasons: ["CalEITC requires a Social Security number or an ITIN. You can apply to the IRS for an ITIN with Form W-7."],
      missing: [],
      notes,
    };
  }
  if (i.age !== undefined && i.age < 18 && kids === 0) {
    return { ...base("caleitc"), result: "unlikely", reasons: ["You must be at least 18, or have a qualifying child."], missing: [], notes };
  }
  if (earned > CALEITC_2025.maxEarnedIncome) {
    return {
      ...base("caleitc"),
      result: "unlikely",
      reasons: [`Earned income ${usd(earned)} is above the tax year 2025 limit of ${usd(CALEITC_2025.maxEarnedIncome)}.`],
      missing: [],
      notes,
      limit: { amount: CALEITC_2025.maxEarnedIncome, period: "year", description: "CalEITC earned income limit, tax year 2025" },
    };
  }
  if (earned === 0) {
    return {
      ...base("caleitc"),
      result: hasYoungChild ? "possibly" : "unlikely",
      reasons: hasYoungChild
        ? ["CalEITC needs at least $1 of earned income, but some families with $0 earned income can still get the Young Child Tax Credit (up to $1,189)."]
        : ["CalEITC needs at least $1 of earned income."],
      missing: [],
      notes,
    };
  }
  const estimateParts = [`CalEITC up to ${usd(maxCredit)}`];
  if (hasYoungChild) estimateParts.push(`Young Child Tax Credit up to ${usd(CALEITC_2025.yctcMax)}`);
  return {
    ...base("caleitc"),
    result: i.hasSsnOrItin === undefined ? "possibly" : "likely",
    reasons: [
      `Earned income ${usd(earned)} is within the tax year 2025 limit of ${usd(CALEITC_2025.maxEarnedIncome)}.`,
      ...(i.hasSsnOrItin === undefined ? ["You also need a Social Security number or ITIN for yourself (and any children you claim)."] : []),
    ],
    missing: i.hasSsnOrItin === undefined ? ["hasSsnOrItin"] : [],
    notes: [
      ...notes,
      ...(hasYoungChild && earned > CALEITC_2025.yctcPhaseOutStart
        ? [`The Young Child Tax Credit gets smaller above ${usd(CALEITC_2025.yctcPhaseOutStart)} of earned income.`]
        : []),
      "Most people get less than the maximum; the amount depends on income.",
    ],
    estimate: estimateParts.join("; "),
    limit: { amount: CALEITC_2025.maxEarnedIncome, period: "year", description: "CalEITC earned income limit, tax year 2025" },
  };
}

export function screenEligibility(input: EligibilityInput): EligibilityOutput {
  switch (input.program) {
    case "medi-cal":
      return screenMediCal(input);
    case "calfresh":
      return screenCalFresh(input);
    case "wic":
      return screenWic(input);
    case "caleitc":
      return screenCalEitc(input);
  }
}
