/** Privacy-light product analytics — no message bodies, no PII. */

type EventName =
  | "language_chosen"
  | "ask_chip"
  | "ask_freetext"
  | "letter_ok"
  | "letter_fail"
  | "checkup_done"
  | "handoff_sent"
  | "help_search";

export function track(name: EventName, props?: Record<string, string | number | boolean>) {
  try {
    // Vercel Analytics custom events when available
    void import("@vercel/analytics").then(({ track: va }) => {
      va(name, props);
    });
  } catch {
    // ignore
  }
  if (process.env.NODE_ENV === "development") {
    console.debug("[analytics]", name, props ?? {});
  }
}
