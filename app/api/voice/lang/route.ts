import { voice, VOICE } from "@/lib/i18n";
import { readTwilioWebhook, twimlResponse } from "@/lib/twilio";
import { DIGIT_LANGUAGES, gatherSpeech, redirect, response, say } from "@/lib/voice";

/** Caller pressed a digit to pick a language; from here on Twilio transcribes in that language. */
export async function POST(req: Request) {
  const hook = await readTwilioWebhook(req);
  if (!hook.ok) return new Response("Invalid signature", { status: 403 });

  const lang = DIGIT_LANGUAGES[hook.params.Digits ?? ""];
  if (!lang) return twimlResponse(response(redirect("/api/voice")));

  const v = voice(lang);
  return twimlResponse(
    response(gatherSpeech(lang, v.howCanIHelp), say(lang, v.didntHear), gatherSpeech(lang, v.howCanIHelp), say(lang, v.goodbye), "<Hangup/>"),
  );
}
