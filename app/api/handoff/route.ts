import { z } from "zod";
import { createHandoff } from "@/lib/handoff";

const contactFields = {
  consent: z.literal(true),
  language: z.enum(["en", "es", "zh", "tl", "vi", "ko", "pt"]),
  area: z.string().trim().min(2).max(80),
  preferredContact: z.enum(["sms", "call"]),
  contact: z.string().trim().min(7).max(40),
};

const letterRequest = z.object({
  ...contactFields,
  letter: z.object({
    program: z.enum(["medi-cal", "calfresh", "wic", "caleitc", "disaster", "other", "unknown"]),
    noticeType: z.string().max(40),
    formNumber: z.string().max(40).nullable(),
    deadline: z.string().max(20).nullable(),
    requestedAction: z.string().max(300),
  }),
});

const generalRequest = z.object({
  ...contactFields,
  topic: z.enum(["medi-cal", "calfresh", "wic", "caleitc", "disaster", "other"]),
  note: z.string().trim().max(400).optional(),
  checkup: z.string().trim().max(600).optional(),
});

const bodySchema = z.union([letterRequest, generalRequest]);

function letterSummary(l: z.infer<typeof letterRequest>["letter"]): string {
  return [
    `Needs help with a ${l.program === "unknown" ? "benefits" : l.program} letter (${l.noticeType.replace(/-/g, " ")}${l.formNumber ? `, ${l.formNumber}` : ""}).`,
    l.deadline ? `Deadline on letter: ${l.deadline}.` : "No deadline found on the letter.",
    `Letter asks: ${l.requestedAction}`,
  ].join(" ");
}

function generalSummary(b: z.infer<typeof generalRequest>): string {
  return [
    `Asked for help with ${b.topic === "other" ? "benefits" : b.topic} from the Costa app.`,
    b.note ? `Their note (${b.language}): "${b.note}"` : "",
    b.checkup ?? "",
  ]
    .filter(Boolean)
    .join(" ");
}

/** Handoff requests from the web app's forms (letter result or the Help screen). */
export async function POST(req: Request) {
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return Response.json({ ok: false, error: "invalid-request" }, { status: 400 });
  }
  const b = parsed.data;
  const isLetter = "letter" in b;
  const summary = (isLetter ? letterSummary(b.letter) : generalSummary(b)).slice(0, 600);
  const topic = isLetter ? (b.letter.program === "unknown" ? "other" : b.letter.program) : b.topic;

  const result = await createHandoff(
    {
      userConsented: true,
      language: b.language,
      topic,
      area: b.area,
      preferredContact: b.preferredContact,
      contact: b.contact,
      summary,
    },
    { channel: isLetter ? "letter" : "web", sessionId: null, knownContact: null },
  );
  return Response.json(result, { status: result.ok ? 200 : 400 });
}
