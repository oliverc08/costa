# Costa

**A universal language layer between people and the benefits system.**

Live demo: **https://costa-five.vercel.app**  
Congressional App Challenge (CA-16) pack: [docs/SUBMISSION.md](docs/SUBMISSION.md) · [docs/AI-DISCLOSURE.md](docs/AI-DISCLOSURE.md)

Costa is a free benefits navigator for people who don’t speak English fluently. Call it, text it, or use the web in English, Spanish, Mandarin, Tagalog, Vietnamese, Korean, or Portuguese. No account, no app install. It focuses on Medi-Cal, and also covers CalFresh, WIC, CalEITC (including ITIN filers), and disaster aid for families in California’s 16th district (San Mateo and Santa Clara counties).

> Costa uses AI for communication, not authority.

Every benefit fact comes from a verified official source (agency, URL, last-verified date). Eligibility screening is deterministic TypeScript, not the model. When Costa doesn’t have a verified source, it says so and connects you to a person.

Built for the **2026 Congressional App Challenge** in CA-16, where the district theme is helping people access vital federal, state, or local benefits and services.

## What it does

| Channel | How |
| --- | --- |
| Web (voice-first) | Speak or type; FAQ matching answers common questions without a model call |
| Letter photo | Explains deadlines and next steps; on-device OCR if cloud AI is unavailable |
| Checkup + My Plan | Local screening math; save steps and deadlines on the device |
| Human handoff | With consent, a local partner can follow up |
| SMS / Voice | Same agent via Twilio when configured |

## How it’s built

- **Next.js 16** (App Router) on **Vercel**, **AI SDK** through **Vercel AI Gateway**
- Tools: `searchBenefits`, `screenEligibility`, `findLocalHelp`, `createHumanHandoff`
- **Neon Postgres** + pgvector when configured; in-memory fallback otherwise
- Safety: redaction, no immigration questions, reply audit, 30-day purge
- **Costa Safety Eval**: 150 scenarios (30 intents × 5 core languages)

See [docs/AI-DISCLOSURE.md](docs/AI-DISCLOSURE.md) for AI-assisted coding disclosure and open-source dependencies (required for CAC).

## Run it

```bash
cp .env.example .env.local   # AI Gateway access is the only requirement for full AI features
npm install
npm run dev                  # http://localhost:3000
npm test                     # unit tests, no keys needed
npm run eval                 # 150-scenario eval, needs AI Gateway
```

[docs/SETUP.md](docs/SETUP.md) · [docs/DEMO.md](docs/DEMO.md) · [docs/SUBMISSION.md](docs/SUBMISSION.md)

## License

MIT — see [LICENSE](./LICENSE).

Costa is a student project, not a government agency. It cannot decide eligibility.
