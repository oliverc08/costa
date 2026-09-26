import { readFile } from "node:fs/promises";
import path from "node:path";

export interface EvalSummary {
  passed: number;
  total: number;
  ranAt: string;
  model: string;
  byCriterion: Record<string, { passed: number; total: number }>;
}

export const EVAL_SUMMARY_PATH = path.join(process.cwd(), "public", "eval-results.json");

export async function readEvalSummary(): Promise<EvalSummary | null> {
  try {
    return JSON.parse(await readFile(EVAL_SUMMARY_PATH, "utf8")) as EvalSummary;
  } catch {
    return null;
  }
}
