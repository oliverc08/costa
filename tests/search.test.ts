import { beforeAll, describe, expect, it } from "vitest";

beforeAll(() => {
  delete process.env.AI_GATEWAY_API_KEY;
  delete process.env.VERCEL_OIDC_TOKEN;
  delete process.env.DATABASE_URL;
});

async function search(query: string, program?: Parameters<typeof import("@/lib/knowledge/search").searchBenefits>[0]["program"]) {
  const { searchBenefits } = await import("@/lib/knowledge/search");
  return searchBenefits({ query, program });
}

describe("searchBenefits (lexical mode)", () => {
  const cases: [string, string, string?][] = [
    ["how do I renew my Medi-Cal yellow envelope renewal form", "medi-cal-renewal"],
    ["my Medi-Cal was cut off because I did not send paperwork", "medi-cal-lost-coverage"],
    ["90 day cure period after Medi-Cal ended", "medi-cal-lost-coverage"],
    ["how to apply for Medi-Cal health insurance", "medi-cal-apply"],
    ["Medi-Cal income limit for adults", "medi-cal-apply"],
    ["I moved to another county, what happens to my Medi-Cal", "medi-cal-changes"],
    ["report income change Medi-Cal", "medi-cal-changes"],
    ["what does a Notice of Action mean", "medi-cal-notices"],
    ["undocumented adult enrollment freeze full-scope Medi-Cal 2026", "medi-cal-2026-changes"],
    ["Medi-Cal work requirements 2027", "medi-cal-2026-changes"],
    ["how do I get food stamps EBT", "calfresh"],
    ["CalFresh income limit household of 4", "calfresh"],
    ["WIC for my baby formula", "wic"],
    ["can I file taxes with an ITIN and get CalEITC", "caleitc-itin"],
    ["Young Child Tax Credit amount", "caleitc-itin"],
    ["FEMA help after a flood, mixed status family", "disaster-assistance"],
    ["food spoiled in power outage CalFresh replacement", "disaster-assistance"],
  ];

  for (const [query, expected, program] of cases) {
    it(`finds ${expected} for "${query}"`, async () => {
      const r = await search(query, program as never);
      expect(r.found).toBe(true);
      expect(r.results.slice(0, 2).map((h) => h.sourceId)).toContain(expected);
      expect(r.results[0].url).toMatch(/^https:\/\//);
    });
  }

  const unrelated = [
    "who will win the basketball game tonight",
    "write me a poem about cats",
    "how do I get a passport",
    "what is the best laptop to buy",
  ];
  for (const query of unrelated) {
    it(`returns found=false for "${query}"`, async () => {
      const r = await search(query);
      expect(r.found).toBe(false);
      expect(r.guidance).toMatch(/NO VERIFIED SOURCE/);
    });
  }
});
