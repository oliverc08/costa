"use client";

import { useRouter, usePathname } from "next/navigation";
import { LANGUAGES, LANGUAGE_CODES, type LanguageCode } from "@/lib/languages";

export function LanguagePicker({ current }: { current: LanguageCode }) {
  const router = useRouter();
  const pathname = usePathname();

  function choose(code: LanguageCode) {
    document.cookie = `costa_lang=${code}; path=/; max-age=31536000; samesite=lax`;
    router.replace(`${pathname}?lang=${code}`);
  }

  return (
    <nav aria-label="Language" className="flex flex-wrap gap-1.5">
      {LANGUAGE_CODES.map((code) => (
        <button
          key={code}
          type="button"
          lang={code}
          onClick={() => choose(code)}
          aria-pressed={code === current}
          className={
            code === current
              ? "rounded-full bg-stone-900 px-3 py-1.5 text-sm font-medium text-white"
              : "rounded-full px-3 py-1.5 text-sm text-stone-700 hover:bg-stone-200"
          }
        >
          {LANGUAGES[code].native}
        </button>
      ))}
    </nav>
  );
}
