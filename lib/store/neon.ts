import { neon } from "@neondatabase/serverless";
import type {
  Handoff,
  HandoffFilter,
  HandoffStatus,
  NewHandoff,
  PendingReply,
  Session,
  Store,
} from "./types";
import { makeReference } from "./reference";
import type { LanguageCode } from "@/lib/languages";

type Row = Record<string, unknown>;

function iso(v: unknown): string {
  return v instanceof Date ? v.toISOString() : String(v);
}

function toSession(r: Row): Session {
  return {
    id: String(r.id),
    channel: r.channel as Session["channel"],
    language: (r.language as LanguageCode | null) ?? null,
    turns: (r.turns as Session["turns"]) ?? [],
    consentShown: Boolean(r.consent_shown),
    createdAt: iso(r.created_at),
    updatedAt: iso(r.updated_at),
  };
}

function toHandoff(r: Row): Handoff {
  return {
    id: String(r.id),
    reference: String(r.reference),
    status: r.status as HandoffStatus,
    language: r.language as LanguageCode,
    topic: String(r.topic),
    area: String(r.area),
    preferredContact: r.preferred_contact as Handoff["preferredContact"],
    contact: (r.contact as string | null) ?? null,
    summary: String(r.summary),
    channel: r.channel as Handoff["channel"],
    sessionId: (r.session_id as string | null) ?? null,
    assignedTo: (r.assigned_to as string | null) ?? null,
    createdAt: iso(r.created_at),
    updatedAt: iso(r.updated_at),
  };
}

export function createNeonStore(url: string): Store {
  const sql = neon(url);

  return {
    async putPendingReply(key, reply) {
      await sql`
        INSERT INTO pending_replies (key, payload) VALUES (${key}, ${JSON.stringify(reply)}::jsonb)
        ON CONFLICT (key) DO UPDATE SET payload = EXCLUDED.payload, created_at = now()`;
    },

    async takePendingReply(key) {
      const rows = (await sql`DELETE FROM pending_replies WHERE key = ${key} RETURNING payload`) as Row[];
      return rows[0] ? (rows[0].payload as PendingReply) : null;
    },

    async getSession(id) {
      const rows = (await sql`SELECT * FROM sessions WHERE id = ${id}`) as Row[];
      return rows[0] ? toSession(rows[0]) : null;
    },

    async saveSession(s) {
      await sql`
        INSERT INTO sessions (id, channel, language, turns, consent_shown, created_at, updated_at)
        VALUES (${s.id}, ${s.channel}, ${s.language}, ${JSON.stringify(s.turns)}::jsonb,
                ${s.consentShown}, ${s.createdAt}, ${s.updatedAt})
        ON CONFLICT (id) DO UPDATE SET
          language = EXCLUDED.language,
          turns = EXCLUDED.turns,
          consent_shown = EXCLUDED.consent_shown,
          updated_at = EXCLUDED.updated_at`;
    },

    async createHandoff(input: NewHandoff) {
      const rows = (await sql`
        INSERT INTO handoffs (id, reference, language, topic, area, preferred_contact,
                              contact, summary, channel, session_id)
        VALUES (${crypto.randomUUID()}, ${makeReference()}, ${input.language}, ${input.topic},
                ${input.area}, ${input.preferredContact}, ${input.contact}, ${input.summary},
                ${input.channel}, ${input.sessionId})
        RETURNING *`) as Row[];
      return toHandoff(rows[0]);
    },

    async listHandoffs(filter: HandoffFilter = {}) {
      const rows = (await sql`
        SELECT * FROM handoffs
        WHERE (${filter.status ?? null}::text IS NULL OR status = ${filter.status ?? null})
          AND (${filter.language ?? null}::text IS NULL OR language = ${filter.language ?? null})
          AND (${filter.topic ?? null}::text IS NULL OR topic = ${filter.topic ?? null})
        ORDER BY created_at DESC
        LIMIT 500`) as Row[];
      return rows.map(toHandoff);
    },

    async getHandoff(id) {
      if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
      const rows = (await sql`SELECT * FROM handoffs WHERE id = ${id}`) as Row[];
      return rows[0] ? toHandoff(rows[0]) : null;
    },

    async updateHandoff(id, patch) {
      const rows = (await sql`
        UPDATE handoffs SET
          status = COALESCE(${patch.status ?? null}, status),
          assigned_to = CASE WHEN ${patch.assignedTo !== undefined} THEN ${patch.assignedTo ?? null} ELSE assigned_to END,
          updated_at = now()
        WHERE id = ${id}
        RETURNING *`) as Row[];
      return rows[0] ? toHandoff(rows[0]) : null;
    },

    async purgeOlderThan(days) {
      const s = (await sql`
        DELETE FROM sessions WHERE updated_at < now() - make_interval(days => ${days})
        RETURNING id`) as Row[];
      const h = (await sql`
        DELETE FROM handoffs
        WHERE status = 'resolved' AND updated_at < now() - make_interval(days => ${days})
        RETURNING id`) as Row[];
      await sql`DELETE FROM pending_replies WHERE created_at < now() - interval '1 hour'`;
      return { sessions: s.length, handoffs: h.length };
    },
  };
}
