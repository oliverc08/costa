import { afterEach, describe, expect, it } from "vitest";
import { POST } from "@/app/api/sms/route";

function sms(params: Record<string, string>): Request {
  return new Request("http://localhost:3000/api/sms", {
    method: "POST",
    body: new URLSearchParams(params),
    headers: { "content-type": "application/x-www-form-urlencoded" },
  });
}

afterEach(() => {
  delete process.env.COSTA_LOCAL_LLM_URL;
});

describe("SMS webhook", () => {
  it("stays silent for opt-out keywords so Twilio's own STOP handling applies", async () => {
    const xml = await (await POST(sms({ From: "+16505550100", Body: "STOP", NumMedia: "0" }))).text();
    expect(xml).not.toContain("<Message>");
  });

  it("replies with the local agent when no cloud LLM is configured", async () => {
    const xml = await (await POST(sms({ From: "+16505550199", Body: "hola", NumMedia: "0" }))).text();
    expect(xml).toContain("<Message>");
    // Local/dev without Twilio replies inline; should not be the old gateway error.
    expect(xml).not.toMatch(/isn't set up|not configured/i);
  });

  it("rejects requests without a sender", async () => {
    const res = await POST(sms({ Body: "hi" }));
    expect(res.status).toBe(400);
  });
});
