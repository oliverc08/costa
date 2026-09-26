import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/chat/route";
import { FAQS, faqQuestions, faqSources, matchFaq } from "@/lib/faq";
import { getKnowledgeBase } from "@/lib/knowledge";
import { detectLanguage, LANGUAGE_CODES } from "@/lib/languages";
import { auditReply } from "@/lib/safety/output";

const cases = FAQS.flatMap((faq) => LANGUAGE_CODES.map((lang) => [faq.id, lang, faq] as const));

describe("FAQ answers", () => {
  it.each(cases)("%s (%s) passes the output safety audit", (_id, lang, faq) => {
    expect(auditReply(faq.answer[lang])).toEqual([]);
  });

  it.each(cases)("%s (%s) is written in that language", (_id, lang, faq) => {
    expect(detectLanguage(faq.answer[lang]) ?? lang).toBe(lang);
    expect(detectLanguage(faq.question[lang]) ?? lang).toBe(lang);
  });

  it("cites only known sources", () => {
    for (const faq of FAQS) expect(() => faqSources(faq)).not.toThrow();
  });

  it("only uses phone numbers that appear in its own cited sources", () => {
    const kb = getKnowledgeBase();
    for (const faq of FAQS) {
      const sourceText = kb.chunks
        .filter((c) => faq.sourceIds.includes(c.sourceId))
        .map((c) => c.text)
        .concat(faq.sourceIds.map((id) => kb.sources.find((s) => s.id === id)!.nextAction))
        .join("\n")
        .replace(/\D/g, " ");
      for (const lang of LANGUAGE_CODES) {
        for (const m of faq.answer[lang].matchAll(/\(?\d{3}\)?[\s.-]\d{3}-\d{4}/g)) {
          const d = m[0].replace(/\D/g, "");
          expect(sourceText.replace(/\s/g, ""), `${faq.id}/${lang}: ${m[0]}`).toContain(d);
        }
      }
    }
  });

  it("has unique questions across all languages", () => {
    const all = FAQS.flatMap((f) => LANGUAGE_CODES.map((l) => f.question[l]));
    expect(new Set(all).size).toBe(all.length);
  });

  it("matches questions ignoring case, spacing, and punctuation", () => {
    expect(matchFaq("how do i renew my medi-cal")?.faq.id).toBe("renew-medi-cal");
    expect(matchFaq("  ¿Cómo renuevo mi Medi-Cal?  ")?.language).toBe("es");
    expect(matchFaq("我的 Medi-Cal 被停了，怎么办")?.faq.id).toBe("medi-cal-ended");
    expect(matchFaq("How do I renew my Medi-Cal if I moved to Fresno?")).toBeNull();
    expect(faqQuestions("vi")).toHaveLength(FAQS.length);
  });
});

describe("chat route FAQ shortcut", () => {
  it("answers a common question without the model and attaches sources", async () => {
    const res = await POST(
      new Request("http://localhost/api/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: [{ id: "1", role: "user", parts: [{ type: "text", text: "Me cortaron el Medi-Cal. ¿Qué hago?" }] }],
        }),
      }),
    );
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toContain("90 días");
    expect(body).toContain('"toolName":"searchBenefits"');
    expect(body).toContain("medi-cal-lost-coverage");
  });
});
