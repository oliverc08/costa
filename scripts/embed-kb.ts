import "./load-env";
import { createHash } from "node:crypto";
import { embedMany } from "ai";
import { neon } from "@neondatabase/serverless";
import { models, hasAiGateway } from "../lib/config";
import { chunkEmbeddingText, getKnowledgeBase } from "../lib/knowledge";

async function main() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is not set");
  if (!hasAiGateway()) throw new Error("AI_GATEWAY_API_KEY is not set");
  const sql = neon(process.env.DATABASE_URL);
  const kb = getKnowledgeBase();

  const existing = new Map(
    ((await sql`SELECT id, content_hash FROM source_chunks`) as { id: string; content_hash: string }[]).map(
      (r) => [r.id, r.content_hash],
    ),
  );

  const todo = kb.chunks
    .map((c) => {
      const text = chunkEmbeddingText(c);
      return { chunk: c, text, hash: createHash("sha256").update(text).digest("hex") };
    })
    .filter((x) => existing.get(x.chunk.id) !== x.hash);

  if (todo.length) {
    const { embeddings } = await embedMany({
      model: models.embedding,
      values: todo.map((x) => x.text),
      maxParallelCalls: 4,
    });
    for (let i = 0; i < todo.length; i++) {
      const { chunk, hash } = todo[i];
      const source = kb.sources.find((s) => s.id === chunk.sourceId)!;
      const vector = `[${embeddings[i].join(",")}]`;
      await sql`
        INSERT INTO source_chunks (id, source_id, program, content_hash, embedding)
        VALUES (${chunk.id}, ${chunk.sourceId}, ${source.program}, ${hash}, ${vector}::vector)
        ON CONFLICT (id) DO UPDATE SET
          source_id = EXCLUDED.source_id, program = EXCLUDED.program,
          content_hash = EXCLUDED.content_hash, embedding = EXCLUDED.embedding`;
    }
  }

  const liveIds = kb.chunks.map((c) => c.id);
  const removed = (await sql`DELETE FROM source_chunks WHERE NOT (id = ANY(${liveIds})) RETURNING id`) as unknown[];

  console.log(
    `Embedded ${todo.length} changed chunks, ${kb.chunks.length - todo.length} unchanged, removed ${removed.length} stale.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
