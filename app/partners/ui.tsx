import { LANGUAGES } from "@/lib/languages";
import type { Handoff, HandoffStatus } from "@/lib/store";
import { updateStatus } from "./actions";

export const TOPIC_LABELS: Record<string, string> = {
  "medi-cal": "Medi-Cal",
  calfresh: "CalFresh",
  wic: "WIC",
  caleitc: "CalEITC",
  disaster: "Disaster aid",
  other: "Other",
};

export const CONTACT_LABELS: Record<Handoff["preferredContact"], string> = {
  sms: "Text",
  call: "Call",
  email: "Email",
  "in-person": "In person",
};

const STATUS_STYLE: Record<HandoffStatus, string> = {
  new: "bg-sky-100 text-sky-900",
  assigned: "bg-amber-100 text-amber-900",
  resolved: "bg-emerald-100 text-emerald-900",
};

export function StatusBadge({ status }: { status: HandoffStatus }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${STATUS_STYLE[status]}`}>
      {status}
    </span>
  );
}

export function LanguageTag({ code }: { code: Handoff["language"] }) {
  const l = LANGUAGES[code];
  return (
    <span className="whitespace-nowrap">
      <span lang={code}>{l.native}</span>
      {l.native !== l.name && <span className="text-stone-500"> · {l.name}</span>}
    </span>
  );
}

const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export function timeAgo(iso: string, now = Date.now()): string {
  const minutes = Math.round((Date.parse(iso) - now) / 60_000);
  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 48) return rtf.format(hours, "hour");
  return rtf.format(Math.round(hours / 24), "day");
}

/** A new request nobody has picked up for two days. */
export function isStale(h: Handoff, now = Date.now()): boolean {
  return h.status === "new" && now - Date.parse(h.createdAt) > 48 * 3_600_000;
}

export function maskContact(contact: string | null): string {
  if (!contact) return "—";
  if (contact.includes("@")) return contact.replace(/^(.).*(@.*)$/, "$1•••$2");
  return `•••${contact.slice(-4)}`;
}

export function formatPhone(contact: string): string {
  const d = contact.replace(/\D/g, "").replace(/^1/, "");
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : contact;
}

export function StatusActions({ handoff, compact = false }: { handoff: Handoff; compact?: boolean }) {
  const next =
    handoff.status === "new"
      ? { action: "assign", label: "Assign to me", style: "bg-pine-700 text-white hover:bg-pine-800" }
      : handoff.status === "assigned"
        ? { action: "resolve", label: "Mark resolved", style: "bg-emerald-700 text-white hover:bg-emerald-800" }
        : { action: "reopen", label: "Reopen", style: "border border-stone-300 text-stone-700 hover:bg-stone-100" };
  return (
    <form action={updateStatus}>
      <input type="hidden" name="id" value={handoff.id} />
      <button
        type="submit"
        name="action"
        value={next.action}
        className={`whitespace-nowrap rounded-full font-medium ${compact ? "px-3 py-1 text-xs" : "px-4 py-2 text-sm"} ${next.style}`}
      >
        {next.label}
      </button>
    </form>
  );
}
