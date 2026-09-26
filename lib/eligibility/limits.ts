/** 2026 HHS poverty guidelines, 48 contiguous states (Federal Register, Jan 15, 2026). */
export const FPL_2026 = { base: 15_960, perAdditional: 5_680 } as const;

export function annualFpl(householdSize: number): number {
  return FPL_2026.base + FPL_2026.perAdditional * (householdSize - 1);
}

/** DHCS publishes FPL-based monthly limits rounded up to the next dollar. */
export function monthlyFplLimit(householdSize: number, percent: number): number {
  return Math.ceil((annualFpl(householdSize) * percent) / 100 / 12);
}

export const MEDI_CAL_PERCENT = {
  adult: 138,
  child: 266,
  pregnant: 213,
  mcapMax: 322,
  cchipMax: 322,
  agedDisabled: 138,
} as const;

/** CalFresh 200% FPL gross monthly limits (BBCE), Oct 1, 2025 to Sep 30, 2026. */
export const CALFRESH_GROSS_LIMITS = [2610, 3526, 4442, 5360, 6276, 7192, 8110, 9026] as const;
export const CALFRESH_ADDITIONAL = 918;

/** California WIC 185% FPL gross monthly limits, May 1, 2026 to Jun 30, 2027. */
export const WIC_MONTHLY_LIMITS = [2461, 3337, 4212, 5088, 5964, 6839, 7715, 8591] as const;
export const WIC_ADDITIONAL = 876;

/** FTB tax year 2025. */
export const CALEITC_2025 = {
  maxEarnedIncome: 32_900,
  maxCredit: [302, 2016, 3339, 3756] as const,
  yctcMax: 1189,
  yctcPhaseOutStart: 27_425,
  yctcNoEarnedIncomeMaxWagesOrLoss: 35_640,
} as const;

export function tableLimit(table: readonly number[], additional: number, size: number): number {
  if (size <= table.length) return table[size - 1];
  return table[table.length - 1] + additional * (size - table.length);
}

export const RULE_SOURCES = {
  "medi-cal": {
    agency: "California Department of Health Care Services (DHCS)",
    url: "https://www.dhcs.ca.gov/medi-cal/help/",
    effective: "2026 FPL limits (DHCS ACWDL 26-01)",
    lastVerified: "2026-09-26",
  },
  calfresh: {
    agency: "California Department of Social Services (CDSS)",
    url: "https://www.cdss.ca.gov/benefits-services/food-nutrition-services/calfresh/frequently-asked-questions",
    effective: "Oct 1, 2025 to Sep 30, 2026",
    lastVerified: "2026-09-26",
  },
  wic: {
    agency: "California Department of Public Health, WIC Division",
    url: "https://myfamily.wic.ca.gov/Home/AmIEligible",
    effective: "May 1, 2026 to Jun 30, 2027",
    lastVerified: "2026-09-26",
  },
  caleitc: {
    agency: "California Franchise Tax Board (FTB)",
    url: "https://www.ftb.ca.gov/file/personal/credits/caleitc/eligibility-and-credit-information.html",
    effective: "Tax year 2025",
    lastVerified: "2026-09-26",
  },
} as const;
