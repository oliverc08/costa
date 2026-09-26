import type { Handoff, HandoffFilter, NewHandoff, PendingReply, Session, Store } from "./types";
import { makeReference } from "./reference";

interface MemoryData {
  sessions: Map<string, Session>;
  handoffs: Map<string, Handoff>;
  pending: Map<string, PendingReply>;
}

const globalKey = "__costaMemoryStore" as const;

function data(): MemoryData {
  const g = globalThis as unknown as Record<string, MemoryData | undefined>;
  if (!g[globalKey]) {
    g[globalKey] = { sessions: new Map(), handoffs: new Map(), pending: new Map() };
  }
  return g[globalKey]!;
}

export function createMemoryStore(): Store {
  return {
    async putPendingReply(key, reply) {
      data().pending.set(key, reply);
    },
    async takePendingReply(key) {
      const r = data().pending.get(key) ?? null;
      data().pending.delete(key);
      return r;
    },
    async getSession(id) {
      const s = data().sessions.get(id);
      return s ? structuredClone(s) : null;
    },
    async saveSession(session) {
      data().sessions.set(session.id, structuredClone(session));
    },
    async createHandoff(input: NewHandoff) {
      const now = new Date().toISOString();
      const handoff: Handoff = {
        ...input,
        id: crypto.randomUUID(),
        reference: makeReference(),
        status: "new",
        assignedTo: null,
        createdAt: now,
        updatedAt: now,
      };
      data().handoffs.set(handoff.id, handoff);
      return structuredClone(handoff);
    },
    async listHandoffs(filter: HandoffFilter = {}) {
      return [...data().handoffs.values()]
        .filter((h) => !filter.status || h.status === filter.status)
        .filter((h) => !filter.language || h.language === filter.language)
        .filter((h) => !filter.topic || h.topic === filter.topic)
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .map((h) => structuredClone(h));
    },
    async updateHandoff(id, patch) {
      const h = data().handoffs.get(id);
      if (!h) return null;
      const next: Handoff = {
        ...h,
        ...(patch.status ? { status: patch.status } : {}),
        ...(patch.assignedTo !== undefined ? { assignedTo: patch.assignedTo } : {}),
        updatedAt: new Date().toISOString(),
      };
      data().handoffs.set(id, next);
      return structuredClone(next);
    },
    async purgeOlderThan(days) {
      const cutoff = Date.now() - days * 86_400_000;
      let sessions = 0;
      let handoffs = 0;
      for (const [id, s] of data().sessions) {
        if (Date.parse(s.updatedAt) < cutoff) {
          data().sessions.delete(id);
          sessions++;
        }
      }
      for (const [id, h] of data().handoffs) {
        if (h.status === "resolved" && Date.parse(h.updatedAt) < cutoff) {
          data().handoffs.delete(id);
          handoffs++;
        }
      }
      return { sessions, handoffs };
    },
  };
}
