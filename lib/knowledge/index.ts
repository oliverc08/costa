import kbJson from "./kb.generated.json";
import type { Chunk, KnowledgeBase, SourceRecord } from "./types";

const kb = kbJson as KnowledgeBase;
const sourcesById = new Map(kb.sources.map((s) => [s.id, s]));

export function getKnowledgeBase(): KnowledgeBase {
  return kb;
}

export function getSource(id: string): SourceRecord | undefined {
  return sourcesById.get(id);
}

export function chunkEmbeddingText(c: Chunk): string {
  const s = sourcesById.get(c.sourceId)!;
  return `${s.title} (${s.program}, ${s.topic}) - ${c.heading}\n${c.text}`;
}

export * from "./types";
