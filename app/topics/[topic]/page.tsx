import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app/AppShell";
import { ArrowRightIcon, BasketIcon, CameraIcon, ChatIcon, ChecklistIcon, CheckIcon, CoinsIcon, FlameIcon, HeartIcon, PeopleIcon, PlusIcon } from "@/components/app/Icons";
import { RichText } from "@/components/app/RichText";
import { faqSources, faqsForTopic } from "@/lib/faq";
import { APP, type TopicId } from "@/lib/i18n-app";
import { resolveUiLanguage } from "@/lib/ui-language";

const TOPICS: Record<TopicId, { Icon: typeof HeartIcon; helpTopic: string; actions: ("check" | "letter" | "help" | "ask")[] }> = {
  health: { Icon: HeartIcon, helpTopic: "medi-cal", actions: ["check", "letter", "help", "ask"] },
  food: { Icon: BasketIcon, helpTopic: "calfresh", actions: ["check", "help", "ask"] },
  money: { Icon: CoinsIcon, helpTopic: "caleitc", actions: ["check", "help", "ask"] },
  disaster: { Icon: FlameIcon, helpTopic: "disaster", actions: ["help", "ask"] },
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
  const { Icon, helpTopic, actions } = TOPICS[topic];
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
        <header className="flex flex-col gap-2">
          <Icon size={30} strokeWidth={1.8} className="text-poppy-600" />
          <h1 className="text-[30px] leading-tight text-pine-950">{a.topics[topic].title}</h1>
          <p className="text-[17px] leading-relaxed text-stone-700">{a.topics[topic].intro}</p>
        </header>

        <section className="flex flex-col gap-2">
          <h2 className="text-[21px] text-pine-950">{a.topics.questions}</h2>
          <ul className="divide-y divide-stone-300 border-y border-stone-300">
            {faqs.map((f, i) => (
              <li key={f.id}>
                <details open={i === 0} className="group">
                  <summary className="flex min-h-16 cursor-pointer items-center gap-3 py-3">
                    <span className="flex-1 text-[17px] font-semibold leading-snug">{f.question[lang]}</span>
                    <PlusIcon size={20} className="shrink-0 text-pine-800 transition-transform group-open:rotate-45" />
                  </summary>
                  <div className="flex flex-col gap-3 pb-5">
                    <RichText text={f.answer[lang]} className="text-[16px]" />
                    <div className="flex flex-col gap-1.5 border-t border-dashed border-stone-300 pt-3">
                      {faqSources(f).map((s) => (
                        <a key={s.sourceId} href={s.url} target="_blank" rel="noreferrer" className="flex items-start gap-2 text-[13px] leading-snug text-stone-600">
                          <CheckIcon size={15} strokeWidth={3} className="mt-0.5 shrink-0 text-pine-700" />
                          <span>
                            <span className="font-semibold text-stone-800 underline decoration-stone-300 underline-offset-2">{s.title}</span>
                            <span className="block">{s.agency}</span>
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

        <section className="flex flex-col gap-2">
          <h2 className="text-[21px] text-pine-950">{a.topics.actions}</h2>
          <ul className="divide-y divide-stone-300 border-y border-stone-300">
            {actions.map((k) => {
              const { href, label, Icon: ActionIcon } = actionLinks[k];
              return (
                <li key={k}>
                  <Link href={href} className="-mx-2 flex min-h-16 items-center gap-4 px-2 active:bg-stone-200/50">
                    <ActionIcon size={24} strokeWidth={1.8} className="shrink-0 text-pine-800" />
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
