import { after } from "next/server";
import twilio from "twilio";
import { hasAiGateway, hasTwilio } from "@/lib/config";
import { loadOrCreateSession, phoneSessionId, runPhoneTurn } from "@/lib/conversation";
import { SMS_CONSENT, UI } from "@/lib/i18n";
import { detectLanguage } from "@/lib/languages";
import { analyzeLetter, formatLetterSms, LETTER_MEDIA_TYPES, MAX_LETTER_BYTES } from "@/lib/letters";
import { getStore } from "@/lib/store";
import { deleteTwilioMedia, fetchTwilioMedia, readTwilioWebhook, sendSms, twimlResponse } from "@/lib/twilio";

export const maxDuration = 60;

/** Twilio's Advanced Opt-Out handles these keywords; Costa stays silent. */
const OPT_KEYWORDS = /^(stop|stopall|unsubscribe|cancel|end|quit|start|unstop|yes|help|info)$/i;

const SMS_ERROR: Record<string, string> = {
  en: "Sorry, Costa had a problem. Please try again in a minute.",
  es: "Perdón, Costa tuvo un problema. Intente de nuevo en un minuto.",
};

function twiml(messages: string[]): Response {
  const r = new twilio.twiml.MessagingResponse();
  for (const m of messages) r.message(m);
  return twimlResponse(r.toString());
}

export async function POST(req: Request) {
  const hook = await readTwilioWebhook(req);
  if (!hook.ok) return new Response("Invalid signature", { status: 403 });

  const { From: from, To: to, Body: rawBody = "" } = hook.params;
  const body = rawBody.trim();
  const numMedia = Number(hook.params.NumMedia ?? "0");
  if (!from) return new Response("Missing From", { status: 400 });
  if (OPT_KEYWORDS.test(body) && numMedia === 0) return twiml([]);
  if (!hasAiGateway()) return twiml([UI.en.notConfigured]);

  const { session } = await loadOrCreateSession(phoneSessionId("sms", from), "sms");
  const media =
    numMedia > 0 && hook.params.MediaUrl0
      ? { url: hook.params.MediaUrl0, type: (hook.params.MediaContentType0 ?? "").toLowerCase() }
      : null;

  async function respond(): Promise<string[]> {
    const language = (body && detectLanguage(body)) || session.language || "en";
    const out: string[] = [];
    if (!session.consentShown) {
      out.push(SMS_CONSENT[language]);
      session.consentShown = true;
    }

    if (media && (LETTER_MEDIA_TYPES as readonly string[]).includes(media.type)) {
      try {
        const file = await fetchTwilioMedia(media.url);
        const result =
          file.data.byteLength > MAX_LETTER_BYTES
            ? ({ ok: false, reason: "unreadable" } as const)
            : await analyzeLetter({ data: file.data, mediaType: media.type, language });
        const reply = formatLetterSms(result, language);
        out.push(reply);
        const now = new Date().toISOString();
        session.language = language;
        session.turns = [
          ...session.turns,
          { role: "user" as const, content: "[Sent a photo of a benefits letter]", at: now },
          {
            role: "assistant" as const,
            content: result.ok ? `Letter summary: ${JSON.stringify(result.extraction)}\n\n${reply}` : reply,
            at: now,
          },
        ].slice(-24);
        session.updatedAt = now;
        await getStore().saveSession(session);
      } finally {
        await deleteTwilioMedia(media.url).catch(() => {});
      }
      return out;
    }

    if (!body) {
      await getStore().saveSession(session);
      return out;
    }
    const turn = await runPhoneTurn({ session, phone: from, userText: body });
    out.push(turn.text.slice(0, 1500));
    return out;
  }

  if (!hasTwilio()) {
    // Local development without Twilio credentials: reply inline so the flow can be tested with curl.
    return twiml(await respond());
  }

  // Twilio times out webhooks after 15s, so acknowledge now and reply through the REST API.
  after(async () => {
    try {
      for (const message of await respond()) await sendSms(from, message, to);
    } catch (error) {
      console.error("[sms] failed", error);
      const lang = session.language ?? "en";
      await sendSms(from, SMS_ERROR[lang] ?? SMS_ERROR.en, to).catch(() => {});
    }
  });
  return twiml([]);
}
