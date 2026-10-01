import type { Metadata } from "next";
import Link from "next/link";
import { readEvalSummary } from "@/lib/eval-summary";
import { LANGUAGES, LANGUAGE_CODES, isLanguageCode } from "@/lib/languages";
import { requirePartner } from "@/lib/partner-auth";
import { getStore, type HandoffStatus } from "@/lib/store";
import { addSampleRequests, logout } from "./actions";
import {
  CONTACT_LABELS,
  LanguageTag,
  StatusActions,
  StatusBadge,
  TOPIC_LABELS,
  isStale,
  maskContact,
  timeAgo,
} from "./ui";

export const metadata: Metadata = { title: "Help requests · Costa Partners", robots: { index: false } };

const STATUSES: HandoffStatus[] = ["new", "assigned", "resolved"];

function isStatus(v: unknown): v is HandoffStatus {
  return typeof v === "string" && (STATUSES as string[]).includes(v);
}

export default async function PartnersPage({ searchParams }: PageProps<"/partners">) {
  const partner = await requirePartner();
  const sp = await searchParams;
  const status = isStatus(sp.status) ? sp.status : undefined;
  const language = isLanguageCode(sp.language) ? sp.language : undefined;
  const topic = typeof sp.topic === "string" && sp.topic in TOPIC_LABELS ? sp.topic : undefined;

  const store = getStore();
  const [all, rows, evals] = await Promise.all([store.listHandoffs(), store.listHandoffs({ status, language, topic }), readEvalSummary()]);
  const counts = Object.fromEntries(STATUSES.map((s) => [s, all.filter((h) => h.status === s).length])) as Record<
    HandoffStatus,
    number
  >;

  const href = (patch: Record<string, string | undefined>) => {
    const q = new URLSearchParams();
    const merged = { status, language, topic, ...patch };
    for (const [k, v] of Object.entries(merged)) if (v) q.set(k, v);
    const s = q.toString();
    return s ? `/partners?${s}` : "/partners";
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 font-bold text-pine-800">
            <span aria-hidden className="grid h-7 w-7 place-items-center rounded-full bg-pine-700 text-sm text-white">
              C
            </span>
            Costa Partners
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">Help requests</h1>
          {evals && (
            <p className="mt-1 text-sm text-stone-600">
              Safety eval: {evals.passed}/{evals.total} passing
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 text-sm text-stone-600">
          Signed in as <strong className="text-stone-900">{partner.name}</strong>
          <form action={logout}>
            <button className="rounded-full border border-stone-300 px-3 py-1.5 hover:bg-stone-100">Sign out</button>
          </form>
        </div>
      </header>

      <nav aria-label="Status" className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Link
          href={href({ status: undefined })}
          className={`rounded-lg border p-4 ${!status ? "border-stone-900 bg-white" : "border-stone-200 bg-stone-50 hover:bg-white"}`}
        >
          <p className="text-sm text-stone-600">All</p>
          <p className="text-3xl font-bold">{all.length}</p>
        </Link>
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={href({ status: s })}
            className={`rounded-lg border p-4 ${status === s ? "border-stone-900 bg-white" : "border-stone-200 bg-stone-50 hover:bg-white"}`}
          >
            <p className="text-sm capitalize text-stone-600">{s}</p>
            <p className="text-3xl font-bold">{counts[s]}</p>
          </Link>
        ))}
      </nav>

      <form method="get" className="flex flex-wrap items-end gap-3 text-sm">
        {status && <input type="hidden" name="status" value={status} />}
        <label className="flex flex-col gap-1">
          Language
          <select name="language" defaultValue={language ?? ""} className="rounded-lg border border-stone-300 bg-white px-3 py-2">
            <option value="">All languages</option>
            {LANGUAGE_CODES.map((c) => (
              <option key={c} value={c}>
                {LANGUAGES[c].name}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          Benefit
          <select name="topic" defaultValue={topic ?? ""} className="rounded-lg border border-stone-300 bg-white px-3 py-2">
            <option value="">All benefits</option>
            {Object.entries(TOPIC_LABELS).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <button className="rounded-lg bg-stone-900 px-4 py-2 font-medium text-white">Filter</button>
        {(language || topic) && (
          <Link href={href({ language: undefined, topic: undefined })} className="py-2 text-stone-600 underline">
            Clear
          </Link>
        )}
      </form>

      {rows.length === 0 ? (
        <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-stone-300 p-8 text-stone-600">
          <p>No help requests{status ? ` with status “${status}”` : ""} yet.</p>
          {all.length === 0 && (
            <form action={addSampleRequests}>
              <button className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm hover:bg-stone-100">
                Load sample requests for a demo
              </button>
            </form>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-stone-200 bg-white">
          <table className="w-full min-w-[56rem] text-left text-sm">
            <thead className="border-b border-stone-200 bg-stone-50 text-xs uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-4 py-3 font-medium">Request</th>
                <th className="px-4 py-3 font-medium">Language</th>
                <th className="px-4 py-3 font-medium">Benefit</th>
                <th className="px-4 py-3 font-medium">Summary</th>
                <th className="px-4 py-3 font-medium">Contact</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {rows.map((h) => {
                const stale = isStale(h);
                return (
                  <tr key={h.id} className="align-top hover:bg-stone-50/60">
                    <td className="px-4 py-3">
                      <Link href={`/partners/${h.id}`} className="font-mono font-semibold text-pine-800 underline-offset-2 hover:underline">
                        {h.reference}
                      </Link>
                      <p className={`text-xs ${stale ? "font-medium text-red-700" : "text-stone-500"}`}>
                        {timeAgo(h.createdAt)}
                      </p>
                      <p className="text-xs text-stone-500">{h.area}</p>
                    </td>
                    <td className="px-4 py-3">
                      <LanguageTag code={h.language} />
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{TOPIC_LABELS[h.topic] ?? h.topic}</td>
                    <td className="max-w-md px-4 py-3 text-stone-700">
                      <p className="line-clamp-3">{h.summary}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <p className="font-medium">{CONTACT_LABELS[h.preferredContact]}</p>
                      <p className="font-mono text-xs text-stone-500">{maskContact(h.contact)}</p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={h.status} />
                      {h.assignedTo && <p className="mt-1 text-xs text-stone-500">{h.assignedTo}</p>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <StatusActions handoff={h} compact />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-xs text-stone-500">
        Requests only include what the person agreed to share. Resolved requests are deleted after 30 days.
      </p>
    </main>
  );
}
