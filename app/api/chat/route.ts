import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { cookies } from "next/headers";
import { streamAgent } from "@/lib/agent";
import { hasAiGateway } from "@/lib/config";
import { type Faq, faqAnswer, faqQuestion, faqSources, matchFaq } from "@/lib/faq";
import { isLanguageCode, type LanguageCode } from "@/lib/languages";
import { REDACTED, redact } from "@/lib/safety/redact";
import { wantsHuman } from "@/lib/safety/intent";

export const maxDuration = 60;

const SESSION_COOKIE = "costa_sid";

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

export async function POST(req: Request) {
  const body = (await req.json()) as { messages: UIMessage[]; language?: string };
  const messages = body.messages.slice(-30);
  const preferredLang = isLanguageCode(body.language) ? body.language : undefined;

  const last = messages.at(-1);
  if (last?.role === "user") {
    const text = last.parts.map((p) => (p.type === "text" ? p.text : "")).join(" ");
    const hit = matchFaq(text, { preferredLang });
    if (hit) {
      // Prefer the user's UI language for the canned answer when available.
      const replyLang = preferredLang ?? hit.language;
      return faqResponse(hit.faq, replyLang);
    }
  }

  if (!hasAiGateway()) {
    return Response.json(
      { error: "Costa is not configured yet: set AI_GATEWAY_API_KEY." },
      { status: 503 },
    );
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
  const lastText =
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

  const result = streamAgent(
    {
      channel: "web",
      sessionId,
      contact: null,
      languageHint: isLanguageCode(body.language) ? body.language : null,
      redactedThisTurn,
      wantsHuman: wantsHuman(lastText),
    },
    await convertToModelMessages(cleaned),
  );

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      onError: (error) => {
        console.error("[chat] stream error", error);
        return "Sorry, something went wrong. Please try again.";
      },
    }),
  });
}
