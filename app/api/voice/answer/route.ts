import { VOICE } from "@/lib/i18n";
import { isLanguageCode } from "@/lib/languages";
import { getStore } from "@/lib/store";
import { readTwilioWebhook, twimlResponse } from "@/lib/twilio";
import { answerAndListen, pause, redirect, response, say } from "@/lib/voice";

export const maxDuration = 30;

const POLL_MS = 350;
const WAIT_MS = 9_000;
const MAX_ROUNDS = 4;

/** Waits for the background turn to finish, then speaks the reply. */
export async function POST(req: Request) {
  const hook = await readTwilioWebhook(req);
  if (!hook.ok) return new Response("Invalid signature", { status: 403 });

  const url = new URL(req.url);
  const key = url.searchParams.get("key") ?? "";
  const n = Number(url.searchParams.get("n") ?? "0");
  const langParam = url.searchParams.get("lang");
  const lang = isLanguageCode(langParam) ? langParam : null;

  const store = getStore();
  const deadline = Date.now() + WAIT_MS;
  while (Date.now() < deadline) {
    const reply = await store.takePendingReply(key);
    if (reply) return twimlResponse(answerAndListen(reply.language, reply.text, reply.endCall));
    await new Promise((r) => setTimeout(r, POLL_MS));
  }

  const l = lang ?? "en";
  if (n + 1 >= MAX_ROUNDS) {
    return twimlResponse(response(say(l, VOICE[l].goodbye), "<Hangup/>"));
  }
  const next = `/api/voice/answer?key=${encodeURIComponent(key)}&n=${n + 1}${lang ? `&lang=${lang}` : ""}`;
  return twimlResponse(response(lang ? say(lang, VOICE[lang].oneMoment) : pause(1), redirect(next)));
}
