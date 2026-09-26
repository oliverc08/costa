# Costa

**A universal language layer between people and the benefits system.**

Costa is a free benefits navigator for people who don't speak English fluently. You can call it, text it, or chat on the web in English, Spanish, Mandarin, Tagalog, or Vietnamese. No account, no app. It focuses on Medi-Cal, and also covers CalFresh, WIC, CalEITC (including ITIN filers), and disaster aid for families in California's 16th district (San Mateo and Santa Clara counties).

> Costa uses AI for communication, not authority.

Every benefit fact comes from a verified official source, tagged with its agency, program, topic, URL, and last-verified date. Eligibility screening is deterministic TypeScript, not the model. When Costa doesn't have a verified source, it says so and connects you to a person.

## What it does

| Channel | How |
| --- | --- |
| Web chat | Ask in any language; answers include source links and a next step |
| SMS | Same agent, keyed by a hashed phone number; text a photo of a letter to get it explained |
| Voice | Five-language greeting, speak naturally, hear the answer in your language |
| Letter photo | Reads a benefits letter, finds the deadline and what's being asked, explains it simply |
| Human handoff | With your permission, a local partner organization follows up (New → Assigned → Resolved) |

The Medi-Cal super-flow covers enrolling, renewing, losing coverage (including the 90-day cure period), reporting a move or income change, and confusing notices.

## How it's built

- **Next.js 16** (App Router) on **Vercel**, **AI SDK 7** through **Vercel AI Gateway**
- One agent with four tools: `searchBenefits` (hybrid BM25 + pgvector retrieval over `content/sources`), `screenEligibility` (2026 FPL rules), `findLocalHelp` (curated directory), and `createHumanHandoff`
- **Neon Postgres** with pgvector for sessions, handoffs, and embeddings; an in-memory fallback so it runs with zero setup
- **Twilio** for SMS, MMS, and voice (Whisper transcription, Google neural TTS)
- Safety: SSN, ITIN, and Medi-Cal ID redaction on the client and server; no-source refusal; a reply audit for eligibility claims, immigration-status questions, and invented phone numbers; 30-day data purge
- **Costa Safety Eval**: 150 scenarios (30 intents × 5 languages) scored on source, action, language, hallucination, and escalation

## Run it

```bash
cp .env.example .env.local   # AI Gateway access is the only requirement
npm install
npm run dev                  # http://localhost:3000
npm test                     # unit tests, no keys needed
npm run eval                 # 150-scenario eval, needs AI Gateway
```

See [docs/SETUP.md](docs/SETUP.md) for Vercel, Neon, and Twilio, and [docs/DEMO.md](docs/DEMO.md) for the demo script and user-testing plan.

## Project map

```
app/                 pages (landing, /letter, /partners) and API routes (chat, sms, voice, letter, handoff, cron)
content/sources/     verified source records (edit these, then `npm run kb:build`)
lib/agent/           instructions, Medi-Cal flows, agent runner
lib/knowledge/       knowledge base, lexical + vector search
lib/eligibility/     deterministic screening rules and 2026 limits
lib/safety/          redaction, human-request detection, reply audit
evals/               scenarios and the eval runner
tests/               Vitest unit tests
```

Costa is a student project, not a government agency. It cannot decide eligibility.
