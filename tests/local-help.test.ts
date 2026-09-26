import { describe, expect, it } from "vitest";
import { findLocalHelp, normalizeArea } from "@/lib/local-help";

describe("normalizeArea", () => {
  it.each([
    ["Half Moon Bay", "san-mateo"],
    ["pescadero", "san-mateo"],
    ["94019", "san-mateo"],
    ["San José", "santa-clara"],
    ["Santa Clara County", "santa-clara"],
    ["Palo Alto", "santa-clara"],
    ["94301", "santa-clara"],
    ["95128", "santa-clara"],
    ["Fresno", null],
    ["unknown", null],
  ])("%s → %s", (area, county) => {
    expect(normalizeArea(area)).toBe(county);
  });
});

describe("findLocalHelp", () => {
  it("returns the county office first for Medi-Cal applications in Half Moon Bay", () => {
    const r = findLocalHelp({ area: "Half Moon Bay", program: "medi-cal", language: "es", need: "apply" });
    expect(r.county).toBe("san-mateo");
    expect(r.results[0].name).toMatch(/San Mateo County/);
    expect(r.results.some((x) => /Santa Clara/.test(x.name))).toBe(false);
  });

  it("routes appeals to legal help or State Hearings", () => {
    const r = findLocalHelp({ area: "San Jose", program: "medi-cal", language: "vi", need: "appeal" });
    const ids = r.results.map((x) => x.id);
    expect(ids).toContain("hca");
    expect(ids).toContain("state-hearings");
  });

  it("uses a language-specific phone line when one exists", () => {
    const r = findLocalHelp({ area: "unknown", program: "medi-cal", language: "zh", need: "apply" });
    const cc = r.results.find((x) => x.id === "covered-ca");
    expect(cc?.phone).toBe("1-800-300-1533");
  });

  it("falls back to statewide help outside the district", () => {
    const r = findLocalHelp({ area: "Fresno", program: "wic", language: "en", need: "apply" });
    expect(r.county).toBeNull();
    expect(r.results[0].id).toBe("wic");
    expect(r.note).toMatch(/statewide/);
  });

  it("returns VITA for tax help", () => {
    const r = findLocalHelp({ area: "Gilroy", program: "caleitc", language: "es", need: "tax-help" });
    expect(r.results[0].id).toBe("vita");
  });

  it("applies defaults when optional inputs are missing", () => {
    const r = findLocalHelp({});
    expect(r.results.length).toBeGreaterThan(0);
  });
});
