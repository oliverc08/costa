# AI use and third-party tools

This is a working disclosure draft for the 2026 Congressional App Challenge. The submitting team must verify it against the tools actually used by every participant before attaching it to an entry.

## AI in the running app

Costa does not use Vercel AI Gateway or require cloud LLM credentials. Its default web experience uses deterministic code and curated content. Optional local model paths run only when a local OpenAI-compatible endpoint is explicitly configured.

| Feature | Default behavior | Optional behavior and data flow |
| --- | --- | --- |
| Common questions | A multilingual FAQ matcher returns reviewed answers and source links without a model call. | None. |
| Other Ask questions | A deterministic agent searches Costa's local knowledge base and help directory, then uses response templates. | If COSTA_LOCAL_LLM_URL is set, the app can send the conversation to that configured endpoint for model-assisted responses. The endpoint may be a local Ollama server; the user configuring it is responsible for where it runs. |
| Eligibility checkup | TypeScript program rules run in the browser. The result is a screening aid, not an eligibility decision. | None. |
| Letter photo | Tesseract OCR runs in the browser. Costa redacts extracted text in the browser and again on the server before heuristic analysis; the photo itself is not sent on this default path. Redaction may miss details, so use fabricated or carefully reviewed samples. | An optional vision route can send a letter image to the configured local model endpoint when enabled. |
| Speech input | Uses browser speech recognition when available. A Whisper-tiny transcription path can run in the browser where supported. | No AI Gateway transcription is used. Model files for local transcription may need to be downloaded by the browser. |
| Read aloud | Uses device/browser text-to-speech. | None. |

Costa's design principle is **AI for communication, not authority**. Benefit facts should be grounded in the curated source files under content/sources. Eligibility screening is code, not a model decision.

## AI tools used during development

AI coding tools used in project work include **Cursor** and **OpenAI Codex**. They have assisted with code and documentation review and drafting, implementation suggestions, and identifying issues. The submitting team must confirm the complete tool list and describe each participant's own work accurately. Do not present AI-generated drafts as a student's personal experience or claim that a participant independently authored work they did not author.

Before submission, each participant should add or verify:

- Which AI tools they used, including coding assistants and generative media tools.
- The parts of the project those tools helped with.
- The student's own design, implementation, testing, and review contributions.

This document describes the tools identified in the project work to date; it is not a substitute for every entrant's review.

## Open-source software and external services

The application uses the packages listed in package.json and package-lock.json. Relevant frameworks, libraries, and services include:

| Tool | Role |
| --- | --- |
| Next.js, React, TypeScript | Web application and language |
| Tailwind CSS | Styling |
| Vercel AI SDK and OpenAI-compatible provider adapter | Optional local model integration; no AI Gateway |
| Tesseract.js | Browser-side OCR |
| pdfjs-dist | Render PDF pages for browser-side OCR |
| @huggingface/transformers | Optional browser-side Whisper-tiny transcription |
| Neon Postgres | Optional durable storage |
| Twilio | Optional SMS and phone integration |
| Zod, gray-matter, Vitest | Validation, source processing, and tests |
| Vercel | Hosting and optional scheduled purge |
| Ollama or compatible local endpoint | Optional user-operated local model server |

Check package manifests for exact versions and licenses. Before submitting, confirm whether the deployed build enables any optional service and disclose additional tools or hosted model/data providers used by the team.

## Data handling notes

- Checkup answers and My Plan data are stored in browser localStorage.
- The web chat transcript is displayed from browser sessionStorage. Ask requests are sent to the Costa app server. The default agent does not need a database or a model.
- Without DATABASE_URL, server-side sessions and handoffs use process memory and are temporary; process restarts or serverless instance changes can lose them.
- With a database configured, sessions are stored in Neon. The daily purge endpoint deletes sessions older than 30 days and resolved handoffs older than 30 days when the scheduled job is configured with CRON_SECRET. Unresolved handoffs are not removed by that purge.
- On the default letter path, the image is OCR'd in the browser, extracted text is redacted in the browser and again on the server, and the redacted text is analyzed by the Costa app server. Redaction may miss details.

See SETUP.md for configuration and DEMO.md for safe demo preparation.

## How judges can inspect the project

1. Open https://costa-five.vercel.app and try a common question in a supported language.
2. Open https://costa-five.vercel.app/how for the runtime walkthrough and published evaluation summary, if one is present.
3. Review content/sources and the code paths described above.
4. From a local checkout, run npm test and npm run eval. The local evaluation does not require AI credentials or AI Gateway.
