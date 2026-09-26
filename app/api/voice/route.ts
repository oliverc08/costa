import { hasAiGateway } from "@/lib/config";
import { UI } from "@/lib/i18n";
import { readTwilioWebhook, twimlResponse } from "@/lib/twilio";
import { GREETING, response, say } from "@/lib/voice";

/** Incoming call: multilingual greeting, keypad language choice, or just start talking. */
export async function POST(req: Request) {
  const hook = await readTwilioWebhook(req);
  if (!hook.ok) return new Response("Invalid signature", { status: 403 });
  if (!hasAiGateway()) return twimlResponse(response(say("en", UI.en.notConfigured), "<Hangup/>"));

  const gather =
    `<Gather input="dtmf" numDigits="1" timeout="2" action="/api/voice/lang" method="POST">` +
    say("en", GREETING.en) +
    say("es", GREETING.es) +
    say("zh", GREETING.zh) +
    say("tl", GREETING.tl) +
    say("vi", GREETING.vi) +
    `</Gather>`;
  const record = `<Record action="/api/voice/turn" method="POST" maxLength="30" timeout="3" playBeep="true" trim="trim-silence"/>`;

  return twimlResponse(response(gather, record));
}
