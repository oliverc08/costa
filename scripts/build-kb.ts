import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { PROGRAMS, type Chunk, type KnowledgeBase, type SourceRecord } from "../lib/knowledge/types";

const SOURCES_DIR = path.join(process.cwd(), "content", "sources");
const OUT = path.join(process.cwd(), "lib", "knowledge", "kb.generated.json");
const REQUIRED = ["id", "agency", "program", "topic", "title", "url", "lastVerified", "nextAction"] as const;

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildKnowledgeBase(): KnowledgeBase {
  const sources: SourceRecord[] = [];
  const chunks: Chunk[] = [];

  for (const file of readdirSync(SOURCES_DIR).filter((f) => f.endsWith(".md")).sort()) {
    const { data, content } = matter(readFileSync(path.join(SOURCES_DIR, file), "utf8"));
    for (const key of REQUIRED) {
      if (!data[key]) throw new Error(`${file}: missing frontmatter "${key}"`);
    }
    if (!PROGRAMS.includes(data.program)) throw new Error(`${file}: unknown program "${data.program}"`);
    const lastVerified =
      data.lastVerified instanceof Date ? data.lastVerified.toISOString().slice(0, 10) : String(data.lastVerified);
    const source: SourceRecord = {
      id: String(data.id),
      agency: String(data.agency),
      program: data.program,
      topic: String(data.topic),
      title: String(data.title),
      url: String(data.url),
      lastVerified,
      nextAction: String(data.nextAction),
    };
    if (sources.some((s) => s.id === source.id)) throw new Error(`Duplicate source id ${source.id}`);
    sources.push(source);

    const sections = content.split(/^## /m).slice(1);
    for (const section of sections) {
      const [headingLine, ...rest] = section.split("\n");
      const heading = headingLine.trim();
      const text = rest.join("\n").trim();
      if (!text) continue;
      chunks.push({ id: `${source.id}#${slug(heading)}`, sourceId: source.id, heading, text });
    }
  }

  return { sources, chunks };
}

const kb = buildKnowledgeBase();
writeFileSync(OUT, JSON.stringify(kb, null, 2) + "\n");
console.log(`Knowledge base: ${kb.sources.length} sources, ${kb.chunks.length} chunks -> ${path.relative(process.cwd(), OUT)}`);
