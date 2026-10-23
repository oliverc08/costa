import { describe, expect, it } from "vitest";
import { redactLetterOcrText as redactOnClient } from "@/components/LetterUpload";
import { redactLetterOcrText as redactOnServer } from "@/app/api/letter-text/route";

describe("letter OCR privacy boundary", () => {
  const sensitiveLetter = `
    Name: Riley Example
    Mailing Address: 123 Main Street, San Jose, CA 95112
    Date of Birth: 04/05/1990
    Case Number: 1234567890
    Social Security Number: 123-45-6789
    Email: riley@example.org
    Medi-Cal Renewal Form MC 216
    Please return by 03/15/2027.
    Call (650) 555-0199 if you have questions.
  `;

  it("removes common private fields and keeps useful letter facts", () => {
    const result = redactOnServer(sensitiveLetter);

    expect(result).not.toContain("Riley Example");
    expect(result).not.toContain("123 Main Street");
    expect(result).not.toContain("04/05/1990");
    expect(result).not.toContain("1234567890");
    expect(result).not.toContain("123-45-6789");
    expect(result).not.toContain("riley@example.org");
    expect(result).toContain("Medi-Cal Renewal Form MC 216");
    expect(result).toContain("03/15/2027");
    expect(result).toContain("(650) 555-0199");
    expect(redactOnClient(sensitiveLetter)).toBe(result);
  });

  it("redacts again when callers bypass the browser sanitizer", async () => {
    const response = await (await import("@/app/api/letter-text/route")).POST(
      new Request("http://localhost:3000/api/letter-text", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ text: sensitiveLetter, language: "en" }),
      }),
    );

    expect(response.status).toBe(200);
    const result = await response.json();
    expect(JSON.stringify(result)).not.toContain("Riley Example");
    expect(JSON.stringify(result)).not.toContain("1234567890");
    expect(JSON.stringify(result)).not.toContain("123-45-6789");
  });
});
