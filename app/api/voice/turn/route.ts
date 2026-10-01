import { gateway, transcribe } from "ai";
import { after } from "next/server";
import { models } from "@/lib/config";
import { loadOrCreateSession, phoneSessionId, runPhoneTurn } from "@/lib/conversation";
import { voice, VOICE } from "@/lib/i18n";
import { detectLanguage, isLanguageCode, normalizeLanguage, type LanguageCode } from "@/lib/languages";
import { getStore } from "@/lib/store";
import { deleteTwilioMedia, fetchTwilioMedia, readTwilioWebhook, twimlResponse } from "@/lib/twilio";
import { pause, redirect, response, say, toSpeech } from "@/lib/voice";

export const maxDuration = 60;

const APOLOGY: Record<LanguageCode, string> = {
  en: "Sorry, I had a problem. Please call again, or text this number.",
  es: "Perdón, tuve un problema. Por favor llame otra vez o mande un mensaje de texto a este número.",
  zh: "抱歉，出现了问题。请再打一次，或给这个号码发短信。",
  tl: "Pasensya, nagkaproblema ako. Tumawag ulit, o mag-text sa numerong ito.",
  vi: "Xin lỗi, đã có sự cố. Vui lòng gọi lại hoặc nhắn tin đến số này.",
  ko: "죄송합니다. 문제가 생겼습니다. 다시 전화하시거나 이 번호로 문자 주세요.",
  pt: "Desculpe, tive um problema. Ligue de novo ou envie uma mensagem de texto para este número.",
};

async function transcribeRecording(url: string): Promise<{ text: string; language: LanguageCode | null }> {
  try {
    const audio = await fetchTwilioMedia(url);
    const result = await transcribe({ model: gateway.transcriptionModel(models.transcription), audio: audio.data });
    return { text: result.text.trim(), language: normalizeLanguage(result.language) };
  } finally {
    await deleteTwilioMedia(url).catch(() => {});
  }
}

/**
 * One caller utterance. Work runs in the background because transcription plus
 * tool calls can exceed Twilio's 15-second webhook timeout; /api/voice/answer
 * picks up the reply.
 */
export async function POST(req: Request) {
  const hook = await readTwilioWebhook(req);
  if (!hook.ok) return new Response("Invalid signature", { status: 403 });

  const url = new URL(req.url);
  const langParam = url.searchParams.get("lang");
  const knownLang = isLanguageCode(langParam) ? langParam : null;
  const { From: from = "unknown", CallSid: callSid = crypto.randomUUID() } = hook.params;
  const speech = hook.params.SpeechResult?.trim() ?? "";
  const recordingUrl = hook.params.RecordingUrl;
  const key = `${callSid}:${crypto.randomUUID().slice(0, 8)}`;

  if (!speech && !recordingUrl) {
    const lang = knownLang ?? "en";
    return twimlResponse(response(say(lang, voice(lang).goodbye), "<Hangup/>"));
  }

  after(async () => {
    const store = getStore();
    let language: LanguageCode = knownLang ?? "en";
    try {
      let text = speech;
      if (!text && recordingUrl) {
        const t = await transcribeRecording(recordingUrl);
        text = t.text;
        language = knownLang ?? t.language ?? detectLanguage(text) ?? "en";
      }
      if (!text) {
        await store.putPendingReply(key, { text: voice(language).didntHear, language });
        return;
      }
      const { session } = await loadOrCreateSession(phoneSessionId("voice", from), "voice");
      const turn = await runPhoneTurn({ session, phone: from, userText: text, languageHint: knownLang ?? language });
      await store.putPendingReply(key, { text: toSpeech(turn.text), language: turn.language });
    } catch (error) {
      console.error("[voice] turn failed", error);
      await store.putPendingReply(key, { text: APOLOGY[language], language, endCall: true });
    }
  });

  const next = `/api/voice/answer?key=${encodeURIComponent(key)}&n=0${knownLang ? `&lang=${knownLang}` : ""}`;
  return twimlResponse(response(knownLang ? say(knownLang, voice(knownLang).oneMoment) : pause(1), redirect(next)));
}
