import { describe, expect, it } from "vitest";
import { GET as purge } from "@/app/api/cron/purge/route";
import { wantsHuman } from "@/lib/safety/intent";
import { auditReply, verifiedPhones } from "@/lib/safety/output";
import { redact } from "@/lib/safety/redact";

describe("redact", () => {
  it.each([
    ["My SSN is 123-45-6789", "ssn-or-itin"],
    ["ssn 123 45 6789 thanks", "ssn-or-itin"],
    ["mi seguro social es 123456789", "ssn-or-itin"],
    ["ITIN 912-78-1234", "ssn-or-itin"],
    ["BIC 12345678A12345", "medi-cal-id"],
    ["CIN 91234567A", "medi-cal-id"],
    ["card 4111 1111 1111 1111", "card-number"],
  ])("removes %s", (input, kind) => {
    const r = redact(input);
    expect(r.redacted).toBe(true);
    expect(r.kinds).toContain(kind);
    expect(r.text).toContain("[REDACTED]");
  });

  it.each([
    "Call 1-800-223-8383",
    "(650) 560-8947",
    "6505608947",
    "Income is $2,610 a month for 3 people",
    "My ZIP is 94019",
    "Due 10/15/2026",
    "Form MC 216 and MC 355",
    "Reference C-DQR3Y",
    "Mixed separators 123-45 6789",
  ])("keeps %s", (input) => {
    const r = redact(input);
    expect(r.redacted).toBe(false);
    expect(r.text).toBe(input);
  });
});

describe("wantsHuman", () => {
  it.each([
    "Can I talk to a real person?",
    "I want to speak with a caseworker",
    "Quiero hablar con una persona",
    "¿Puedo hablar con alguien?",
    "我想找人工服务",
    "Gusto kong makausap ang isang tao",
    "Tôi muốn nói chuyện với nhân viên",
  ])("detects %s", (text) => {
    expect(wantsHuman(text)).toBe(true);
  });

  it.each([
    "How do I renew my Medi-Cal?",
    "¿Cuánto es el límite de ingresos?",
    "My person-to-person transfer",
    "我的医保被停了",
  ])("ignores %s", (text) => {
    expect(wantsHuman(text)).toBe(false);
  });
});

describe("auditReply", () => {
  it("allows hedged eligibility language in every language", () => {
    for (const t of [
      "You may qualify for Medi-Cal based on what you shared.",
      "Usted podría calificar para Medi-Cal.",
      "根据您提供的信息，您可能符合资格。",
      "Baka kwalipikado ka sa Medi-Cal.",
      "Bạn có thể đủ điều kiện nhận Medi-Cal.",
    ]) {
      expect(auditReply(t).filter((i) => i.kind === "eligibility-claim")).toEqual([]);
    }
  });

  it("flags definitive eligibility claims", () => {
    for (const t of [
      "Good news: you qualify for Medi-Cal!",
      "Usted califica para CalFresh.",
      "您符合资格。",
      "Kwalipikado ka sa CalFresh.",
      "Bạn đủ điều kiện nhận CalFresh.",
    ]) {
      expect(auditReply(t).map((i) => i.kind)).toContain("eligibility-claim");
    }
  });

  it("flags questions about immigration status or ID numbers", () => {
    expect(auditReply("What is your immigration status?").map((i) => i.kind)).toContain("asks-immigration-status");
    expect(auditReply("¿Tiene papeles?").map((i) => i.kind)).toContain("asks-immigration-status");
    expect(auditReply("Please send me your Social Security number.").map((i) => i.kind)).toContain("asks-for-id-number");
    expect(auditReply("¿Cuál es su número de seguro social?").map((i) => i.kind)).toContain("asks-for-id-number");
  });

  it("allows verified phone numbers and flags invented ones", () => {
    expect(verifiedPhones().has("8002238383")).toBe(true);
    expect(auditReply("Call San Mateo County at 1-800-223-8383.")).toEqual([]);
    expect(auditReply("Covered California en español: 1-800-300-0213.")).toEqual([]);
    expect(auditReply("Call 1-800-555-1234 for help.").map((i) => i.kind)).toEqual(["unverified-phone"]);
  });

  it("flags personal numbers echoed back", () => {
    expect(auditReply("I saw your SSN 123-45-6789.").map((i) => i.kind)).toContain("contains-pii");
  });
});

describe("purge cron", () => {
  it("requires the cron secret", async () => {
    process.env.CRON_SECRET = "s3cret";
    expect((await purge(new Request("http://localhost/api/cron/purge"))).status).toBe(401);
    const ok = await purge(new Request("http://localhost/api/cron/purge", { headers: { authorization: "Bearer s3cret" } }));
    expect(ok.status).toBe(200);
    expect((await ok.json()).retentionDays).toBe(30);
  });
});
