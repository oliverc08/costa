"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { AppStrings } from "@/lib/i18n-app";
import { CameraIcon, ChatIcon, ChecklistIcon, HomeIcon, PeopleIcon } from "./Icons";

const ITEMS = [
  { href: "/", key: "home", Icon: HomeIcon },
  { href: "/ask", key: "ask", Icon: ChatIcon },
  { href: "/check", key: "check", Icon: ChecklistIcon },
  { href: "/letter", key: "letter", Icon: CameraIcon },
  { href: "/help", key: "help", Icon: PeopleIcon },
] as const;

export function BottomNav({ labels }: { labels: AppStrings["nav"] }) {
  const pathname = usePathname();
  const active = (href: string) => (href === "/" ? pathname === "/" || pathname.startsWith("/topics") : pathname.startsWith(href));

  return (
    <nav
      aria-label="Costa"
      className="fixed inset-x-0 bottom-0 z-30 border-t border-stone-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {ITEMS.map(({ href, key, Icon }) => {
          const on = active(href);
          return (
            <li key={key}>
              <Link
                href={href}
                aria-current={on ? "page" : undefined}
                className={`flex h-16 flex-col items-center justify-center gap-0.5 text-[12px] font-medium leading-tight ${
                  on ? "text-teal-800" : "text-stone-500 active:text-stone-800"
                }`}
              >
                <span className={`grid h-8 w-14 place-items-center rounded-full ${on ? "bg-teal-100" : ""}`}>
                  <Icon size={22} strokeWidth={on ? 2.4 : 2} />
                </span>
                <span className="max-w-full truncate px-0.5">{labels[key]}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
