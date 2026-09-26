import { tool } from "ai";
import { z } from "zod";
import { PROGRAMS } from "@/lib/knowledge/types";
import { searchBenefits } from "@/lib/knowledge/search";
import { screenEligibility, eligibilityInputSchema } from "@/lib/eligibility";
import { findLocalHelp, findLocalHelpInputSchema } from "@/lib/local-help";
import { createHandoff, handoffInputSchema } from "@/lib/handoff";
import type { Channel } from "@/lib/store/types";

export interface ToolContext {
  channel: Channel;
  sessionId: string | null;
  /** Phone number already known from SMS/voice, used only for consented handoffs. */
  contact: string | null;
}

const programSchema = z.enum(PROGRAMS as [string, ...string[]]);

export function createTools(ctx: ToolContext) {
  return {
    searchBenefits: tool({
      description:
        "Search Costa's verified official sources (DHCS, CDSS, CDPH WIC, FTB, FEMA). Call before stating ANY benefit fact. Query in English.",
      inputSchema: z.object({
        query: z.string().min(2).describe("The user's question, rewritten in English with key terms."),
        program: programSchema
          .optional()
          .describe("medi-cal, calfresh, wic, caleitc, or disaster, if known."),
      }),
      execute: async ({ query, program }) =>
        searchBenefits({ query, program: program as (typeof PROGRAMS)[number] | undefined }),
    }),

    screenEligibility: tool({
      description:
        "Deterministic income screen using published 2026 limits. Returns likely / possibly / unlikely / need-more-info with reasons. It is NOT an eligibility decision; only the agency decides.",
      inputSchema: eligibilityInputSchema,
      execute: async (input) => screenEligibility(input),
    }),

    findLocalHelp: tool({
      description:
        "Find real offices, hotlines, and community organizations that can help in person or by phone, filtered by area, language, and program.",
      inputSchema: findLocalHelpInputSchema,
      execute: async (input) => findLocalHelp(input),
    }),

    createHumanHandoff: tool({
      description:
        "Send the user's request to a local benefits helper who will contact them. ONLY call after the user explicitly agreed. Never include SSNs, ID numbers, or immigration status in the summary.",
      inputSchema: handoffInputSchema,
      execute: async (input) =>
        createHandoff(input, { channel: ctx.channel, sessionId: ctx.sessionId, knownContact: ctx.contact }),
    }),
  };
}

export type CostaTools = ReturnType<typeof createTools>;
