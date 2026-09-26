import type { Chunk, SourceRecord } from "./types";

const STOPWORDS = new Set(
  "a an and are as at be but by can do does for from get got have how i if in is it its me my of on or our so that the their them there they this to was we what when where which who why will with you your am im i'm want need please about tell know".split(
    " ",
  ),
);

/** Everyday phrasing mapped onto the vocabulary the official sources use. */
const SYNONYMS: Record<string, string[]> = {
  medicaid: ["medi-cal"],
  insurance: ["medi-cal", "coverage", "health"],
  health: ["medi-cal", "coverage"],
  doctor: ["medi-cal", "health"],
  renew: ["renewal"],
  renewing: ["renewal"],
  redetermination: ["renewal"],
  yellow: ["renewal", "envelope"],
  packet: ["renewal", "form"],
  cut: ["ended", "end"],
  stopped: ["ended", "end"],
  cancelled: ["ended", "end", "discontinued"],
  canceled: ["ended", "end", "discontinued"],
  terminated: ["ended", "discontinued"],
  lost: ["ended", "loss"],
  lose: ["ended", "loss"],
  denied: ["denying", "hearing", "disagree"],
  appeal: ["hearing", "disagree"],
  unfair: ["hearing", "disagree"],
  moved: ["move", "address"],
  moving: ["move", "address"],
  raise: ["income"],
  job: ["income", "work"],
  salary: ["income"],
  wages: ["income", "earned"],
  pay: ["income"],
  letter: ["notice", "letters"],
  notice: ["letter", "letters"],
  mail: ["letter", "notice"],
  food: ["calfresh", "ebt"],
  stamps: ["calfresh"],
  snap: ["calfresh"],
  ebt: ["calfresh"],
  groceries: ["calfresh", "food"],
  hungry: ["calfresh", "food"],
  baby: ["wic", "infant", "pregnant"],
  pregnant: ["pregnancy", "wic"],
  pregnancy: ["pregnant"],
  formula: ["wic", "infant"],
  breastfeeding: ["wic"],
  taxes: ["tax", "caleitc"],
  tax: ["caleitc", "credit"],
  refund: ["caleitc", "cash", "credit"],
  eitc: ["caleitc"],
  itin: ["caleitc", "itin"],
  fire: ["disaster", "fema"],
  flood: ["disaster", "fema"],
  earthquake: ["disaster", "fema"],
  storm: ["disaster", "fema"],
  outage: ["disaster", "power"],
  undocumented: ["immigration", "status"],
  immigrant: ["immigration", "status"],
  papers: ["immigration", "status"],
  green: ["immigration"],
  dental: ["dental"],
  dentist: ["dental"],
  work: ["work", "requirements"],
  apply: ["apply", "application"],
  application: ["apply"],
  sign: ["apply", "enroll"],
  enroll: ["apply", "enroll"],
  qualify: ["eligibility", "limits", "income"],
  eligible: ["eligibility", "limits", "income"],
};

export function stem(w: string): string {
  if (w.length > 5 && w.endsWith("ies")) return w.slice(0, -3) + "y";
  if (w.length > 5 && w.endsWith("ing")) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith("ed")) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1);
  return w;
}

export function tokenize(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9][a-z0-9-]*/g) ?? [])
    .filter((w) => !STOPWORDS.has(w))
    .map(stem);
}

export function expandQuery(query: string): string[] {
  const base = (query.toLowerCase().match(/[a-z0-9][a-z0-9-]*/g) ?? []).filter((w) => !STOPWORDS.has(w));
  const out = new Set<string>();
  for (const w of base) {
    out.add(stem(w));
    for (const syn of SYNONYMS[w] ?? []) out.add(stem(syn));
  }
  return [...out];
}

interface Doc {
  chunk: Chunk;
  source: SourceRecord;
  tf: Map<string, number>;
  len: number;
}

export class LexicalIndex {
  private docs: Doc[];
  private df = new Map<string, number>();
  private avgLen: number;

  constructor(chunks: Chunk[], sources: Map<string, SourceRecord>) {
    this.docs = chunks.map((chunk) => {
      const source = sources.get(chunk.sourceId)!;
      const tokens = tokenize(
        `${source.title} ${source.program} ${source.topic} ${chunk.heading} ${chunk.heading} ${chunk.text}`,
      );
      const tf = new Map<string, number>();
      for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1);
      return { chunk, source, tf, len: tokens.length };
    });
    for (const d of this.docs) for (const t of d.tf.keys()) this.df.set(t, (this.df.get(t) ?? 0) + 1);
    this.avgLen = this.docs.reduce((a, d) => a + d.len, 0) / Math.max(1, this.docs.length);
  }

  /** BM25 ranking plus the share of the original query terms each chunk covers. */
  search(query: string, filter?: (s: SourceRecord) => boolean) {
    const originalTerms = [...new Set(tokenize(query))];
    const terms = expandQuery(query);
    const N = this.docs.length;
    const k1 = 1.4;
    const b = 0.75;
    return this.docs
      .filter((d) => !filter || filter(d.source))
      .map((d) => {
        let score = 0;
        for (const t of terms) {
          const f = d.tf.get(t);
          if (!f) continue;
          const df = this.df.get(t) ?? 0;
          const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
          score += idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * d.len) / this.avgLen)));
        }
        const covered = originalTerms.filter(
          (t) => d.tf.has(t) || (SYNONYMS[t] ?? []).some((s) => d.tf.has(stem(s))),
        ).length;
        const coverage = originalTerms.length ? covered / originalTerms.length : 0;
        return { chunk: d.chunk, source: d.source, score, coverage };
      })
      .filter((r) => r.score > 0)
      .sort((a, b2) => b2.score - a.score);
  }
}
