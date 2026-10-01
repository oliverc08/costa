/**
 * Optional: embed knowledge chunks into Neon via a local embedding model
 * (Ollama nomic-embed-text or similar). Not required — lexical search works without this.
 */
import "../scripts/load-env";
import { createOpenAI } from "@ai-sdk/openai";
import { embedMany } from "ai";
import { neon } from "@neondatabase/serverless";
import { hasDatabase, hasLocalLlm, localLlmBaseUrl, models } from "../lib/config";
import { chunkEmbeddingText, getKnowledgeBase } from "../lib/knowledge";

async function main() {
  if (!hasLocalLlm()) throw new Error("Set COSTA_LOCAL_LLM_URL (e.g. http://127.0.0.1:11434/v1)");
  if (!hasDatabase()) throw new Error("DATABASE_URL is not set");

  const openai = createOpenAI({
    baseURL: localLlmBaseUrl()!,
    apiKey: process.env.COSTA_LOCAL_LLM_API_KEY ?? "ollama",
    name: "costa-local",
  });
  const kb = getKnowledgeBase();
  const sql = neon(process.env.DATABASE_URL!);
  const { embeddings } = await embedMany({
    model: openai.embedding(models.embedding),
    values: kb.chunks.map(chunkEmbeddingText),
  });

  for (let i = 0; i < kb.chunks.length; i++) {
    const c = kb.chunks[i]!;
    const vector = `[${embeddings[i]!.join(",")}]`;
    await sql`
      INSERT INTO source_chunks (id, source_id, program, embedding)
      VALUES (${c.id}, ${c.sourceId}, ${(await import("../lib/knowledge")).getSource(c.sourceId)!.program}, ${vector}::vector)
      ON CONFLICT (id) DO UPDATE SET embedding = EXCLUDED.embedding`;
  }
  console.log(`Embedded ${kb.chunks.length} chunks with ${models.embedding}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
