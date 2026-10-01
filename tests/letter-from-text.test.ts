import { describe, expect, it } from "vitest";
import { extractDeadlineIso, extractFormNumber, extractLetterFromText, extractPhone } from "@/lib/letter-from-text";

describe("letter-from-text heuristics", () => {
  it("extracts Medi-Cal renewal facts", () => {
    const text = `
      County of San Mateo Human Services Agency
      Medi-Cal Renewal Form MC 216
      Please return by 03/15/2026
      Call (650) 555-0199 if you have questions.
      Notice of Action — complete your renewal to keep Medi-Cal.
    `;
    const result = extractLetterFromText(text, new Date("2026-03-01T12:00:00Z"));
    expect(result).toMatchObject({
      isBenefitsLetter: true,
      program: "medi-cal",
      noticeType: "renewal",
      formNumber: "MC 216",
      deadline: "2026-03-15",
      contactPhone: "(650) 555-0199",
    });
  });

  it("rejects non-letter text", () => {
    expect(extractLetterFromText("hello world this is a grocery list milk eggs bread")).toEqual({
      ok: false,
      reason: "not-a-letter",
    });
  });

  it("parses phones and form numbers", () => {
    expect(extractPhone("Call 1-800-223-8383 today")).toMatch(/800/);
    expect(extractFormNumber("Form CF 377 and more")).toMatch(/CF/i);
  });

  it("parses ISO and US dates", () => {
    expect(extractDeadlineIso("Due 2026-04-01", new Date("2026-03-01"))).toBe("2026-04-01");
    expect(extractDeadlineIso("Return by 4/1/2026", new Date("2026-03-01"))).toBe("2026-04-01");
  });
});
