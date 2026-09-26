import { describe, expect, it } from "vitest";
import { allScenarios, INTENTS } from "@/evals/scenarios";
import { getKnowledgeBase } from "@/lib/knowledge";
import { LANGUAGE_CODES } from "@/lib/languages";

describe("eval scenarios", () => {
  it("has 150 scenarios: 30 intents in 5 languages", () => {
    expect(INTENTS).toHaveLength(30);
    expect(allScenarios()).toHaveLength(150);
    for (const i of INTENTS) expect(Object.keys(i.prompts).sort()).toEqual([...LANGUAGE_CODES].sort());
  });

  it("uses unique intent ids", () => {
    expect(new Set(INTENTS.map((i) => i.id)).size).toBe(INTENTS.length);
  });

  it("only references sources that exist", () => {
    const ids = new Set(getKnowledgeBase().sources.map((s) => s.id));
    for (const i of INTENTS) for (const s of i.sources ?? []) expect(ids, `${i.id} → ${s}`).toContain(s);
  });
});
