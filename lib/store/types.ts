import type { LanguageCode } from "@/lib/languages";

export type Channel = "web" | "sms" | "voice" | "letter";

export interface StoredTurn {
  role: "user" | "assistant";
  content: string;
  at: string;
}

export interface Session {
  id: string;
  channel: Channel;
  language: LanguageCode | null;
  turns: StoredTurn[];
  consentShown: boolean;
  createdAt: string;
  updatedAt: string;
}

export type HandoffStatus = "new" | "assigned" | "resolved";

export type PreferredContact = "sms" | "call" | "email" | "in-person";

export interface Handoff {
  id: string;
  reference: string;
  status: HandoffStatus;
  language: LanguageCode;
  topic: string;
  area: string;
  preferredContact: PreferredContact;
  contact: string | null;
  summary: string;
  channel: Channel;
  sessionId: string | null;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
}

export type NewHandoff = Omit<
  Handoff,
  "id" | "reference" | "status" | "assignedTo" | "createdAt" | "updatedAt"
>;

export interface HandoffFilter {
  status?: HandoffStatus;
  language?: LanguageCode;
  topic?: string;
}

/** A voice reply computed in the background, picked up by the next Twilio request. */
export interface PendingReply {
  text: string;
  language: LanguageCode;
  endCall?: boolean;
}

export interface Store {
  putPendingReply(key: string, reply: PendingReply): Promise<void>;
  takePendingReply(key: string): Promise<PendingReply | null>;
  getSession(id: string): Promise<Session | null>;
  saveSession(session: Session): Promise<void>;
  createHandoff(input: NewHandoff): Promise<Handoff>;
  listHandoffs(filter?: HandoffFilter): Promise<Handoff[]>;
  updateHandoff(
    id: string,
    patch: { status?: HandoffStatus; assignedTo?: string | null },
  ): Promise<Handoff | null>;
  purgeOlderThan(days: number): Promise<{ sessions: number; handoffs: number }>;
}
