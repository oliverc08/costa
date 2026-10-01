import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { cookies } from "next/headers";
import { streamAgent } from "@/lib/agent";
import { hasAiGateway, isGatewayBillingError } from "@/lib/config";
import { type Faq, faqAnswer, faqQuestion, faqSources, matchFaq } from "@/lib/faq";
import { isLanguageCode, type LanguageCode } from "@/lib/languages";
import { REDACTED, redact } from "@/lib/safety/redact";
import { wantsHuman } from "@/lib/safety/intent";

export const maxDuration = 60;

const SESSION_COOKIE = "costa_sid";

const OFFLINE_HINT: Record<LanguageCode, string> = {
  en: "I couldn't match that to a common question, and the live AI helper isn't available right now. Try one of the common questions on this screen, or open Help to request a person.",
  es: "No pude relacionar eso con una pregunta común, y la ayuda con IA no está disponible ahora. Pruebe una de las preguntas comunes en esta pantalla, o abra Ayuda para pedir que alguien le contacte.",
  zh: "我无法把这句话对应到常见问题，而且目前无法使用实时 AI 助手。请试试本页的常见问题，或打开“帮助”请求人工联系。",
  tl: "Hindi ko naiugnay iyon sa karaniwang tanong, at hindi available ngayon ang AI helper. Subukan ang mga common questions sa screen na ito, o buksan ang Help para humingi ng tao.",
  vi: "Tôi chưa khớp được câu đó với câu hỏi thường gặp, và trợ lý AI hiện không dùng được. Hãy thử một câu hỏi thường gặp trên màn hình này, hoặc mở Trợ giúp để nhờ người liên hệ.",
  ko: "그 질문을 자주 묻는 항목에 맞추지 못했고, 지금 실시간 AI를 쓸 수 없습니다. 화면의 자주 묻는 질문을 고르거나 Help에서 사람 연락을 요청해 주세요.",
  pt: "Não consegui associar isso a uma pergunta comum, e a ajuda com IA não está disponível agora. Experimente uma das perguntas comuns neste ecrã, ou abra Ajuda para pedir contacto de uma pessoa.",
};

function faqResponse(faq: Faq, language: LanguageCode): Response {
  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      const textId = crypto.randomUUID();
      const toolCallId = `faq-${crypto.randomUUID()}`;
      writer.write({ type: "text-start", id: textId });
      writer.write({ type: "text-delta", id: textId, delta: faqAnswer(faq, language) });
      writer.write({ type: "text-end", id: textId });
      writer.write({
        type: "tool-input-available",
        toolCallId,
        toolName: "searchBenefits",
        input: { query: faqQuestion(faq, language) },
      });
      writer.write({
        type: "tool-output-available",
        toolCallId,
        output: { found: true, results: faqSources(faq) },
      });
    },
  });
  return createUIMessageStreamResponse({ stream });
}

function offlineHintResponse(language: LanguageCode): Response {
  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      const textId = crypto.randomUUID();
      writer.write({ type: "text-start", id: textId });
      writer.write({ type: "text-delta", id: textId, delta: OFFLINE_HINT[language] ?? OFFLINE_HINT.en });
      writer.write({ type: "text-end", id: textId });
    },
  });
  return createUIMessageStreamResponse({ stream });
}

function resolveFaqHit(text: string, preferredLang?: LanguageCode) {
  return matchFaq(text, { preferredLang });
}

export async function POST(req: Request) {
  const body = (await req.json()) as { messages: UIMessage[]; language?: string };
  const messages = body.messages.slice(-30);
  const preferredLang = isLanguageCode(body.language) ? body.language : undefined;
  const replyLang = preferredLang ?? "en";

  const last = messages.at(-1);
  const lastText =
    last?.role === "user"
      ? last.parts.map((p) => (p.type === "text" ? p.text : "")).join(" ")
      : "";

  if (lastText) {
    const hit = resolveFaqHit(lastText, preferredLang);
    if (hit) return faqResponse(hit.faq, preferredLang ?? hit.language);
  }

  if (!hasAiGateway()) {
    return offlineHintResponse(replyLang);
  }

  let redactedThisTurn = false;
  const lastIndex = messages.length - 1;
  const cleaned: UIMessage[] = messages.map((m, i) => {
    if (m.role !== "user") return m;
    return {
      ...m,
      parts: m.parts.map((p) => {
        if (p.type !== "text") return p;
        const r = redact(p.text);
        if (i === lastIndex && (r.redacted || p.text.includes(REDACTED))) redactedThisTurn = true;
        return { ...p, text: r.text };
      }),
    };
  });

  const lastUser = [...cleaned].reverse().find((m) => m.role === "user");
  const cleanedText =
    lastUser?.parts.map((p) => (p.type === "text" ? p.text : "")).join(" ") ?? "";

  const jar = await cookies();
  let sessionId = jar.get(SESSION_COOKIE)?.value;
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    jar.set(SESSION_COOKIE, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
      path: "/",
    });
  }

  try {
    const result = streamAgent(
      {
        channel: "web",
        sessionId,
        contact: null,
        languageHint: preferredLang ?? null,
        redactedThisTurn,
        wantsHuman: wantsHuman(cleanedText),
      },
      await convertToModelMessages(cleaned),
    );

    return createUIMessageStreamResponse({
      stream: toUIMessageStream({
        stream: result.stream,
        onError: (error) => {
          console.error("[chat] stream error", error);
          if (isGatewayBillingError(error)) {
            return OFFLINE_HINT[replyLang] ?? OFFLINE_HINT.en;
          }
          return "Sorry, something went wrong. Please try again.";
        },
      }),
    });
  } catch (error) {
    console.error("[chat] agent start error", error);
    return offlineHintResponse(replyLang);
  }
}
