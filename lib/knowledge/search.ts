import { cosineSimilarity, embed, embedMany } from "ai";
import { neon } from "@neondatabase/serverless";
import { hasAiGateway, hasDatabase, models } from "@/lib/config";
import { chunkEmbeddingText, getKnowledgeBase } from "./index";
import { LexicalIndex } from "./lexical";
import type { Program, SourceRecord } from "./types";

export interface SearchHit {
  chunkId: string;
  sourceId: string;
  title: string;
  agency: string;
  program: Program;
  topic: string;
  url: string;
  lastVerified: string;
  nextAction: string;
  heading: string;
  excerpt: string;
}

export interface SearchResponse {
  found: boolean;
  method: "hybrid" | "lexical";
  results: SearchHit[];
  guidance: string;
}

const LEXICAL_COVERAGE_MIN = 0.5;
const VECTOR_SIMILARITY_MIN = 0.42;
const RESULT_LIMIT = 4;

const kb = getKnowledgeBase();
const sourceMap = new Map(kb.sources.map((s) => [s.id, s]));
const lexical = new LexicalIndex(kb.chunks, sourceMap);

let memoryEmbeddings: Promise<number[][]> | null = null;

async function vectorScores(query: string, program?: Program): Promise<Map<string, number> | null> {
  if (!hasAiGateway()) return null;
  try {
    const { embedding } = await embed({ model: models.embedding, value: query });
    const scores = new Map<string, number>();

    if (hasDatabase()) {
      const sql = neon(process.env.DATABASE_URL!);
      const vector = `[${embedding.join(",")}]`;
      const rows = (await sql`
        SELECT id, 1 - (embedding <=> ${vector}::vector) AS similarity
        FROM source_chunks
        WHERE ${program ?? null}::text IS NULL OR program = ${program ?? null}
        ORDER BY embedding <=> ${vector}::vector
        LIMIT 12`) as { id: string; similarity: number }[];
      if (rows.length > 0) {
        for (const r of rows) scores.set(r.id, Number(r.similarity));
        return scores;
      }
    }

    memoryEmbeddings ??= embedMany({
      model: models.embedding,
      values: kb.chunks.map(chunkEmbeddingText),
    }).then((r) => r.embeddings);
    const all = await memoryEmbeddings;
    kb.chunks.forEach((c, i) => {
      if (program && sourceMap.get(c.sourceId)!.program !== program) return;
      scores.set(c.id, cosineSimilarity(embedding, all[i]));
    });
    return scores;
  } catch (err) {
    memoryEmbeddings = null;
    console.warn("[search] vector search unavailable, using lexical only", err);
    return null;
  }
}

function toHit(chunkId: string): SearchHit {
  const chunk = kb.chunks.find((c) => c.id === chunkId)!;
  const s = sourceMap.get(chunk.sourceId) as SourceRecord;
  return {
    chunkId,
    sourceId: s.id,
    title: s.title,
    agency: s.agency,
    program: s.program,
    topic: s.topic,
    url: s.url,
    lastVerified: s.lastVerified,
    nextAction: s.nextAction,
    heading: chunk.heading,
    excerpt: chunk.text,
  };
}

async function searchOnce(query: string, program?: Program) {
  const filter = program ? (s: SourceRecord) => s.program === program : undefined;
  const lex = lexical.search(query, filter);
  const vec = await vectorScores(query, program);

  const fused = new Map<string, number>();
  lex.slice(0, 12).forEach((r, rank) => fused.set(r.chunk.id, (fused.get(r.chunk.id) ?? 0) + 1 / (60 + rank)));
  const vecRanked = vec ? [...vec.entries()].sort((a, b) => b[1] - a[1]) : [];
  vecRanked.slice(0, 12).forEach(([id], rank) => fused.set(id, (fused.get(id) ?? 0) + 1 / (60 + rank)));

  const coverageById = new Map(lex.map((r) => [r.chunk.id, r.coverage]));
  const topCoverage = lex[0]?.coverage ?? 0;
  const topSimilarity = vecRanked[0]?.[1] ?? 0;
  const found = topCoverage >= LEXICAL_COVERAGE_MIN || topSimilarity >= VECTOR_SIMILARITY_MIN;

  const results = [...fused.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id]) => id)
    .filter((id) => (coverageById.get(id) ?? 0) >= 0.34 || (vec?.get(id) ?? 0) >= VECTOR_SIMILARITY_MIN - 0.07)
    .slice(0, RESULT_LIMIT)
    .map(toHit);

  return { found: found && results.length > 0, results, method: vec ? ("hybrid" as const) : ("lexical" as const) };
}

export async function searchBenefits(input: { query: string; program?: Program }): Promise<SearchResponse> {
  let r = await searchOnce(input.query, input.program);
  if (!r.found && input.program) r = await searchOnce(input.query);

  return {
    ...r,
    guidance: r.found
      ? "Answer ONLY with facts from these excerpts. Translate into the user's language. End with the nextAction and cite the agency and url."
      : "NO VERIFIED SOURCE matched. Do not answer from memory. Tell the user you don't have verified information on this, and offer findLocalHelp or a human (createHumanHandoff).",
  };
}
