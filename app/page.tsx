import Link from "next/link";
import { cookies } from "next/headers";
import { AppShell } from "@/components/app/AppShell";
import {
  ArrowRightIcon,
  BasketIcon,
  CameraIcon,
  CheckIcon,
  CoinsIcon,
  FlameIcon,
  HeartIcon,
  MessageIcon,
  MicIcon,
  PeopleIcon,
  PhoneIcon,
} from "@/components/app/Icons";
import { MyPlan } from "@/components/app/MyPlan";
import { Welcome } from "@/components/app/Welcome";
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

const TOPICS = [
  { key: "health", href: "/topics/health", Icon: HeartIcon },
  { key: "food", href: "/topics/food", Icon: BasketIcon },
  { key: "money", href: "/topics/money", Icon: CoinsIcon },
  { key: "letter", href: "/letter", Icon: CameraIcon },
  { key: "disaster", href: "/topics/disaster", Icon: FlameIcon },
  { key: "person", href: "/help#person", Icon: PeopleIcon },
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

  return (
    <AppShell lang={lang}>
      <div className="flex flex-col gap-9">
        <section className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-[30px] leading-[1.15] text-pine-950">{a.home.greeting}</h1>
            <p className="text-[16px] leading-relaxed text-stone-600">{a.home.intro}</p>
          </div>
          <div className="flex items-stretch gap-2">
            <Link
              href="/ask"
              className="flex min-h-14 flex-1 items-center rounded-md border border-stone-400 bg-white px-4 text-[17px] text-stone-500 active:border-pine-700"
            >
              {a.home.askCta}
            </Link>
            <Link
              href="/ask?mic=1"
              className="flex min-w-16 flex-col items-center justify-center gap-0.5 rounded-md bg-pine-800 px-3 text-white active:bg-pine-900"
              aria-label={a.ask.micStart}
            >
              <MicIcon size={22} />
              <span className="text-[12px] font-semibold leading-none">{a.home.talkCta}</span>
            </Link>
          </div>
        </section>

        <section className="flex flex-col gap-2" aria-labelledby="topics-title">
          <h2 id="topics-title" className="text-[21px] text-pine-950">
            {a.home.topicsTitle}
          </h2>
          <ul className="divide-y divide-stone-300 border-y border-stone-300">
            {TOPICS.map(({ key, href, Icon }) => (
              <li key={key}>
                <Link href={href} className="-mx-2 flex min-h-[4.25rem] items-center gap-4 px-2 active:bg-stone-200/50">
                  <Icon size={26} strokeWidth={1.8} className="shrink-0 text-pine-800" />
                  <span className="min-w-0 flex-1 py-2">
                    <span className="block text-[18px] font-semibold leading-snug">{a.home.topics[key].title}</span>
                    <span className="block text-[14px] text-stone-500">{a.home.topics[key].sub}</span>
                  </span>
                  <ArrowRightIcon size={20} className="shrink-0 text-stone-400" />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex flex-col gap-3 border-l-4 border-poppy-500 bg-white py-5 pl-4 pr-5">
          <h2 className="text-[21px] leading-snug text-pine-950">{a.home.checkTitle}</h2>
          <p className="text-[15px] leading-relaxed text-stone-600">{a.home.checkBody}</p>
          <Link
            href="/check"
            className="flex min-h-13 items-center justify-center gap-2 self-start rounded-md bg-pine-800 px-5 py-3 text-[17px] font-semibold text-white active:bg-pine-900"
          >
            {a.home.checkCta} <ArrowRightIcon size={20} />
          </Link>
        </section>

        <MyPlan lang={lang} />

        {phone && (
          <section className="flex flex-col gap-3">
            <h2 className="text-[21px] text-pine-950">{a.home.reachTitle}</h2>
            <div className="grid grid-cols-2 gap-2">
              <a href={`tel:${phone}`} className="flex min-h-16 flex-col items-center justify-center rounded-md border border-pine-800 bg-white font-semibold text-pine-900 active:bg-pine-50">
                <span className="flex items-center gap-2">
                  <PhoneIcon size={20} /> {t.call}
                </span>
                <span className="text-[13px] font-normal text-stone-600">{phoneDisplay}</span>
              </a>
              <a href={`sms:${phone}`} className="flex min-h-16 flex-col items-center justify-center rounded-md border border-pine-800 bg-white font-semibold text-pine-900 active:bg-pine-50">
                <span className="flex items-center gap-2">
                  <MessageIcon size={20} /> {t.text}
                </span>
                <span className="text-[13px] font-normal text-stone-600">{phoneDisplay}</span>
              </a>
            </div>
          </section>
        )}

        <details className="group border-y border-stone-300">
          <summary className="flex min-h-14 cursor-pointer items-center gap-3 text-[17px] font-semibold text-pine-950">
            <span className="flex-1">{t.safetyTitle}</span>
            <ArrowRightIcon size={20} className="text-stone-400 transition-transform group-open:rotate-90" />
          </summary>
          <ul className="flex flex-col gap-2.5 pb-5">
            {t.safetyItems.map((item) => (
              <li key={item} className="flex gap-2.5 text-[15px] leading-relaxed text-stone-700">
                <CheckIcon size={18} strokeWidth={2.5} className="mt-0.5 shrink-0 text-pine-700" />
                {item}
              </li>
            ))}
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
