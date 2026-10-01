import { z } from "zod";
import type { LanguageCode } from "@/lib/languages";

export type County = "san-mateo" | "santa-clara";
export type HelpNeed = "apply" | "renew" | "legal-help" | "appeal" | "tax-help" | "disaster" | "general";
export type HelpProgram = "medi-cal" | "calfresh" | "wic" | "caleitc" | "disaster";

export const findLocalHelpInputSchema = z.object({
  area: z
    .string()
    .default("unknown")
    .describe("City, county, or ZIP the person mentioned, e.g. 'Half Moon Bay', 'San Jose', '95128'."),
  program: z.enum(["medi-cal", "calfresh", "wic", "caleitc", "disaster", "any"]).default("any"),
  language: z.enum(["en", "es", "zh", "tl", "vi"]).default("en").describe("Language the person is using."),
  need: z.enum(["apply", "renew", "legal-help", "appeal", "tax-help", "disaster", "general"]).default("general"),
});

export type FindLocalHelpInput = z.input<typeof findLocalHelpInputSchema>;

interface Provider {
  id: string;
  name: string;
  kind: "county" | "state" | "legal" | "community" | "federal";
  counties: County[] | "statewide";
  programs: HelpProgram[] | "all";
  needs: HelpNeed[];
  phone: string | null;
  /** Language-specific phone lines, when the provider publishes them. */
  phoneByLanguage?: Partial<Record<LanguageCode, string>>;
  url: string;
  address?: string;
  hours: string | null;
  /** Languages staff speak directly; "interpreters" means free interpreters for any language. */
  languages: LanguageCode[] | "interpreters";
  description: string;
}

const PROVIDERS: Provider[] = [
  {
    id: "smc-hsa",
    name: "San Mateo County Human Services Agency",
    kind: "county",
    counties: ["san-mateo"],
    programs: ["medi-cal", "calfresh"],
    needs: ["apply", "renew", "general"],
    phone: "1-800-223-8383",
    url: "https://www.smcgov.org/hsa",
    hours: "Mon-Fri, 8 AM-5 PM",
    languages: "interpreters",
    description: "County office that handles Medi-Cal and CalFresh applications, renewals, and changes.",
  },
  {
    id: "scc-ssa",
    name: "Santa Clara County Social Services Agency",
    kind: "county",
    counties: ["santa-clara"],
    programs: ["medi-cal", "calfresh"],
    needs: ["apply", "renew", "general"],
    phone: "1-877-962-3633",
    url: "https://ssa.santaclaracounty.gov/",
    hours: "Mon-Fri, 8 AM-5 PM",
    languages: "interpreters",
    description: "County office for Medi-Cal and CalFresh. Benefits Assistance Center: (408) 758-3800.",
  },
  {
    id: "alas",
    name: "Ayudando Latinos A Soñar (ALAS)",
    kind: "community",
    counties: ["san-mateo"],
    programs: "all",
    needs: ["apply", "renew", "general"],
    phone: "650-560-8947",
    url: "https://www.alasdreams.com/",
    address: "507 Purissima St, Half Moon Bay",
    hours: null,
    languages: ["es", "en"],
    description: "Half Moon Bay community organization serving Latino and farmworker families on the Coastside. Call to ask what help they offer.",
  },
  {
    id: "puente",
    name: "Puente de la Costa Sur",
    kind: "community",
    counties: ["san-mateo"],
    programs: "all",
    needs: ["apply", "renew", "tax-help", "general"],
    phone: "(650) 879-1691",
    url: "https://mypuente.org/",
    address: "620 North St, Pescadero",
    hours: "Mon-Fri, 8 AM-5 PM (closed 1-1:30 PM)",
    languages: ["es", "en"],
    description: "Community resource center for Pescadero, La Honda, and the South Coast.",
  },
  {
    id: "sacred-heart",
    name: "Sacred Heart Community Service",
    kind: "community",
    counties: ["santa-clara"],
    programs: "all",
    needs: ["apply", "general"],
    phone: "(408) 278-2160",
    url: "https://www.sacredheartcs.org/",
    address: "1381 S First St, San José",
    hours: null,
    languages: ["es", "en", "vi"],
    description: "San José community organization with food and family support services.",
  },
  {
    id: "hca",
    name: "Health Consumer Alliance",
    kind: "legal",
    counties: "statewide",
    programs: ["medi-cal"],
    needs: ["legal-help", "appeal", "renew"],
    phone: "1-888-804-3536",
    url: "https://healthconsumer.org/",
    hours: "Mon-Fri, 9 AM-5 PM",
    languages: "interpreters",
    description: "Free legal help with Medi-Cal problems, denials, and lost coverage.",
  },
  {
    id: "state-hearings",
    name: "CDSS State Hearings",
    kind: "state",
    counties: "statewide",
    programs: ["medi-cal", "calfresh"],
    needs: ["appeal"],
    phone: "1-800-743-8525",
    url: "https://www.cdss.ca.gov/hearing-requests",
    hours: null,
    languages: "interpreters",
    description: "Request a State Hearing if you disagree with a Medi-Cal or CalFresh decision (within 90 days).",
  },
  {
    id: "covered-ca",
    name: "Covered California",
    kind: "state",
    counties: "statewide",
    programs: ["medi-cal"],
    needs: ["apply", "general"],
    phone: "1-800-300-1506",
    phoneByLanguage: { es: "1-800-300-0213", zh: "1-800-300-1533", tl: "1-800-983-8816", vi: "1-800-652-9528" },
    url: "https://www.coveredca.com/",
    hours: "Mon-Fri, 8 AM-6 PM",
    languages: ["en", "es", "zh", "tl", "vi"],
    description: "Apply for Medi-Cal or low-cost health insurance. Has phone lines in many languages.",
  },
  {
    id: "calfresh-line",
    name: "CalFresh Information Line",
    kind: "state",
    counties: "statewide",
    programs: ["calfresh"],
    needs: ["apply", "renew", "general", "disaster"],
    phone: "1-877-847-3663",
    url: "https://www.cdss.ca.gov/benefits-services/food-nutrition-services/calfresh/frequently-asked-questions",
    hours: null,
    languages: "interpreters",
    description: "Connects you to your county CalFresh office.",
  },
  {
    id: "wic",
    name: "California WIC",
    kind: "state",
    counties: "statewide",
    programs: ["wic"],
    needs: ["apply", "general"],
    phone: "1-800-852-5770",
    url: "https://myfamily.wic.ca.gov/",
    hours: null,
    languages: "interpreters",
    description: "Find your local WIC office and make an appointment.",
  },
  {
    id: "vita",
    name: "IRS Volunteer Income Tax Assistance (VITA)",
    kind: "federal",
    counties: "statewide",
    programs: ["caleitc"],
    needs: ["tax-help"],
    phone: "1-800-906-9887",
    url: "https://www.irs.gov/vita",
    hours: null,
    languages: "interpreters",
    description: "Free tax filing help for people with low to moderate income, including ITIN filers.",
  },
  {
    id: "fema",
    name: "FEMA Disaster Assistance",
    kind: "federal",
    counties: "statewide",
    programs: ["disaster"],
    needs: ["disaster"],
    phone: "1-800-621-3362",
    url: "https://www.disasterassistance.gov/",
    hours: null,
    languages: "interpreters",
    description: "Apply for federal disaster help after a declared disaster.",
  },
  {
    id: "211",
    name: "211 Bay Area",
    kind: "community",
    counties: ["san-mateo", "santa-clara"],
    programs: "all",
    needs: ["general", "disaster"],
    phone: "211",
    url: "https://www.211bayarea.org/",
    hours: "24/7",
    languages: "interpreters",
    description: "Free, confidential line that connects you to local services.",
  },
];

