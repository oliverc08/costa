import { describe, expect, it } from "vitest";
import { allScenarios, INTENTS } from "@/evals/scenarios";
import { getKnowledgeBase } from "@/lib/knowledge";

describe("eval scenarios", () => {
  it("has intents for each translated UI language (ko/pt prompts optional until added)", () => {
    expect(INTENTS).toHaveLength(30);
    const scenarios = allScenarios();
    expect(scenarios.length).toBeGreaterThanOrEqual(150);
    for (const i of INTENTS) {
      for (const lang of ["en", "es", "zh", "tl", "vi"] as const) {
        expect(i.prompts[lang], `${i.id}.${lang}`).toBeTruthy();
      }
    }
  });

  it("uses unique intent ids", () => {
    expect(new Set(INTENTS.map((i) => i.id)).size).toBe(INTENTS.length);
  });

  it("only references sources that exist", () => {
    const ids = new Set(getKnowledgeBase().sources.map((s) => s.id));
    for (const i of INTENTS) for (const s of i.sources ?? []) expect(ids, `${i.id} → ${s}`).toContain(s);
  });
});
