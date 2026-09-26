export type Program = "medi-cal" | "calfresh" | "wic" | "caleitc" | "disaster";

export const PROGRAMS: Program[] = ["medi-cal", "calfresh", "wic", "caleitc", "disaster"];

export interface SourceRecord {
  id: string;
  agency: string;
  program: Program;
  topic: string;
  title: string;
  url: string;
  lastVerified: string;
  nextAction: string;
}

export interface Chunk {
  id: string;
  sourceId: string;
  heading: string;
  text: string;
}

export interface KnowledgeBase {
  sources: SourceRecord[];
  chunks: Chunk[];
}
