import { beforeEach, describe, expect, it } from "vitest";
import { POST as handoffRoute } from "@/app/api/handoff/route";
import { daysUntil, formatLetterSms, type LetterAnalysis } from "@/lib/letters";
import { getStore, setStoreForTesting } from "@/lib/store";
import { createMemoryStore } from "@/lib/store/memory";

beforeEach(() => {
  (globalThis as Record<string, unknown>).__costaMemoryStore = undefined;
  setStoreForTesting(createMemoryStore());
});

describe("daysUntil", () => {
  const now = new Date("2026-09-26T18:00:00Z");
  it("counts whole days in Pacific time", () => {
    expect(daysUntil("2026-10-06", now)).toBe(10);
    expect(daysUntil("2026-09-26", now)).toBe(0);
    expect(daysUntil("2026-09-20", now)).toBe(-6);
  });
  it("ignores missing or malformed dates", () => {
    expect(daysUntil(null, now)).toBeNull();
    expect(daysUntil("October 6", now)).toBeNull();
  });
});

const analysis: LetterAnalysis = {
  ok: true,
  language: "es",
  extraction: {
    isBenefitsLetter: true,
    readable: true,
    agency: "San Mateo County Human Services Agency",
    program: "medi-cal",
    noticeType: "renewal",
    formNumber: "MC 216",
    deadline: "2026-10-15",
    deadlineMeaning: "return the renewal form",
    requestedAction: "Complete, sign, and return the renewal form with proof of income.",
    documentsRequested: ["Pay stubs for the last 30 days"],
    contactPhone: "1-800-223-8383",
    hearingRightsMentioned: false,
    keyFacts: [],
  },
  explanation: {
    whatThisMeans: "Es su formulario de renovación de Medi-Cal.",
    whatToDo: ["Llene y firme el formulario.", "Envíe sus talones de pago."],
    deadline: "15 de octubre de 2026",
    needHelp: "Llame al condado al 1-800-223-8383.",
    uncertainty: null,
  },
  daysUntilDeadline: 19,
  sources: [
    {
      sourceId: "medi-cal-renewal",
      title: "Renewing Medi-Cal",
      agency: "DHCS",
      url: "https://www.dhcs.ca.gov/faqs/",
      lastVerified: "2026-09-26",
    },
  ],
};

describe("formatLetterSms", () => {
  it("formats the explanation with labels in the user's language and a source", () => {
    const sms = formatLetterSms(analysis, "es");
    expect(sms).toContain("Qué significa: Es su formulario");
    expect(sms).toContain("1) Llene y firme");
    expect(sms).toContain("Fecha límite: 15 de octubre");
    expect(sms).toContain("Fuente: DHCS https://www.dhcs.ca.gov/faqs/");
  });
  it("asks for a clearer photo when unreadable", () => {
    expect(formatLetterSms({ ok: false, reason: "unreadable" }, "vi")).toMatch(/Costa không đọc được/);
  });
});

describe("letter handoff route", () => {
  function post(body: unknown) {
    return handoffRoute(
      new Request("http://localhost:3000/api/handoff", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      }),
    );
  }
  const letter = {
    program: "medi-cal",
    noticeType: "renewal",
    formNumber: "MC 216",
    deadline: "2026-10-15",
    requestedAction: "Return the renewal form.",
  };

  it("creates a handoff from the letter page", async () => {
    const res = await post({ consent: true, language: "es", area: "Half Moon Bay", preferredContact: "sms", contact: "650-555-0100", letter });
    const data = await res.json();
    expect(data.ok).toBe(true);
    const [h] = await getStore().listHandoffs();
    expect(h.channel).toBe("letter");
    expect(h.summary).toMatch(/MC 216/);
    expect(h.summary).toMatch(/2026-10-15/);
  });

  it("requires consent", async () => {
    const res = await post({ consent: false, language: "es", area: "Half Moon Bay", preferredContact: "sms", contact: "650-555-0100", letter });
    expect(res.status).toBe(400);
  });
});