/** Every phone number in the curated directory, including language-specific lines. */
export function providerPhones(): string[] {
  return PROVIDERS.flatMap((p) => [p.phone, ...Object.values(p.phoneByLanguage ?? {})]).filter(
    (x): x is string => Boolean(x),
  );
}

const SAN_MATEO_PLACES = [
  "san mateo", "half moon bay", "pescadero", "la honda", "san gregorio", "el granada", "montara", "moss beach",
  "princeton", "coastside", "pacifica", "daly city", "redwood city", "menlo park", "east palo alto", "burlingame",
  "foster city", "san carlos", "belmont", "millbrae", "south san francisco", "san bruno", "atherton",
  "portola valley", "woodside", "colma", "brisbane", "hillsborough", "north fair oaks",
];

const SANTA_CLARA_PLACES = [
  "santa clara", "san jose", "cupertino", "los altos", "palo alto", "mountain view", "sunnyvale", "campbell",
  "saratoga", "los gatos", "monte sereno", "milpitas", "morgan hill", "gilroy", "silicon valley", "alviso",
];

function fold(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim();
}

function countyFromZip(zip: string): County | null {
  const n = Number(zip);
  if ((n >= 95002 && n <= 95196) || (n >= 94301 && n <= 94309)) return "santa-clara";
  if ([94022, 94023, 94024, 94035, 94039, 94040, 94041, 94042, 94043, 94085, 94086, 94087, 94088, 94089].includes(n)) {
    return "santa-clara";
  }
  if ((n >= 94002 && n <= 94083) || (n >= 94401 && n <= 94404) || n === 94128) return "san-mateo";
  return null;
}

