import { generateText, isStepCount, streamText, type ModelMessage } from "ai";
import { models } from "@/lib/config";
import type { LanguageCode } from "@/lib/languages";
import type { Channel } from "@/lib/store/types";
import { auditReply } from "@/lib/safety/output";
import { createTools, type ToolContext } from "@/lib/tools";
import { buildInstructions } from "./instructions";

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

function modelFor(channel: Channel) {
  return channel === "voice" ? models.voice : models.chat;
}

function settings(ctx: AgentContext) {
  return {
    model: modelFor(ctx.channel),
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

export function streamAgent(ctx: AgentContext, messages: ModelMessage[]) {
  return streamText({ ...settings(ctx), messages, onFinish: ({ text }) => logAudit(ctx.channel, text) });
}

export async function runAgent(
  ctx: AgentContext,
  messages: ModelMessage[],
): Promise<{ text: string; tools: ToolTrace[] }> {
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
