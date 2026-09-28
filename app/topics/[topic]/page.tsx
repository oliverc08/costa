import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app/AppShell";
import { ArrowRightIcon, BasketIcon, CameraIcon, ChatIcon, ChecklistIcon, CheckIcon, CoinsIcon, FlameIcon, HeartIcon, PeopleIcon } from "@/components/app/Icons";
import { RichText } from "@/components/app/RichText";
import { faqSources, faqsForTopic } from "@/lib/faq";
import { APP, type TopicId } from "@/lib/i18n-app";
import { resolveUiLanguage } from "@/lib/ui-language";

const TOPICS: Record<TopicId, { Icon: typeof HeartIcon; tone: string; helpTopic: string; actions: ("check" | "letter" | "help" | "ask")[] }> = {
  health: { Icon: HeartIcon, tone: "bg-rose-100 text-rose-700", helpTopic: "medi-cal", actions: ["check", "letter", "help", "ask"] },
  food: { Icon: BasketIcon, tone: "bg-lime-100 text-lime-800", helpTopic: "calfresh", actions: ["check", "help", "ask"] },
  money: { Icon: CoinsIcon, tone: "bg-amber-100 text-amber-800", helpTopic: "caleitc", actions: ["check", "help", "ask"] },
  disaster: { Icon: FlameIcon, tone: "bg-orange-100 text-orange-800", helpTopic: "disaster", actions: ["help", "ask"] },
};

const isTopic = (v: string): v is TopicId => v in TOPICS;

export async function generateMetadata({ params, searchParams }: PageProps<"/topics/[topic]">): Promise<Metadata> {
  const { topic } = await params;
  if (!isTopic(topic)) return {};
  const lang = await resolveUiLanguage((await searchParams).lang);
  return { title: `${APP[lang].topics[topic].title} · Costa` };
}

export default async function TopicPage({ params, searchParams }: PageProps<"/topics/[topic]">) {
  const { topic } = await params;
  if (!isTopic(topic)) notFound();
  const lang = await resolveUiLanguage((await searchParams).lang);
  const a = APP[lang];
  const { Icon, tone, helpTopic, actions } = TOPICS[topic];
  const faqs = faqsForTopic(topic);

  const actionLinks = {
    check: { href: "/check", label: a.topics.doCheck, Icon: ChecklistIcon },
    letter: { href: "/letter", label: a.topics.doLetter, Icon: CameraIcon },
    help: { href: `/help?topic=${helpTopic}`, label: a.topics.doHelp, Icon: PeopleIcon },
    ask: { href: "/ask", label: a.topics.doAsk, Icon: ChatIcon },
  };

  return (
    <AppShell lang={lang} back="/" title={a.nav.home}>
      <div className="flex flex-col gap-6">
        <header className="flex flex-col gap-3">
          <span className={`grid h-14 w-14 place-items-center rounded-2xl ${tone}`}>
            <Icon size={30} />
          </span>
          <h1 className="text-[28px] font-bold leading-tight">{a.topics[topic].title}</h1>
          <p className="text-[17px] leading-relaxed text-stone-700">{a.topics[topic].intro}</p>
        </header>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold">{a.topics.questions}</h2>
          <ul className="flex flex-col gap-2.5">
            {faqs.map((f, i) => (
              <li key={f.id}>
                <details open={i === 0} className="group overflow-hidden rounded-3xl border border-stone-200 bg-white shadow-sm">
                  <summary className="flex min-h-16 cursor-pointer items-center gap-3 px-4 py-3">
                    <span className="flex-1 text-[17px] font-semibold leading-snug">{f.question[lang]}</span>
                    <ArrowRightIcon size={20} className="shrink-0 text-stone-400 transition-transform group-open:rotate-90" />
                  </summary>
                  <div className="flex flex-col gap-3 border-t border-stone-100 px-4 pb-4 pt-3">
                    <RichText text={f.answer[lang]} className="text-[16px]" />
                    <div className="flex flex-col gap-1.5">
                      {faqSources(f).map((s) => (
                        <a key={s.sourceId} href={s.url} target="_blank" rel="noreferrer" className="flex items-start gap-2 rounded-xl bg-teal-50 px-3 py-2 text-[13px] leading-snug text-teal-900">
                          <CheckIcon size={16} strokeWidth={3} className="mt-0.5 shrink-0" />
                          <span>
                            <span className="font-semibold">{s.title}</span>
                            <span className="block text-teal-700">{s.agency}</span>
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                </details>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold">{a.topics.actions}</h2>
          <ul className="flex flex-col divide-y divide-stone-100 overflow-hidden rounded-3xl border border-stone-200 bg-white">
            {actions.map((k) => {
              const { href, label, Icon: ActionIcon } = actionLinks[k];
              return (
                <li key={k}>
                  <Link href={href} className="flex min-h-16 items-center gap-3 px-4 active:bg-stone-50">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-teal-50 text-teal-800">
                      <ActionIcon size={22} />
                    </span>
                    <span className="flex-1 text-[17px] font-semibold">{label}</span>
                    <ArrowRightIcon size={20} className="text-stone-400" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </AppShell>
  );
}
