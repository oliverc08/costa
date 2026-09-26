import type { ModelMessage } from "ai";
import { runAgent, type ToolTrace } from "@/lib/agent";
import { hashPhone } from "@/lib/hash";
import { detectLanguage, type LanguageCode } from "@/lib/languages";
import { wantsHuman } from "@/lib/safety/intent";
import { REDACTED, redact } from "@/lib/safety/redact";
import { getStore, type Session, type StoredTurn } from "@/lib/store";

const HISTORY_TURNS = 12;

export function phoneSessionId(channel: "sms" | "voice", phone: string): string {
  return `${channel}:${hashPhone(phone)}`;
}

export async function loadOrCreateSession(id: string, channel: Session["channel"]): Promise<{ session: Session; isNew: boolean }> {
  const existing = await getStore().getSession(id);
  if (existing) return { session: existing, isNew: false };
  const now = new Date().toISOString();
  return {
    session: { id, channel, language: null, turns: [], consentShown: false, createdAt: now, updatedAt: now },
    isNew: true,
  };
}

export interface TurnResult {
  text: string;
  language: LanguageCode;
  redacted: boolean;
  tools: ToolTrace[];
  session: Session;
}

/**
 * Runs one SMS or voice turn: redact, detect language, call the shared agent with
 * recent history, and persist the (redacted) turns.
 */
export async function runPhoneTurn(opts: {
  session: Session;
  phone: string;
  userText: string;
  languageHint?: LanguageCode | null;
}): Promise<TurnResult> {
  const { session } = opts;
  const r = redact(opts.userText);
  const language = opts.languageHint ?? detectLanguage(r.text) ?? session.language ?? "en";

  const history: ModelMessage[] = session.turns.slice(-HISTORY_TURNS).map((t) => ({ role: t.role, content: t.content }));
  const messages: ModelMessage[] = [...history, { role: "user", content: r.text }];

  const result = await runAgent(
    {
      channel: session.channel === "voice" ? "voice" : "sms",
      sessionId: session.id,
      contact: opts.phone,
      languageHint: language,
      redactedThisTurn: r.redacted || opts.userText.includes(REDACTED),
      wantsHuman: wantsHuman(r.text),
    },
    messages,
  );

  const now = new Date().toISOString();
  const turns: StoredTurn[] = [
    { role: "user", content: r.text, at: now },
    { role: "assistant", content: redact(result.text).text, at: now },
  ];
  const updated: Session = {
    ...session,
    language,
    turns: [...session.turns, ...turns].slice(-HISTORY_TURNS * 2),
    updatedAt: now,
  };
  await getStore().saveSession(updated);

  return { text: result.text, language, redacted: r.redacted, tools: result.tools, session: updated };
}
