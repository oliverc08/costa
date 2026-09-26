import twilio from "twilio";
import { hasTwilio, publicBaseUrl } from "@/lib/config";

export function twilioClient() {
  if (!hasTwilio()) throw new Error("Twilio credentials are not configured");
  return twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!);
}

/** Parses a Twilio webhook form body and verifies its signature when credentials are set. */
export async function readTwilioWebhook(
  req: Request,
): Promise<{ ok: true; params: Record<string, string> } | { ok: false }> {
  const form = await req.formData();
  const params: Record<string, string> = {};
  for (const [k, v] of form.entries()) params[k] = String(v);

  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!token) {
    if (process.env.NODE_ENV === "production") return { ok: false };
    return { ok: true, params };
  }
  const url = new URL(req.url);
  const fullUrl = `${publicBaseUrl(req)}${url.pathname}${url.search}`;
  const signature = req.headers.get("x-twilio-signature") ?? "";
  const valid = twilio.validateRequest(token, signature, fullUrl, params);
  return valid ? { ok: true, params } : { ok: false };
}

/** Downloads Twilio-hosted media (MMS images, call recordings) with account auth. */
export async function fetchTwilioMedia(url: string): Promise<{ data: Uint8Array; mediaType: string }> {
  const headers: Record<string, string> = {};
  if (hasTwilio()) {
    const auth = Buffer.from(
      `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`,
    ).toString("base64");
    headers.Authorization = `Basic ${auth}`;
  }
  let lastStatus = 0;
  for (let attempt = 0; attempt < 4; attempt++) {
    const res = await fetch(url, { headers, redirect: "follow" });
    if (res.ok) {
      return {
        data: new Uint8Array(await res.arrayBuffer()),
        mediaType: res.headers.get("content-type") ?? "application/octet-stream",
      };
    }
    lastStatus = res.status;
    // Recordings can take a moment to become available after the call leg ends.
    await new Promise((r) => setTimeout(r, 400 * (attempt + 1)));
  }
  throw new Error(`Failed to fetch Twilio media (${lastStatus})`);
}

export async function sendSms(to: string, body: string, from?: string) {
  const client = twilioClient();
  await client.messages.create({
    to,
    from: from ?? process.env.TWILIO_PHONE_NUMBER!,
    body,
  });
}

export function twimlResponse(xml: string): Response {
  return new Response(xml, { headers: { "Content-Type": "text/xml; charset=utf-8" } });
}
