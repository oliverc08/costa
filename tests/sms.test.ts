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
  delete process.env.AI_GATEWAY_API_KEY;
});

describe("SMS webhook", () => {
  it("stays silent for opt-out keywords so Twilio's own STOP handling applies", async () => {
    process.env.AI_GATEWAY_API_KEY = "test";
    const xml = await (await POST(sms({ From: "+16505550100", Body: "STOP", NumMedia: "0" }))).text();
    expect(xml).not.toContain("<Message>");
  });

  it("explains when the AI is not configured", async () => {
    const xml = await (await POST(sms({ From: "+16505550100", Body: "hola", NumMedia: "0" }))).text();
    expect(xml).toContain("<Message>");
    expect(xml).toMatch(/isn't set up|not configured/i);
  });

  it("rejects requests without a sender", async () => {
    const res = await POST(sms({ Body: "hi" }));
    expect(res.status).toBe(400);
  });
});
