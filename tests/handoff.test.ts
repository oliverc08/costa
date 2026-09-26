import { beforeEach, describe, expect, it } from "vitest";
import { createHandoff, normalizePhone, type HandoffInput } from "@/lib/handoff";
import { createMemoryStore } from "@/lib/store/memory";
import { setStoreForTesting, type Store } from "@/lib/store";

let store: Store;

beforeEach(() => {
  (globalThis as Record<string, unknown>).__costaMemoryStore = undefined;
  store = createMemoryStore();
  setStoreForTesting(store);
});

const base: HandoffInput = {
  userConsented: true,
  language: "es",
  topic: "medi-cal",
  area: "Half Moon Bay",
  preferredContact: "call",
  summary: "Medi-Cal ended last month because the renewal form was not returned. Needs help sending documents.",
};

describe("normalizePhone", () => {
  it("normalizes US numbers", () => {
    expect(normalizePhone("(650) 555-0100")).toBe("+16505550100");
    expect(normalizePhone("1 650 555 0100")).toBe("+16505550100");
    expect(normalizePhone("555-0100")).toBeNull();
  });
});

describe("createHandoff", () => {
  it("creates a New handoff with a reference", async () => {
    const r = await createHandoff({ ...base, contact: "650-555-0100" }, { channel: "web", sessionId: "s1", knownContact: null });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.reference).toMatch(/^C-[A-Z0-9]{5}$/);
    const [h] = await store.listHandoffs();
    expect(h.status).toBe("new");
    expect(h.contact).toBe("+16505550100");
    expect(h.language).toBe("es");
  });

  it("uses the known SMS number when no contact is given", async () => {
    const r = await createHandoff(base, { channel: "sms", sessionId: "s2", knownContact: "+16505550199" });
    expect(r.ok).toBe(true);
    const [h] = await store.listHandoffs();
    expect(h.contact).toBe("+16505550199");
  });

  it("refuses without a way to reach the person", async () => {
    const r = await createHandoff(base, { channel: "web", sessionId: null, knownContact: null });
    expect(r.ok).toBe(false);
    expect(await store.listHandoffs()).toHaveLength(0);
  });

  it("refuses without explicit consent", async () => {
    const r = await createHandoff(
      { ...base, userConsented: false as unknown as true, contact: "6505550100" },
      { channel: "web", sessionId: null, knownContact: null },
    );
    expect(r.ok).toBe(false);
  });

  it("requires a valid email for email contact", async () => {
    const r = await createHandoff(
      { ...base, preferredContact: "email", contact: "not-an-email" },
      { channel: "web", sessionId: null, knownContact: null },
    );
    expect(r.ok).toBe(false);
  });

  it("redacts SSNs from the summary", async () => {
    await createHandoff(
      { ...base, contact: "6505550100", summary: "Needs help with renewal. SSN 123-45-6789 was mentioned by mistake." },
      { channel: "web", sessionId: null, knownContact: null },
    );
    const [h] = await store.listHandoffs();
    expect(h.summary).not.toMatch(/123-45-6789/);
    expect(h.summary).toMatch(/\[REDACTED\]/);
  });
});
