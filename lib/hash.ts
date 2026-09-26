import { createHmac } from "node:crypto";

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET must be set in production");
  return "costa-dev-secret";
}

/** Stable, non-reversible session key for a phone number so raw numbers never key stored conversations. */
export function hashPhone(phone: string): string {
  const normalized = phone.replace(/[^\d+]/g, "");
  return createHmac("sha256", secret()).update(`phone:${normalized}`).digest("hex").slice(0, 32);
}

export function sign(value: string): string {
  return createHmac("sha256", secret()).update(value).digest("hex");
}
