import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { cookies } from "next/headers";
import { runLocalAgent, streamAgent, type ToolTrace } from "@/lib/agent";
import { hasLocalLlm } from "@/lib/config";
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

function localAgentResponse(text: string, tools: ToolTrace[]): Response {
  const stream = createUIMessageStream({
    execute: ({ writer }) => {
      const textId = crypto.randomUUID();
      writer.write({ type: "text-start", id: textId });
      writer.write({ type: "text-delta", id: textId, delta: text });
      writer.write({ type: "text-end", id: textId });
      for (const t of tools) {
        const toolCallId = `local-${crypto.randomUUID()}`;
        writer.write({
          type: "tool-input-available",
          toolCallId,
          toolName: t.toolName,
          input: t.input,
        });
        writer.write({
          type: "tool-output-available",
          toolCallId,
          output: t.output,
        });
      }
    },
  });
  return createUIMessageStreamResponse({ stream });
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
    const hit = matchFaq(lastText, { preferredLang });
    if (hit) return faqResponse(hit.faq, preferredLang ?? hit.language);
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

  // Default: deterministic local agent — no session / LLM required.
  if (!hasLocalLlm()) {
    const local = await runLocalAgent({
      text: cleanedText,
      language: replyLang,
      wantsHumanHint: wantsHuman(cleanedText),
    });
    return localAgentResponse(local.text, local.tools);
  }

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

  const ctx = {
    channel: "web" as const,
    sessionId,
    contact: null,
    languageHint: preferredLang ?? null,
    redactedThisTurn,
    wantsHuman: wantsHuman(cleanedText),
  };

  try {
    const result = streamAgent(ctx, await convertToModelMessages(cleaned));
    return createUIMessageStreamResponse({
      stream: toUIMessageStream({
        stream: result.stream,
        onError: (error) => {
          console.error("[chat] local LLM stream error", error);
          return "Sorry, something went wrong with the local model. Try a common question, or open Help.";
        },
      }),
    });
  } catch (error) {
    console.error("[chat] local LLM start error — falling back to deterministic agent", error);
    const local = await runLocalAgent({
      text: cleanedText,
      language: replyLang,
      wantsHumanHint: ctx.wantsHuman,
    });
    return localAgentResponse(local.text, local.tools);
  }
}
