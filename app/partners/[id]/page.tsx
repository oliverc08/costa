import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LANGUAGES } from "@/lib/languages";
import { requirePartner } from "@/lib/partner-auth";
import { getStore } from "@/lib/store";
import { CONTACT_LABELS, LanguageTag, StatusActions, StatusBadge, TOPIC_LABELS, formatPhone, timeAgo } from "../ui";

export const metadata: Metadata = { title: "Help request · Costa Partners", robots: { index: false } };

const CHANNEL_LABELS = { web: "Web chat", sms: "Text message", voice: "Phone call", letter: "Letter upload" } as const;

export default async function HandoffDetail({ params }: PageProps<"/partners/[id]">) {
  await requirePartner();
  const { id } = await params;
  const h = await getStore().getHandoff(id);
  if (!h) notFound();

  const isPhone = h.contact && !h.contact.includes("@");
  const rows: [string, React.ReactNode][] = [
    ["Language", <LanguageTag key="l" code={h.language} />],
    ["Benefit", TOPIC_LABELS[h.topic] ?? h.topic],
    ["Area", h.area],
    ["Came from", CHANNEL_LABELS[h.channel]],
    ["Received", `${new Date(h.createdAt).toLocaleString("en-US", { timeZone: "America/Los_Angeles" })} (${timeAgo(h.createdAt)})`],
    ["Assigned to", h.assignedTo ?? "—"],
  ];

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-5 py-8">
      <Link href="/partners" className="text-sm text-teal-800 underline-offset-2 hover:underline">
        ← All requests
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-sm text-stone-500">Request</p>
          <h1 className="font-mono text-3xl font-bold">{h.reference}</h1>
          <div className="mt-2">
            <StatusBadge status={h.status} />
          </div>
        </div>
        <StatusActions handoff={h} />
      </header>

      <section className="rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-stone-500">Summary</h2>
        <p className="mt-2 text-lg leading-relaxed">{h.summary}</p>
      </section>

      <section className="rounded-2xl bg-teal-900 p-5 text-teal-50">
        <h2 className="text-xs font-semibold uppercase tracking-wide text-teal-200">
          Preferred contact: {CONTACT_LABELS[h.preferredContact]}
        </h2>
        {h.contact ? (
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <span className="font-mono text-2xl text-white">{isPhone ? formatPhone(h.contact) : h.contact}</span>
            {isPhone && (
              <>
                <a href={`tel:${h.contact}`} className="rounded-full bg-white px-4 py-1.5 text-sm font-semibold text-teal-900">
                  Call
                </a>
                <a href={`sms:${h.contact}`} className="rounded-full border border-teal-200 px-4 py-1.5 text-sm font-semibold">
                  Text
                </a>
              </>
            )}
          </div>
        ) : (
          <p className="mt-2">No contact provided.</p>
        )}
        <p className="mt-3 text-sm text-teal-100">
          Reach out in {LANGUAGES[h.language].name} and mention reference {h.reference} so they know it&apos;s about
          their Costa request.
        </p>
      </section>

      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-3 rounded-2xl border border-stone-200 bg-white p-5 text-sm">
        {rows.map(([k, v]) => (
          <div key={k} className="contents">
            <dt className="text-stone-500">{k}</dt>
            <dd className="text-stone-900">{v}</dd>
          </div>
        ))}
      </dl>
    </main>
  );
}
