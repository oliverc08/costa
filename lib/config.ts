/**
 * Inference config — Costa is local-first.
 * - Default: deterministic local agent (FAQ + lexical KB + templates). No cloud LLM.
 * - Optional: small local models via Ollama-compatible OpenAI API (`COSTA_LOCAL_LLM_URL`).
 * AI Gateway / cloud billing is not used.
 */

export const models = {
  /** Ollama (or compatible) model id when COSTA_LOCAL_LLM_URL is set */
  chat: process.env.COSTA_CHAT_MODEL ?? "llama3.2:1b",
  voice: process.env.COSTA_VOICE_MODEL ?? process.env.COSTA_CHAT_MODEL ?? "llama3.2:1b",
  vision: process.env.COSTA_VISION_MODEL ?? process.env.COSTA_CHAT_MODEL ?? "llama3.2:1b",
  judge: process.env.COSTA_JUDGE_MODEL ?? process.env.COSTA_CHAT_MODEL ?? "llama3.2:1b",
  embedding: process.env.COSTA_EMBEDDING_MODEL ?? "nomic-embed-text",
  transcription: process.env.COSTA_TRANSCRIPTION_MODEL ?? "whisper-tiny",
};

export const EMBEDDING_DIMENSIONS = 768;

export const RETENTION_DAYS = 30;

/** OpenAI-compatible base URL for a local server (Ollama default: http://127.0.0.1:11434/v1). */
export function localLlmBaseUrl(): string | null {
  const raw = process.env.COSTA_LOCAL_LLM_URL?.trim();
  if (!raw) return null;
  return raw.replace(/\/$/, "");
}

/** True when a small local LLM endpoint is configured (optional upgrade over the deterministic agent). */
export function hasLocalLlm(): boolean {
  return Boolean(localLlmBaseUrl());
}

/**
 * @deprecated Use hasLocalLlm(). Kept so older call sites compile during the migration;
 * always false — Costa no longer uses Vercel AI Gateway.
 */
export function hasAiGateway(): boolean {
  return false;
}

export function isGatewayBillingError(_error: unknown): boolean {
  return false;
}

export function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function hasTwilio(): boolean {
  return Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
}

export function publicBaseUrl(req?: Request): string {
  if (process.env.PUBLIC_BASE_URL) return process.env.PUBLIC_BASE_URL.replace(/\/$/, "");
  if (req) {
    const url = new URL(req.url);
    const proto = req.headers.get("x-forwarded-proto") ?? url.protocol.replace(":", "");
    const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? url.host;
    return `${proto}://${host}`;
  }
  return "http://localhost:3000";
}
