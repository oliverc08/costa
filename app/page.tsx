import Link from "next/link";
import { cookies } from "next/headers";
import { AppShell } from "@/components/app/AppShell";
import {
  ArrowRightIcon,
  BasketIcon,
  CameraIcon,
  ChecklistIcon,
  CoinsIcon,
  FlameIcon,
  HeartIcon,
  MessageIcon,
  MicIcon,
  PeopleIcon,
  PhoneIcon,
  ShieldIcon,
} from "@/components/app/Icons";
import { MyPlan } from "@/components/app/MyPlan";
import { Welcome } from "@/components/app/Welcome";
import { readEvalSummary } from "@/lib/eval-summary";
import { DISCLAIMER, UI } from "@/lib/i18n";
import { APP } from "@/lib/i18n-app";
import { isLanguageCode } from "@/lib/languages";
import { resolveUiLanguage, UI_LANG_COOKIE } from "@/lib/ui-language";

function formatPhone(e164: string | undefined): string | null {
  if (!e164) return null;
  const d = e164.replace(/\D/g, "").replace(/^1/, "");
  if (d.length !== 10) return e164;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

const TILES = [
  { key: "health", href: "/topics/health", Icon: HeartIcon, tone: "bg-rose-100 text-rose-700" },
  { key: "food", href: "/topics/food", Icon: BasketIcon, tone: "bg-lime-100 text-lime-800" },
  { key: "money", href: "/topics/money", Icon: CoinsIcon, tone: "bg-amber-100 text-amber-800" },
  { key: "letter", href: "/letter", Icon: CameraIcon, tone: "bg-sky-100 text-sky-800" },
  { key: "disaster", href: "/topics/disaster", Icon: FlameIcon, tone: "bg-orange-100 text-orange-800" },
  { key: "person", href: "/help#person", Icon: PeopleIcon, tone: "bg-violet-100 text-violet-800" },
] as const;

export default async function Home({ searchParams }: PageProps<"/">) {
  const query = (await searchParams).lang;
  const lang = await resolveUiLanguage(query);
  const hasChosen = isLanguageCode((await cookies()).get(UI_LANG_COOKIE)?.value) || isLanguageCode(query);
  if (!hasChosen) return <Welcome suggested={lang} />;

  const t = UI[lang];
  const a = APP[lang];
  const phone = process.env.TWILIO_PHONE_NUMBER;
  const phoneDisplay = formatPhone(phone);
  const evals = await readEvalSummary();

  return (
    <AppShell lang={lang}>
      <div className="flex flex-col gap-7">
        <section className="flex flex-col gap-4">
          <h1 className="text-[28px] font-bold leading-tight tracking-tight">{a.home.greeting}</h1>
          <div className="flex items-center gap-2">
            <Link
              href="/ask"
              className="flex min-h-14 flex-1 items-center rounded-2xl border-2 border-stone-200 bg-white px-4 text-[17px] text-stone-500 shadow-sm active:border-teal-700"
            >
              {a.home.askCta}
            </Link>
            <Link
              href="/ask?mic=1"
              className="flex h-14 flex-col items-center justify-center rounded-2xl bg-teal-700 px-4 text-white shadow-sm active:bg-teal-800"
              aria-label={a.ask.micStart}
            >
              <MicIcon size={24} />
              <span className="text-[11px] font-semibold leading-none">{a.home.talkCta}</span>
            </Link>
          </div>
        </section>

        <section className="flex flex-col gap-3" aria-labelledby="topics-title">
          <h2 id="topics-title" className="text-xl font-bold">
            {a.home.topicsTitle}
          </h2>
          <ul className="grid grid-cols-2 gap-3">
            {TILES.map(({ key, href, Icon, tone }) => (
              <li key={key}>
                <Link
                  href={href}
                  className="flex h-full min-h-[7.5rem] flex-col justify-between gap-3 rounded-3xl border border-stone-200 bg-white p-4 shadow-sm active:scale-[0.98] active:bg-stone-50"
                >
                  <span className={`grid h-12 w-12 place-items-center rounded-2xl ${tone}`}>
                    <Icon size={26} />
                  </span>
                  <span>
                    <span className="block text-[17px] font-bold leading-snug">{a.home.topics[key].title}</span>
                    <span className="block text-[14px] text-stone-500">{a.home.topics[key].sub}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <Link href="/check" className="flex flex-col gap-3 rounded-3xl bg-teal-800 p-5 text-white shadow-md active:bg-teal-900">
          <span className="flex items-center gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-white/15">
              <ChecklistIcon size={26} />
            </span>
            <span className="text-[19px] font-bold leading-snug">{a.home.checkTitle}</span>
          </span>
          <span className="text-[15px] text-teal-50">{a.home.checkBody}</span>
          <span className="flex min-h-12 items-center justify-between rounded-2xl bg-white px-4 font-bold text-teal-900">
            {a.home.checkCta} <ArrowRightIcon />
          </span>
        </Link>

        <MyPlan lang={lang} />

        {phone && (
          <section className="flex flex-col gap-3">
            <h2 className="text-xl font-bold">{a.home.reachTitle}</h2>
            <div className="grid grid-cols-2 gap-3">
              <a href={`tel:${phone}`} className="flex min-h-16 flex-col items-center justify-center rounded-2xl border-2 border-teal-700 bg-white font-bold text-teal-900 active:bg-teal-50">
                <span className="flex items-center gap-2">
                  <PhoneIcon size={20} /> {t.call}
                </span>
                <span className="text-[13px] font-medium text-stone-600">{phoneDisplay}</span>
              </a>
              <a href={`sms:${phone}`} className="flex min-h-16 flex-col items-center justify-center rounded-2xl border-2 border-teal-700 bg-white font-bold text-teal-900 active:bg-teal-50">
                <span className="flex items-center gap-2">
                  <MessageIcon size={20} /> {t.text}
                </span>
                <span className="text-[13px] font-medium text-stone-600">{phoneDisplay}</span>
              </a>
            </div>
          </section>
        )}

        <details className="group rounded-3xl bg-stone-900 text-stone-100">
          <summary className="flex min-h-16 cursor-pointer items-center gap-3 px-5 text-[17px] font-semibold text-white">
            <ShieldIcon size={22} className="text-teal-300" />
            <span className="flex-1">{t.safetyTitle}</span>
            <ArrowRightIcon size={20} className="transition-transform group-open:rotate-90" />
          </summary>
          <ul className="flex flex-col gap-3 px-5 pb-5">
            {t.safetyItems.map((item) => (
              <li key={item} className="flex gap-2.5 text-[15px] leading-relaxed">
                <span aria-hidden className="text-teal-300">✓</span>
                {item}
              </li>
            ))}
            {evals && (
              <li className="border-t border-stone-700 pt-3 font-mono text-sm text-teal-200">
                Safety eval: {evals.passed}/{evals.total} passing
              </li>
            )}
          </ul>
        </details>

        <footer className="flex flex-col gap-2 text-[13px] leading-relaxed text-stone-500">
          <p className="font-semibold text-stone-700">{a.common.emergency}</p>
          <p>{DISCLAIMER[lang].site}</p>
        </footer>
      </div>
    </AppShell>
  );
}
