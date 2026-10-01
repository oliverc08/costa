import { createOpenAI } from "@ai-sdk/openai";
import { generateText, isStepCount, streamText, type ModelMessage } from "ai";
import { hasLocalLlm, localLlmBaseUrl, models } from "@/lib/config";
import type { LanguageCode } from "@/lib/languages";
import type { Channel } from "@/lib/store/types";
import { auditReply } from "@/lib/safety/output";
import { createTools, type ToolContext } from "@/lib/tools";
import { buildInstructions } from "./instructions";
import { runLocalAgent } from "./local";

export interface AgentContext extends ToolContext {
  languageHint: LanguageCode | null;
  redactedThisTurn: boolean;
  wantsHuman: boolean;
}

export interface ToolTrace {
  toolName: string;
  input: unknown;
  output: unknown;
}

const MAX_STEPS = 6;

function localModel(channel: Channel) {
  const baseURL = localLlmBaseUrl();
  if (!baseURL) throw new Error("COSTA_LOCAL_LLM_URL is not set");
  const openai = createOpenAI({
    baseURL,
    apiKey: process.env.COSTA_LOCAL_LLM_API_KEY ?? "ollama",
    name: "costa-local",
  });
  const id = channel === "voice" ? models.voice : models.chat;
  return openai.chat(id);
}

function settings(ctx: AgentContext) {
  return {
    model: localModel(ctx.channel),
    instructions: buildInstructions({
      channel: ctx.channel,
      languageHint: ctx.languageHint,
      redactedThisTurn: ctx.redactedThisTurn,
      wantsHuman: ctx.wantsHuman,
      today: new Date().toLocaleDateString("en-US", {
        timeZone: "America/Los_Angeles",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    }),
    tools: createTools(ctx),
    stopWhen: isStepCount(MAX_STEPS),
    temperature: 0.2,
  };
}

function logAudit(channel: Channel, text: string) {
  const issues = auditReply(text);
  if (issues.length) console.warn(`[safety] ${channel} reply flagged`, issues.map((i) => i.kind));
}

/** Stream via optional local LLM (Ollama). Prefer runAgent / chat route local path when unset. */
export function streamAgent(ctx: AgentContext, messages: ModelMessage[]) {
  if (!hasLocalLlm()) {
    throw new Error("No local LLM configured. Use the deterministic local agent path.");
  }
  return streamText({ ...settings(ctx), messages, onFinish: ({ text }) => logAudit(ctx.channel, text) });
}

export async function runAgent(
  ctx: AgentContext,
  messages: ModelMessage[],
): Promise<{ text: string; tools: ToolTrace[] }> {
  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const text =
    typeof lastUser?.content === "string"
      ? lastUser.content
      : Array.isArray(lastUser?.content)
        ? lastUser.content.map((p) => ("text" in p ? p.text : "")).join(" ")
        : "";

  if (!hasLocalLlm()) {
    const local = await runLocalAgent({
      text,
      language: ctx.languageHint ?? "en",
      wantsHumanHint: ctx.wantsHuman,
    });
    logAudit(ctx.channel, local.text);
    return { text: local.text, tools: local.tools };
  }

  const result = await generateText({ ...settings(ctx), messages });
  logAudit(ctx.channel, result.text);
  const outputs = new Map<string, unknown>();
  for (const r of result.steps.flatMap((s) => s.toolResults)) outputs.set(r.toolCallId, r.output);
  const tools: ToolTrace[] = result.steps.flatMap((s) => s.toolCalls).map((c) => ({
    toolName: c.toolName,
    input: c.input,
    output: outputs.get(c.toolCallId),
  }));
  return { text: result.text.trim(), tools };
}

export { runLocalAgent } from "./local";
