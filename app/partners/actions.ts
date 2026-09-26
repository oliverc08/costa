"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkPasscode, endPartnerSession, requirePartner, startPartnerSession } from "@/lib/partner-auth";
import { getStore, type HandoffStatus, type NewHandoff } from "@/lib/store";

export async function login(_prev: { error: string } | null, form: FormData): Promise<{ error: string }> {
  const passcode = String(form.get("passcode") ?? "");
  const name = String(form.get("name") ?? "");
  if (!checkPasscode(passcode)) {
    await new Promise((r) => setTimeout(r, 600));
    return { error: "That passcode is not correct." };
  }
  await startPartnerSession(name);
  redirect("/partners");
}

export async function logout() {
  await endPartnerSession();
  redirect("/partners/login");
}

const TRANSITIONS: Record<string, HandoffStatus> = { assign: "assigned", resolve: "resolved", reopen: "new" };

export async function updateStatus(form: FormData) {
  const partner = await requirePartner();
  const id = String(form.get("id") ?? "");
  const status = TRANSITIONS[String(form.get("action") ?? "")];
  if (!id || !status) return;
  await getStore().updateHandoff(id, {
    status,
    ...(status === "assigned" ? { assignedTo: partner.name } : status === "new" ? { assignedTo: null } : {}),
  });
  revalidatePath("/partners");
  revalidatePath(`/partners/${id}`);
}

const SAMPLES: NewHandoff[] = [
  {
    language: "es",
    topic: "medi-cal",
    area: "Half Moon Bay",
    preferredContact: "call",
    contact: "+16505550142",
    summary: "[Sample] Medi-Cal ended about 3 weeks ago after a missed renewal. Has the form now and needs help sending pay stubs before the 90-day cure period ends.",
    channel: "sms",
    sessionId: null,
  },
  {
    language: "zh",
    topic: "medi-cal",
    area: "San Jose",
    preferredContact: "sms",
    contact: "+14085550177",
    summary: "[Sample] Received an MC 355 request for information, due October 10. Unsure which documents count as proof of income for self-employment.",
    channel: "letter",
    sessionId: null,
  },
  {
    language: "vi",
    topic: "calfresh",
    area: "Santa Clara",
    preferredContact: "call",
    contact: "+14085550133",
    summary: "[Sample] Family of 4, income recently dropped. Wants help applying for CalFresh and asked about WIC for a 2-year-old.",
    channel: "voice",
    sessionId: null,
  },
  {
    language: "tl",
    topic: "medi-cal",
    area: "Daly City",
    preferredContact: "sms",
    contact: "+16505550118",
    summary: "[Sample] Moved from Santa Clara County to San Mateo County last week. Needs help reporting the move and choosing a new health plan.",
    channel: "web",
    sessionId: null,
  },
  {
    language: "es",
    topic: "caleitc",
    area: "Pescadero",
    preferredContact: "in-person",
    contact: "+16505550191",
    summary: "[Sample] Farmworker with an ITIN, 2 children (youngest is 4). Has never filed a California tax return and wants free help claiming CalEITC and the Young Child Tax Credit.",
    channel: "voice",
    sessionId: null,
  },
];

export async function addSampleRequests() {
  await requirePartner();
  const store = getStore();
  for (const s of SAMPLES) await store.createHandoff(s);
  revalidatePath("/partners");
}
