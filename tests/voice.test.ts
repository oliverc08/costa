import { beforeAll, beforeEach, describe, expect, it } from "vitest";
import { POST as incoming } from "@/app/api/voice/route";
import { POST as chooseLanguage } from "@/app/api/voice/lang/route";
import { POST as answer } from "@/app/api/voice/answer/route";
import { setStoreForTesting } from "@/lib/store";
import { createMemoryStore } from "@/lib/store/memory";
import { answerAndListen, toSpeech } from "@/lib/voice";

function twilioPost(path: string, params: Record<string, string>): Request {
  return new Request(`http://localhost:3000${path}`, {
    method: "POST",
    body: new URLSearchParams(params),
    headers: { "content-type": "application/x-www-form-urlencoded" },
  });
}

beforeAll(() => {
  delete process.env.COSTA_LOCAL_LLM_URL;
  delete process.env.TWILIO_AUTH_TOKEN;
});

beforeEach(() => {
  (globalThis as Record<string, unknown>).__costaMemoryStore = undefined;
  setStoreForTesting(createMemoryStore());
});

describe("toSpeech", () => {
  it("removes URLs and markdown", () => {
    expect(toSpeech("**Apply** at https://benefitscal.com today.\n- Call 1-800-223-8383")).toBe(
      "Apply at today. Call 1-800-223-8383",
    );
  });
});

describe("TwiML", () => {
  it("escapes text and uses the language's voice", () => {
    const xml = answerAndListen("es", "Medi-Cal & CalFresh <info>");
    expect(xml).toContain("Medi-Cal &amp; CalFresh &lt;info&gt;");
    expect(xml).toContain('voice="Google.es-US-Neural2-A"');
    expect(xml).toContain('language="es-US"');
    expect(xml).toContain("/api/voice/turn?lang=es");
  });
});

describe("voice routes", () => {
  it("greets in five languages and records if no key is pressed", async () => {
    const xml = await (await incoming(twilioPost("/api/voice", { From: "+16505550100", CallSid: "CA1" }))).text();
    expect(xml).toContain('action="/api/voice/lang"');
    expect(xml).toContain("中文请按3");
    expect(xml).toContain("Tiếng Việt");
    expect(xml).toContain("<Record");
  });

  it("switches to Vietnamese speech recognition after pressing 5", async () => {
    const xml = await (await chooseLanguage(twilioPost("/api/voice/lang", { Digits: "5" }))).text();
    expect(xml).toContain('language="vi-VN"');
    expect(xml).toContain("/api/voice/turn?lang=vi");
  });

  it("speaks a finished background reply", async () => {
    const { getStore } = await import("@/lib/store");
    await getStore().putPendingReply("CA1:abc", { text: "Puede solicitar Medi-Cal.", language: "es" });
    const xml = await (await answer(twilioPost("/api/voice/answer?key=CA1:abc&n=0", {}))).text();
    expect(xml).toContain("Puede solicitar Medi-Cal.");
    expect(xml).toContain("<Gather");
  });
});
