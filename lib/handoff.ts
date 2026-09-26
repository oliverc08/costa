import { z } from "zod";
import { redact } from "@/lib/safety/redact";
import { getStore } from "@/lib/store";
import type { Channel, PreferredContact } from "@/lib/store/types";

export const handoffInputSchema = z.object({
  userConsented: z
    .literal(true)
    .describe("Must be true: the user explicitly said yes to being contacted by a local helper."),
  language: z.enum(["en", "es", "zh", "tl", "vi"]).describe("Language the helper should use."),
  topic: z
    .enum(["medi-cal", "calfresh", "wic", "caleitc", "disaster", "other"])
    .describe("Main benefit the person needs help with."),
  area: z.string().min(2).max(80).describe("City or county the person lives in."),
  preferredContact: z.enum(["sms", "call", "email", "in-person"]),
  contact: z
    .string()
    .max(120)
    .optional()
    .describe("Phone number or email to reach them. Leave empty on SMS/voice; the number is already known."),
  summary: z
    .string()
    .min(10)
    .max(600)
    .describe(
      "2-3 sentences in English for the helper: situation, what they need, any deadline. No SSNs, ID numbers, birth dates, or immigration status.",
    ),
});

export type HandoffInput = z.infer<typeof handoffInputSchema>;

export interface HandoffContext {
  channel: Channel;
  sessionId: string | null;
  /** Phone number known from the SMS/voice channel. */
  knownContact: string | null;
}

export type HandoffOutput =
  | { ok: true; reference: string; message: string }
  | { ok: false; error: string; missing?: string[] };

/** Returns an E.164 US number, or null if the input isn't a plausible US phone number. */
export function normalizePhone(value: string): string | null {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return null;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function resolveContact(
  preferred: PreferredContact,
  provided: string | undefined,
  known: string | null,
): { contact: string } | { error: string } {
  const value = provided?.trim();
  if (preferred === "email") {
    if (value && EMAIL.test(value)) return { contact: value.toLowerCase() };
    return { error: "An email address is needed to contact them by email." };
  }
  if (value) {
    const phone = normalizePhone(value);
    if (phone) return { contact: phone };
    if (!known) return { error: "That phone number doesn't look complete. Ask for a 10-digit US number." };
  }
  if (known) return { contact: known };
  return { error: "A phone number is needed so the helper can reach them." };
}

export async function createHandoff(raw: HandoffInput, ctx: HandoffContext): Promise<HandoffOutput> {
  const parsed = handoffInputSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: "The handoff is missing information. Ask the user for it, then try again.",
      missing: parsed.error.issues.map((i) => i.path.join(".")),
    };
  }
  const input = parsed.data;
  const contact = resolveContact(input.preferredContact, input.contact, ctx.knownContact);
  if ("error" in contact) return { ok: false, error: contact.error, missing: ["contact"] };

  const handoff = await getStore().createHandoff({
    language: input.language,
    topic: input.topic,
    area: redact(input.area).text,
    preferredContact: input.preferredContact,
    contact: contact.contact,
    summary: redact(input.summary).text,
    channel: ctx.channel,
    sessionId: ctx.sessionId,
  });

  return {
    ok: true,
    reference: handoff.reference,
    message: `Request sent. Reference ${handoff.reference}. A local helper will reach out by ${input.preferredContact}. Do not promise a specific time. Tell the user the reference number.`,
  };
}
