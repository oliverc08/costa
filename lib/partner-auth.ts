import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { sign } from "@/lib/hash";

const COOKIE = "costa_partner";
const MAX_AGE_SECONDS = 60 * 60 * 12;
const DEV_PASSCODE = "costa-demo";

/** The dashboard passcode; in development a default is used so the demo works out of the box. */
export function partnerPasscode(): string | null {
  if (process.env.PARTNER_PASSCODE) return process.env.PARTNER_PASSCODE;
  return process.env.NODE_ENV === "production" ? null : DEV_PASSCODE;
}

export function usingDevPasscode(): boolean {
  return !process.env.PARTNER_PASSCODE && process.env.NODE_ENV !== "production";
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  return ab.length === bb.length && timingSafeEqual(ab, bb);
}

export function checkPasscode(input: string): boolean {
  const expected = partnerPasscode();
  return expected !== null && safeEqual(input, expected);
}

function encode(name: string, issuedAt: number): string {
  const payload = `${issuedAt}.${Buffer.from(name).toString("base64url")}`;
  return `${payload}.${sign(`partner:${payload}`)}`;
}

function decode(value: string | undefined): { name: string } | null {
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 3) return null;
  const [issued, name64, sig] = parts;
  if (!safeEqual(sig, sign(`partner:${issued}.${name64}`))) return null;
  if (Date.now() - Number(issued) > MAX_AGE_SECONDS * 1000) return null;
  return { name: Buffer.from(name64, "base64url").toString("utf8") };
}

export async function startPartnerSession(name: string) {
  (await cookies()).set(COOKIE, encode(name.trim().slice(0, 40) || "Partner", Date.now()), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE_SECONDS,
    path: "/partners",
  });
}

export async function endPartnerSession() {
  (await cookies()).delete({ name: COOKIE, path: "/partners" });
}

export async function getPartner(): Promise<{ name: string } | null> {
  return decode((await cookies()).get(COOKIE)?.value);
}

/** Use at the top of every partner page and server action. */
export async function requirePartner(): Promise<{ name: string }> {
  const partner = await getPartner();
  if (!partner) redirect("/partners/login");
  return partner;
}