/** Maps a free-text area to one of the two CA-16 counties Costa covers, or null. */
export function normalizeArea(area: string): County | null {
  const zip = area.match(/\b(9[45]\d{3})\b/);
  if (zip) {
    const c = countyFromZip(zip[1]);
    if (c) return c;
  }
  const a = fold(area);
  if (!a || a === "unknown") return null;
  // Check Santa Clara first so "santa clara" is not caught by the generic "san mateo" list.
  if (SANTA_CLARA_PLACES.some((p) => a.includes(p))) return "santa-clara";
  if (SAN_MATEO_PLACES.some((p) => a.includes(p))) return "san-mateo";
  return null;
}

export interface ProviderCard {
  id: string;
  name: string;
  kind: Provider["kind"];
  phone: string | null;
  url: string;
  address?: string;
  hours: string | null;
  languages: LanguageCode[] | "interpreters";
}

/**
 * The directory for the Help screen: everything in the person's county, then the
 * statewide lines, with lines for the chosen program first.
 */
export function listProviders(county: County | null, lang: LanguageCode, program: HelpProgram | "any" = "any") {
  const serves = (p: Provider) => program === "any" || p.programs === "all" || p.programs.includes(program);
  const card = (p: Provider): ProviderCard => ({
    id: p.id,
    name: p.name,
    kind: p.kind,
    phone: p.phoneByLanguage?.[lang] ?? p.phone,
    url: p.url,
    address: p.address,
    hours: p.hours,
    languages: p.languages,
  });
  const byRelevance = (x: Provider, y: Provider) => Number(serves(y)) - Number(serves(x));
  const local = county
    ? PROVIDERS.filter((p) => p.counties !== "statewide" && p.counties.includes(county)).sort(byRelevance).map(card)
    : [];
  const statewide = PROVIDERS.filter((p) => p.counties === "statewide").sort(byRelevance).map(card);
  return { local, statewide };
}

export interface LocalHelpResult {
  id: string;
  name: string;
  phone: string | null;
  url: string;
  address?: string;
  hours: string | null;
  languagesNote: string;
  description: string;
}

export interface LocalHelpOutput {
  county: County | null;
  results: LocalHelpResult[];
  note: string;
}

const LANGUAGE_NAMES: Record<LanguageCode, string> = {
  en: "English",
  es: "Spanish",
  zh: "Mandarin",
  tl: "Tagalog",
  vi: "Vietnamese",
  ko: "Korean",
  pt: "Portuguese",
};

function languagesNote(p: Provider, lang: LanguageCode): string {
  if (p.languages === "interpreters") return "Free interpreter available; ask for one in your language.";
  const names = p.languages.map((l) => LANGUAGE_NAMES[l]).join(", ");
  return p.languages.includes(lang) ? `Staff speak ${names}.` : `Staff speak ${names}; ask about an interpreter.`;
}

function score(p: Provider, county: County | null, program: string, need: HelpNeed, lang: LanguageCode): number {
  let s = 0;
  if (p.needs.includes(need)) s += 4;
  if (program !== "any" && p.programs !== "all" && p.programs.includes(program as HelpProgram)) s += 3;
  if (county && p.counties !== "statewide" && p.counties.includes(county)) s += 3;
  if (p.kind === "community" && p.languages !== "interpreters" && p.languages.includes(lang)) s += 1;
  if (need === "appeal" || need === "legal-help") s += p.kind === "legal" || p.kind === "state" ? 2 : 0;
  return s;
}

export function findLocalHelp(raw: FindLocalHelpInput): LocalHelpOutput {
  const input = findLocalHelpInputSchema.parse(raw);
  const county = normalizeArea(input.area);
  const candidates = PROVIDERS.filter((p) => {
    if (p.counties !== "statewide" && county && !p.counties.includes(county)) return false;
    if (p.counties !== "statewide" && !county && p.kind === "county") return false;
    if (input.program !== "any" && p.programs !== "all" && !p.programs.includes(input.program)) return false;
    return true;
  });
  const ranked = candidates
    .map((p) => ({ p, s: score(p, county, input.program, input.need, input.language) }))
    .filter(({ s }) => s > 0)
    .sort((a, b) => b.s - a.s)
    .slice(0, 3)
    .map(({ p }) => ({
      id: p.id,
      name: p.name,
      phone: p.phoneByLanguage?.[input.language] ?? p.phone,
      url: p.url,
      address: p.address,
      hours: p.hours,
      languagesNote: languagesNote(p, input.language),
      description: p.description,
    }));
  return {
    county,
    results: ranked,
    note: county
      ? "Share these exactly as written. Do not invent other phone numbers or offices."
      : "The area was not in San Mateo or Santa Clara County (or was unknown), so only statewide help is listed. Ask for their city if it would help.",
  };
}
