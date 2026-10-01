import { Fragment } from "react";

const TOKEN =
  /(https?:\/\/[^\s)]+|\b(?:[a-z0-9-]+\.)+(?:gov|com|org)(?:\/[^\s),.]*)?\b|(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b|\b(?:211|911)\b)/gi;

function hrefFor(token: string): string {
  if (/^https?:\/\//i.test(token)) return token;
  if (/^[\d(+]/.test(token)) return `tel:${token.replace(/[^\d+]/g, "")}`;
  return `https://${token.toLowerCase()}`;
}

function Line({ text }: { text: string }) {
  const parts = text.split(TOKEN);
  return (
    <>
      {parts.map((p, i) => {
        if (i % 2 === 0) return <Fragment key={i}>{p}</Fragment>;
        const href = hrefFor(p);
        const tel = href.startsWith("tel:");
        return (
          <a
            key={i}
            href={href}
            {...(tel ? {} : { target: "_blank", rel: "noreferrer" })}
            className={`font-semibold underline decoration-2 underline-offset-2 ${tel ? "whitespace-nowrap text-pine-800" : "break-words text-pine-800"}`}
          >
            {p}
          </a>
        );
      })}
    </>
  );
}

/**
 * Renders Costa's plain-text answers: paragraphs, "1." / "-" lists, and tappable
 * phone numbers and websites.
 */
export function RichText({ text, className = "" }: { text: string; className?: string }) {
  const blocks = text.trim().split(/\n{2,}/);
  return (
    <div className={`flex flex-col gap-3 leading-relaxed ${className}`}>
      {blocks.map((block, bi) => {
        const lines = block.split("\n");
        const isItem = (l: string) => /^\s*(\d+\.|[-•*])\s+/.test(l);
        if (lines.length > 1 ? lines.slice(1).every(isItem) : isItem(lines[0])) {
          const lead = isItem(lines[0]) ? null : lines[0];
          const rest = lead === null ? lines : lines.slice(1);
          const ordered = /^\s*\d+\./.test(rest[0] ?? "");
          const items = rest.map((l) => l.replace(/^\s*(\d+\.|[-•*])\s+/, ""));
          return (
            <div key={bi} className="flex flex-col gap-2">
              {lead && (
                <p>
                  <Line text={lead} />
                </p>
              )}
              <ul className="flex flex-col gap-2">
                {items.map((item, ii) => (
                  <li key={ii} className="flex gap-2.5">
                    {ordered ? (
                      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-pine-800 text-[13px] font-bold text-white">{ii + 1}</span>
                    ) : (
                      <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-pine-800" aria-hidden />
                    )}
                    <span>
                      <Line text={item} />
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        }
        return (
          <p key={bi}>
            {lines.map((l, li) => (
              <Fragment key={li}>
                {li > 0 && <br />}
                <Line text={l} />
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
