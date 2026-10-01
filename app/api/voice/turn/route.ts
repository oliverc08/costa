import { createOpenAI } from "@ai-sdk/openai";
import { after } from "next/server";
import { transcribe } from "ai";
import { hasLocalLlm, localLlmBaseUrl, models } from "@/lib/config";
import { loadOrCreateSession, phoneSessionId, runPhoneTurn } from "@/lib/conversation";
import { voice } from "@/lib/i18n";
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

const USE_WEB: Record<LanguageCode, string> = {
  en: "Phone speech needs a local speech model. Please use the Costa web app, or text this number.",
  es: "La voz por teléfono necesita un modelo local. Use la app web de Costa, o mande un mensaje de texto.",
  zh: "电话语音需要本地语音模型。请使用 Costa 网页，或发短信到这个号码。",
  tl: "Kailangan ng local speech model ang tawag. Gamitin ang Costa web app, o mag-text.",
  vi: "Cuộc gọi cần mô hình giọng nói cục bộ. Hãy dùng ứng dụng web Costa, hoặc nhắn tin.",
  ko: "전화 음성은 로컬 음성 모델이 필요합니다. Costa 웹을 쓰거나 문자하세요.",
  pt: "Voz por telefone precisa de um modelo local. Use a app web Costa, ou envie SMS.",
};

async function transcribeRecording(url: string): Promise<{ text: string; language: LanguageCode | null }> {
  try {
    if (!hasLocalLlm()) return { text: "", language: null };
    const openai = createOpenAI({
      baseURL: localLlmBaseUrl()!,
      apiKey: process.env.COSTA_LOCAL_LLM_API_KEY ?? "ollama",
      name: "costa-local",
    });
    const audio = await fetchTwilioMedia(url);
    const result = await transcribe({
      model: openai.transcription(models.transcription),
      audio: audio.data,
    });
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
        if (!hasLocalLlm()) {
          await store.putPendingReply(key, { text: USE_WEB[language], language, endCall: true });
          return;
        }
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
