# AI use & third-party tools (Congressional App Challenge disclosure)

The 2026 Congressional App Challenge rules require full disclosure of AI usage and clear documentation of open-source libraries and external tools. Costa was built by students; AI assisted some coding. At runtime Costa is **local-first**: it does **not** require Vercel AI Gateway or cloud LLM billing.

## 1. Runtime AI in the product (what users experience)

| Capability | When it runs | What it does | What it does **not** do |
| --- | --- | --- | --- |
| FAQ matcher | Always, before any model | Maps free text to pre-written multilingual answers | Does not invent benefits facts |
| Deterministic local agent | Default Ask path | Soft FAQ match + lexical search over curated sources + help offers | Does not call a cloud LLM |
| Optional local LLM (Ollama) | Only if `COSTA_LOCAL_LLM_URL` is set | Small local models for freer chat / optional vision | Never required for the demo |
| Letter path | Always on web | On-device OCR (Tesseract) + heuristic explain; PDF page 1 rasterized in-browser | Photo is not permanently stored |
| Whisper / TTS | Voice fallback & read-aloud | On-device Whisper-tiny / browser speech | Optional |
| Eligibility checkup | Always local TypeScript | Deterministic FPL / program rules | AI never runs this math |

**Design principle:** *AI for communication, not authority.* Every benefit fact Costa asserts must come from `content/sources/` (agency, URL, last-verified date).

## 2. AI tools used while building Costa

AI coding assistants (including Cursor) were used to:

- Scaffold UI components and API routes faster
- Draft multilingual FAQ copy for review
- Suggest tests and refactors

Students directed architecture, product decisions, safety rules, source curation, and demo design. AI did **not** write the entire app unattended. Significant student work includes: knowledge-base schema and sources, deterministic eligibility engine, FAQ bank + fuzzy matcher, local agent, handoff workflow, letter heuristics, eval scenarios, and multilingual UX.

## 3. Open-source libraries & platforms (not student-written)

| Tool | Role |
| --- | --- |
| Next.js, React, TypeScript | Web app framework |
| Tailwind CSS | Styling |
| Vercel AI SDK (`ai`, `@ai-sdk/react`, `@ai-sdk/openai`) | Streaming UI + optional local OpenAI-compatible models |
| Zod | Request validation |
| Twilio | SMS / MMS / voice (optional for demo) |
| Neon Postgres + pgvector | Sessions, handoffs, optional embeddings |
| Tesseract.js | On-device OCR for letters |
| pdfjs-dist | Rasterize PDF letters for OCR |
| `@huggingface/transformers` | Optional on-device Whisper-tiny |
| Vitest | Unit tests |
| gray-matter | Source markdown front matter |
| `@vercel/analytics` | Privacy-light usage events (no message bodies) |

Full versions are in `package.json` / `package-lock.json`.

## 4. Data Costa does **not** collect for judging demos

- No immigration-status questions
- Client + server redaction of SSN / ITIN / Medi-Cal ID patterns
- Checkup answers, My Plan, and saved city stay in `localStorage` on the device
- Server chats are purged after 30 days (`/api/cron/purge`)

## 5. How judges can verify coding excellence without a long live call

1. Visit https://costa-five.vercel.app — pick Spanish, Korean, or Vietnamese; use Ask FAQ chips or free text (local agent).
2. Open `/how` for the architecture walkthrough and local safety-eval score.
3. Open this file + `content/sources/` to see verified facts.
4. Run `npm test` and `npm run eval` (no API keys required for the local agent eval).
