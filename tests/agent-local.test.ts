import { describe, expect, it } from "vitest";
import { POST } from "@/app/api/chat/route";
import { runLocalAgent } from "@/lib/agent/local";
import { matchFaq } from "@/lib/faq";
import { detectLanguage } from "@/lib/languages";
import { auditReply } from "@/lib/safety/output";
import { redact } from "@/lib/safety/redact";

describe("deterministic local agent escalation", () => {
  it("honors a request for a person before returning a matching FAQ", async () => {
    const result = await runLocalAgent({
      text: "How do I renew my Medi-Cal? I want to talk to a real person.",
      language: "en",
      wantsHumanHint: true,
    });

    expect(result.kind).toBe("help");
    expect(result.tools.map((tool) => tool.toolName)).toContain("findLocalHelp");
    expect(result.tools.map((tool) => tool.toolName)).not.toContain("searchBenefits");
  });

  it.each([
    ["Medi-Cal 拒绝了我的申请，我觉得这是错的。", "zh", "90 天"],
    ["Medi-Cal đã từ chối đơn của tôi và tôi nghĩ như vậy là sai.", "vi", "90 ngày"],
  ] as const)("offers appeal help in %s", async (text, language, deadline) => {
    const result = await runLocalAgent({ text, language });

    expect(result.kind).toBe("help");
    expect(result.text).toContain(deadline);
    expect(result.tools.map((tool) => tool.toolName)).toEqual(expect.arrayContaining(["searchBenefits", "findLocalHelp"]));
    expect(auditReply(result.text)).toEqual([]);
  });

  it("routes CalFresh disputes to general CalFresh help without the Medi-Cal hearing FAQ", async () => {
    const result = await runLocalAgent({
      text: "CalFresh denied my application and I think the decision is wrong.",
      language: "en",
    });

    expect(result.kind).toBe("help");
    expect(result.tools.map((tool) => tool.toolName)).toEqual(["findLocalHelp"]);
    expect(result.text).toContain("CalFresh Information Line");
    expect(result.text).toContain("1-877-847-3663");
    expect(result.text).not.toMatch(/Medi-Cal|State Hearing|90 days/i);
    expect(auditReply(result.text)).toEqual([]);
  });

  it.each([
    ["半月湾有没有地方可以当面帮我办理 Medi-Cal？", "zh"],
    ["Ở Half Moon Bay có nơi nào giúp tôi trực tiếp về Medi-Cal không?", "vi"],
    ["May lugar ba sa Half Moon Bay na makakatulong sa akin nang personal sa Medi-Cal?", "tl"],
  ] as const)("uses the local directory for in-person requests in %s", async (text, language) => {
    const result = await runLocalAgent({ text, language });
    const helpTool = result.tools.find((tool) => tool.toolName === "findLocalHelp");
    const output = helpTool?.output as { county?: string; results?: { name: string; phone: string | null }[] } | undefined;

    expect(result.kind).toBe("help");
    expect(helpTool).toBeDefined();
    expect(output?.county).toBe("san-mateo");
    expect(output?.results?.some((provider) => provider.name === "San Mateo County Human Services Agency")).toBe(true);
    expect(output?.results?.some((provider) => provider.name === "Ayudando Latinos A Soñar (ALAS)")).toBe(true);
    expect(result.text).toContain("1-800-223-8383");
    expect(result.text).toContain("ALAS");
    expect(auditReply(result.text)).toEqual([]);
  });
});

describe("localized WIC FAQ routing", () => {
  it.each([
    ["我可以为我2岁的孩子申请 WIC 吗？", "wic-toddler"],
    ["WIC 会问移民身份吗？", "wic-immigration-status"],
  ] as const)("answers the Chinese FAQ %s from WIC source", async (text, faqId) => {
    const result = await runLocalAgent({ text, language: "zh" });
    const search = result.tools.find((tool) => tool.toolName === "searchBenefits");
    const output = search?.output as { results?: { sourceId: string }[] } | undefined;

    expect(result.kind).toBe("faq");
    expect(output?.results?.map((source) => source.sourceId)).toContain("wic");
    expect(detectLanguage(result.text)).toBe("zh");
    expect(result.text).toMatch(faqId === "wic-toddler" ? /5岁以下|5 岁以下/ : /移民身份/);
    expect(auditReply(result.text)).toEqual([]);
  });

  it("answers WIC immigration questions in Tagalog", async () => {
    const result = await runLocalAgent({
      text: "Nagtatanong ba ang WIC tungkol sa immigration status?",
      language: "tl",
    });

    expect(result.kind).toBe("faq");
    expect(result.text).toContain("Ang WIC ay hindi nangangailangan");
    expect(detectLanguage(result.text)).toBe("tl");
    expect(auditReply(result.text)).toEqual([]);
  });
});

describe("localized Chinese food and disaster FAQ routing", () => {
  it.each([
    ["三口之家最多可以领多少 CalFresh？", /808 美元|808/],
    ["我们的房子被水淹了。如果我丈夫没有合法身份，我们还能获得 FEMA 的帮助吗？", /如果总统宣布|家庭成员的移民身份不同/],
    ["停电了，我们的食物全坏了。我们有 CalFresh。能得到帮助吗？", /申请补发福利|10 天内/],
  ])("answers %s in Chinese from a localized FAQ", async (text, answerPattern) => {
    const result = await runLocalAgent({ text, language: "zh" });

    expect(result.kind).toBe("faq");
    expect(detectLanguage(result.text)).toBe("zh");
    expect(result.text).toMatch(answerPattern);
    expect(auditReply(result.text)).toEqual([]);
  });
});

describe("private-number case lookup", () => {
  const prompt = "我的社会安全号码是 123-45-6789。你能帮我查一下我的 Medi-Cal 案件吗？";

  it("does not let the FAQ shortcut consume a message containing a sensitive number", () => {
    expect(matchFaq(prompt, { preferredLang: "zh" })).toBeNull();
  });

  it("explains redaction and gives localized case-check steps", async () => {
    const cleaned = redact(prompt);
    const result = await runLocalAgent({
      text: cleaned.text,
      language: "zh",
      redactedThisTurn: cleaned.redacted,
    });

    expect(cleaned.redacted).toBe(true);
    expect(result.text).toContain("已被删除");
    expect(result.text).toContain("BenefitsCal.com");
    expect(result.text).toContain("1-877-962-3633");
    expect(result.text).not.toContain("123-45-6789");
    expect(auditReply(result.text)).toEqual([]);
  });

  it("keeps the web chat FAQ shortcut on the privacy-safe local path", async () => {
    const previousUrl = process.env.COSTA_LOCAL_LLM_URL;
    delete process.env.COSTA_LOCAL_LLM_URL;
    try {
      const response = await POST(
        new Request("http://localhost/api/chat", {
          method: "POST",
          body: JSON.stringify({
            language: "zh",
            messages: [{ id: "1", role: "user", parts: [{ type: "text", text: prompt }] }],
          }),
        }),
      );
      const body = await response.text();

      expect(response.status).toBe(200);
      expect(body).toContain("已被删除");
      expect(body).toContain("BenefitsCal.com");
      expect(body).not.toContain("123-45-6789");
    } finally {
      if (previousUrl === undefined) delete process.env.COSTA_LOCAL_LLM_URL;
      else process.env.COSTA_LOCAL_LLM_URL = previousUrl;
    }
  });
});
