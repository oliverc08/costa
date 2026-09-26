import {
  convertToModelMessages,
  createUIMessageStreamResponse,
  toUIMessageStream,
  type UIMessage,
} from "ai";
import { cookies } from "next/headers";
import { streamAgent } from "@/lib/agent";
import { hasAiGateway } from "@/lib/config";
import { isLanguageCode } from "@/lib/languages";
import { REDACTED, redact } from "@/lib/safety/redact";
import { wantsHuman } from "@/lib/safety/intent";

export const maxDuration = 60;

const SESSION_COOKIE = "costa_sid";

export async function POST(req: Request) {
  if (!hasAiGateway()) {
    return Response.json(
      { error: "Costa is not configured yet: set AI_GATEWAY_API_KEY." },
      { status: 503 },
    );
  }

  const body = (await req.json()) as { messages: UIMessage[]; language?: string };
  const messages = body.messages.slice(-30);

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
