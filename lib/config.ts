export const models = {
  chat: process.env.COSTA_CHAT_MODEL ?? "anthropic/claude-sonnet-5",
  voice: process.env.COSTA_VOICE_MODEL ?? "google/gemini-3.8-flash",
  vision: process.env.COSTA_VISION_MODEL ?? "anthropic/claude-sonnet-5",
  judge: process.env.COSTA_JUDGE_MODEL ?? "anthropic/claude-sonnet-5",
  embedding: process.env.COSTA_EMBEDDING_MODEL ?? "openai/text-embedding-3-small",
  transcription: process.env.COSTA_TRANSCRIPTION_MODEL ?? "openai/whisper-1",
};

export const EMBEDDING_DIMENSIONS = 1536;

export const RETENTION_DAYS = 30;

export function hasAiGateway(): boolean {
  return Boolean(process.env.AI_GATEWAY_API_KEY || process.env.VERCEL_OIDC_TOKEN);
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
