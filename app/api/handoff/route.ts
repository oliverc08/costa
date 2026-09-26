import { z } from "zod";
import { createHandoff } from "@/lib/handoff";

const bodySchema = z.object({
  consent: z.literal(true),
  language: z.enum(["en", "es", "zh", "tl", "vi"]),
  area: z.string().trim().min(2).max(80),
  preferredContact: z.enum(["sms", "call"]),
  contact: z.string().trim().min(7).max(40),
  letter: z.object({
    program: z.enum(["medi-cal", "calfresh", "wic", "caleitc", "disaster", "other", "unknown"]),
    noticeType: z.string().max(40),
    formNumber: z.string().max(40).nullable(),
    deadline: z.string().max(20).nullable(),
    requestedAction: z.string().max(300),
  }),
});

/** Handoff request from the letter page, where the person fills in a short form. */
export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ ok: false, error: "invalid-request" }, { status: 400 });
  }
  const b = parsed.data;
  const l = b.letter;
  const summary = [
    `Needs help with a ${l.program === "unknown" ? "benefits" : l.program} letter (${l.noticeType.replace(/-/g, " ")}${l.formNumber ? `, ${l.formNumber}` : ""}).`,
    l.deadline ? `Deadline on letter: ${l.deadline}.` : "No deadline found on the letter.",
    `Letter asks: ${l.requestedAction}`,
  ].join(" ");

  const result = await createHandoff(
    {
      userConsented: true,
      language: b.language,
      topic: l.program === "unknown" ? "other" : l.program,
      area: b.area,
      preferredContact: b.preferredContact,
      contact: b.contact,
      summary,
    },
    { channel: "letter", sessionId: null, knownContact: null },
  );
  return Response.json(result, { status: result.ok ? 200 : 400 });
}
