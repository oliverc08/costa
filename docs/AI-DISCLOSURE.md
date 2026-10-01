# AI use & third-party tools (Congressional App Challenge disclosure)

The 2026 Congressional App Challenge rules require full disclosure of AI usage and clear documentation of open-source libraries and external tools. Costa was built by students; AI assisted some coding and is also a **runtime** part of the product for language understanding — never for deciding eligibility.

## 1. Runtime AI in the product (what users experience)

| Capability | When it runs | What it does | What it does **not** do |
| --- | --- | --- | --- |
| FAQ matcher | Always, before the model | Maps free text to pre-written multilingual answers | Does not invent benefits facts |
| Chat agent | Only if AI Gateway has credentials **and** no FAQ match | Answers open questions using verified-source search tools | Does not decide eligibility; audited for unsafe claims |
| Letter vision | Cloud path when Gateway works | Reads a letter photo | Photo is not permanently stored |
| On-device OCR | When Gateway returns 503 | Tesseract.js reads the image on the phone; heuristics explain it | Best with a clear photo (not PDF) |
| Whisper / TTS | Voice fallback & read-aloud | Speech in / speech out | Optional; browser speech preferred |
| Eligibility checkup | Always local TypeScript | Deterministic FPL / program rules | AI never runs this math |

**Design principle:** *AI for communication, not authority.* Every benefit fact Costa asserts must come from `content/sources/` (agency, URL, last-verified date).

## 2. AI tools used while building Costa

AI coding assistants (including Cursor) were used to:

- Scaffold UI components and API routes faster
- Draft multilingual FAQ copy for review
- Suggest tests and refactors

Students directed architecture, product decisions, safety rules, source curation, and demo design. AI did **not** write the entire app unattended. Significant student work includes: knowledge-base schema and sources, deterministic eligibility engine, FAQ bank + fuzzy matcher, handoff workflow, letter heuristics, eval scenarios, and multilingual UX.

Disclose this section on the CAC application when asked about AI use.

## 3. Open-source libraries & platforms (not student-written)

| Tool | Role |
| --- | --- |
| Next.js, React, TypeScript | Web app framework |
| Tailwind CSS | Styling |
| Vercel AI SDK (`ai`, `@ai-sdk/react`) | Chat streaming & tool calling |
| Vercel AI Gateway | Model routing (chat, vision, Whisper, embeddings) |
| Zod | Request validation |
| Twilio | SMS / MMS / voice (optional for demo) |
| Neon Postgres + pgvector | Sessions, handoffs, embeddings (optional; in-memory fallback exists) |
| Tesseract.js | On-device OCR fallback for letters |
| `@huggingface/transformers` | Optional on-device Whisper |
| Vitest | Unit tests |
| gray-matter | Source markdown front matter |

Full versions are in `package.json` / `package-lock.json`.

## 4. Data Costa does **not** collect for judging demos

- No immigration-status questions
- Client + server redaction of SSN / ITIN / Medi-Cal ID patterns
- Checkup answers and My Plan stay in `localStorage` on the device
- Server chats are purged after 30 days (`/api/cron/purge`)

## 5. How judges can verify coding excellence without a long live call

1. Visit https://costa-five.vercel.app — pick Spanish or Vietnamese, use Ask FAQ chips or paraphrase a common question.
2. Open `/how` for the architecture walkthrough written for judges.
3. Open this file + `content/sources/` to see verified facts.
4. Run `npm test` (no API keys) and, with Gateway credentials, `npm run eval` for the 150-scenario safety suite.
