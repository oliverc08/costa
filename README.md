# Costa

**A multilingual guide to California benefits and the next steps people can take.**

Live demo: **https://costa-five.vercel.app**  
Congressional App Challenge (CA-16) materials: [docs/SUBMISSION.md](docs/SUBMISSION.md) · [docs/AI-DISCLOSURE.md](docs/AI-DISCLOSURE.md)

Costa is a free benefits navigator for people who do not speak English fluently. Use it on the web in English, Spanish, Mandarin, Tagalog, Vietnamese, Korean, or Portuguese. It focuses on Medi-Cal and also covers CalFresh, WIC, CalEITC, and disaster aid for families in San Mateo and Santa Clara counties. No account or app install is required.

> Costa uses AI for communication, not authority.

The default Ask experience does not call a cloud AI service. Common questions use a multilingual FAQ; other questions use a deterministic agent that searches Costa’s curated sources and local-help directory. Eligibility screening is TypeScript code. Optional browser-side speech transcription and a local chat model can be used without an AI Gateway.

Built for the **2026 Congressional App Challenge** in CA-16, whose district theme is helping people access vital federal, state, or local benefits and services.

## What it does

| Channel | How |
| --- | --- |
| Web | Speak or type. Browser-provided speech recognition is used where available; recorded fallback runs Whisper-tiny in the browser after its model files download. Costa does not send audio to an app or AI Gateway service. |
| Ask | Multilingual FAQ matching first, then a deterministic local agent backed by curated benefit sources. |
| Letter | OCR runs in the browser; redacted extracted text is sent to the Costa app server for a heuristic explanation. Redaction may miss details, so use a fabricated or carefully reviewed sample for demos. |
| Checkup + My Plan | Screening math runs in TypeScript; plan and checkup details are saved on the device. |
| Human handoff | With consent, request follow-up from a local partner. |
| SMS / phone | Optional Twilio integration; configure credentials and a public callback URL to enable it. |

## How it is built

- **Next.js 16** App Router and TypeScript
- **Default Ask path:** FAQ matching, lexical search over curated sources, deterministic response templates, and eligibility rules; no cloud model is called
- **Optional local models:** compatible local endpoint such as Ollama, configured with COSTA_LOCAL_LLM_URL; no Vercel AI Gateway is used
- **Storage:** in-memory by default; optional Neon Postgres with DATABASE_URL for durable sessions and handoffs
- **Safety:** input redaction, answer audits, no immigration-status questions, and a multilingual scenario evaluation suite

See [docs/AI-DISCLOSURE.md](docs/AI-DISCLOSURE.md) for runtime behavior, development-assistance disclosure, and third-party tools.

## Run locally

Node.js 22 or newer is recommended.

```bash
npm install
npm run dev
```

Open http://localhost:3000. No AI API key, AI Gateway account, database, or Twilio account is needed for the basic web demo.

```bash
npm test
npm run eval
```

The evaluation uses Costa’s local deterministic agent and requires no model credentials. To try optional local-model chat, configure an OpenAI-compatible local endpoint in .env.local; see [docs/SETUP.md](docs/SETUP.md).

### Persistence and partner dashboard

Without DATABASE_URL, server-side sessions and handoffs use process memory. They are temporary and may disappear when the server restarts or a serverless instance changes. Configure Neon for durable shared storage. The /partners dashboard also requires PARTNER_PASSCODE; production requires SESSION_SECRET. See [docs/SETUP.md](docs/SETUP.md) before exposing those features in a hosted demo.

## Project and submission notes

The application, team eligibility, participant names, original student contributions, demo video, and portal submission must be verified and completed by the submitting team. The repository is a draft pack, not proof that a submission has been made. See [docs/SUBMISSION.md](docs/SUBMISSION.md) and [docs/APPLICATION.md](docs/APPLICATION.md).

## License

MIT — see [LICENSE](./LICENSE).

Costa is a student project, not a government agency. It cannot decide eligibility.
