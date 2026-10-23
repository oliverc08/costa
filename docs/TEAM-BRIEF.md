# Costa — team rehearsal brief

Internal prompts for understanding the code and preparing the demo. Each participant should explain only work they personally understand and accurately describe their own contribution. This brief is not a substitute for the application or AI disclosure.

## Core explanation

**Purpose:** Costa helps people navigate Medi-Cal and related benefits with multilingual guidance, source links, screening information, and a path to local help.

**Default runtime:** The FAQ and deterministic local agent do not call a cloud model. Optional model-assisted chat is available only if a local OpenAI-compatible endpoint is configured. No Vercel AI Gateway is used.

**Safety:** Eligibility screening is TypeScript code; it is not a model decision. Costa offers information and possible next steps, not a benefits determination. Do not claim perfect accuracy or complete privacy.

## Demo order

| Beat | Show | Explain |
| --- | --- | --- |
| Introduction | Actual participants and Costa | State real names, app purpose, and intended audience. |
| Ask | A common question in a language the presenter can discuss | The FAQ returns reviewed content and source links. Other questions use the deterministic local agent. |
| Checkup | A screening flow | The rules are implemented in TypeScript; results are guidance, not a decision. |
| My Plan | Save or view next steps | Plan details are stored in browser localStorage. |
| Letter | Fabricated or fully redacted letter | OCR runs in the browser; redacted extracted text is sent to the app server and redacted again before analysis. Redaction may miss details. |
| Help | Local help or handoff, if configured and tested | A request to a person requires consent. Do not promise follow-up unless the displayed flow supports it. |
| Wrap | /how page and project links | Describe the default local-first runtime and disclose optional services accurately. |

## Architecture map

```text
Browser
  ├─ language choice and interface
  ├─ Checkup rules and My Plan storage
  ├─ letter photo → browser OCR → redacted extracted text to Costa app server
  └─ Ask text → FAQ → deterministic local agent → curated sources / local help

Costa app server
  ├─ default deterministic FAQ and local-agent routes
  ├─ optional model request to COSTA_LOCAL_LLM_URL, if configured
  ├─ temporary process-memory store by default
  └─ optional Neon store and Twilio integration
```

## Code paths to explore

| Area | Files | What to explain |
| --- | --- | --- |
| Language and FAQ | lib/faq.ts, lib/languages.ts, app/api/chat/route.ts | Common questions can match a multilingual FAQ before local-agent processing. |
| Default local agent | lib/agent/local.ts, lib/knowledge/search.ts | Lexical search over project-curated content with deterministic response construction. |
| Optional model integration | lib/config.ts, lib/agent/index.ts | A model is used only when COSTA_LOCAL_LLM_URL is configured. |
| Eligibility | lib/eligibility/, lib/checkup.ts, components/app/Checkup.tsx | TypeScript screening rules and shared program facts. Explain limits and that the result is not a determination. |
| Letter OCR | components/LetterUpload.tsx, lib/letter-ocr.ts, app/api/letter-text/route.ts | OCR is performed in the browser; redacted extracted text goes to the app server for another redaction pass and heuristic analysis. |
| My Plan | lib/device.ts, app/plan/page.tsx | Browser-side data storage and clearing behavior. |
| Human handoff | lib/handoff.ts, app/api/handoff/route.ts, components/app/PersonRequest.tsx | Consent, validation, and conditions for a request. |
| Knowledge base | content/sources/, scripts/build-kb.ts, lib/knowledge/ | Source metadata and generated search content. Verify source dates before relying on a specific fact. |
| Evaluation | evals/scenarios.ts, evals/run.ts | Local scenarios exercise source use, action, language, safety, and escalation. The score is a test result, not a guarantee. |
| Persistence | lib/store/index.ts, lib/store/memory.ts, lib/store/neon.ts | Memory is temporary; Neon is optional durable storage. |

## Questions judges may ask

**Does Costa decide who receives benefits?**

No. It provides screening guidance and links or next steps. Agencies decide eligibility.

**Does the default chat use a cloud AI service?**

No. The default uses deterministic code and curated content. An optional local model can be configured by the operator.

**Where do benefit facts come from?**

The curated content/sources directory. The team should verify current source dates and limitations before presenting a particular fact.

**Where does a letter photo go?**

The default path performs OCR in the browser, redacts the extracted text there, then sends the text to the Costa app server for further redaction and analysis. Redaction may miss details; do not demonstrate with unredacted personal documents.

**Where is user data stored?**

Checkup and My Plan data use browser storage. Server-side sessions and handoffs use temporary process memory unless DATABASE_URL is configured for Neon. Explain that memory can disappear on restart or differ across serverless instances.

**Did AI help build Costa?**

AI coding tools identified in project work include Cursor and OpenAI Codex. The team should describe each entrant's real contribution and all tools actually used, without claiming AI-produced work as personal work.

## Rehearsal

1. Each participant explains one part they personally implemented or reviewed.
2. Run the local app and evaluation using SETUP.md.
3. Rehearse once with a fabricated letter and no private user data.
4. Ask another participant to challenge a factual claim and find its source.
5. Remove any sentence from the video or application that the team cannot substantiate.
