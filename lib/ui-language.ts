import { headers, cookies } from "next/headers";
import { isLanguageCode, normalizeLanguage, type LanguageCode } from "@/lib/languages";

export const UI_LANG_COOKIE = "costa_lang";

/** Picks the UI language from ?lang=, the saved cookie, then Accept-Language. */
export async function resolveUiLanguage(searchLang?: string | string[]): Promise<LanguageCode> {
  const fromQuery = Array.isArray(searchLang) ? searchLang[0] : searchLang;
  if (isLanguageCode(fromQuery)) return fromQuery;
  const saved = (await cookies()).get(UI_LANG_COOKIE)?.value;
  if (isLanguageCode(saved)) return saved;
  const accept = (await headers()).get("accept-language") ?? "";
  for (const entry of accept.split(",")) {
    const code = normalizeLanguage(entry.split(";")[0]);
    if (code) return code;
  }
  return "en";
}
