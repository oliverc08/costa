# Costa — CAC application working draft

This is a factual starting point, not a ready-to-submit application. Each participant must verify the facts, write personal answers in their own voice, complete the portal fields, and review the current rules. Do not commit private addresses, student IDs, or guardian contact details to this public repository.

**District:** California's 16th Congressional District

**Live app:** https://costa-five.vercel.app

**Source:** https://github.com/oliverc08/costa

**Judge walkthrough:** https://costa-five.vercel.app/how

**Video:** [ADD THE FINAL PUBLIC VIDEO URL]

The 2026 national rules list October 26, 2026 at 12:00 p.m. EDT (9:00 a.m. Pacific). Verify the live portal and district instructions for the current deadline; contact the district office if the displayed times conflict.

## A. Portal profile and team

Complete these fields in the official portal. Confirm eligibility with every entrant and guardian.

- Personal email for each student, if required by the portal
- Student and parent/guardian details requested by the portal
- Home and school district information requested by the portal
- Team lead and up to the permitted number of teammates
- Any required teacher or mentor details
- Eligibility questions and attestations

| Role | Full name | Grade | School |
| --- | --- | --- | --- |
| Team lead | [FILL IN IN PORTAL] | [ ] | [ ] |
| Teammate | [FILL IN IN PORTAL] | [ ] | [ ] |
| Teammate | [FILL IN IN PORTAL] | [ ] | [ ] |
| Teammate | [FILL IN IN PORTAL] | [ ] | [ ] |

## B. Application answer drafts

### 1. App title

Costa

### 2. Purpose

Costa is a multilingual web app that helps people in San Mateo and Santa Clara counties navigate Medi-Cal and related benefits. It can explain benefit-letter text, provide next-step guidance from curated sources, offer a deterministic screening checkup, and connect users with local help. It supports English, Spanish, Mandarin, Tagalog, Vietnamese, Korean, and Portuguese. It does not decide eligibility or award benefits.

### 3. Inspiration

Write this answer from the entrants' actual experience. Consider: What problem did you observe? Why did it matter to your team? What did each participant contribute? Do not use a generic story or claim lived experience that is not true.

Draft notes: [ADD YOUR OWN ACCOUNT]

### 4. Technical challenge and solution

One technical challenge was keeping benefit guidance understandable while avoiding unsupported eligibility decisions. Costa uses a multilingual FAQ for common questions, a deterministic local agent that searches curated benefit sources for other questions, and TypeScript rules for the screening checkup. Letter OCR runs in the browser; Costa redacts the extracted text in the browser and again on the server before heuristic analysis. The default web demo does not call a cloud model or AI Gateway. Optional local models can be configured separately.

Add what each entrant personally designed, implemented, tested, or reviewed: [VERIFY AND COMPLETE]

### 5. What the team learned

Each participant should write this answer from their own work. Possible topics to consider include source verification, designing a fallback, testing language coverage, or handling sensitive data. Use only lessons that the team actually learned.

Draft notes: [ADD YOUR OWN ACCOUNT]

### 6. What the team would change

Choose improvements the team genuinely wants to pursue. Possible areas include broader language review, more real-world usability testing with consent, improved source freshness checks, or stronger letter support. Do not claim user testing or partner feedback that has not happened.

Draft notes: [ADD YOUR OWN PLAN]

## C. AI and third-party tools disclosure

Attach or paste the current [AI-DISCLOSURE.md](./AI-DISCLOSURE.md), after each participant confirms the tools and assistance it lists. The current project work identifies Cursor and OpenAI Codex; add any other AI tools, models, or generative-media tools actually used by the entrants.

### Short disclosure text

Costa's default runtime uses a multilingual FAQ, deterministic local-agent code, curated sources, and TypeScript eligibility rules. It does not use Vercel AI Gateway or require a cloud model. Optional local model features run only when an OpenAI-compatible local endpoint is configured. During development, AI coding assistants including Cursor and OpenAI Codex assisted with code/documentation review and drafting and implementation suggestions. Each participant must review and accurately describe their own contribution and add any AI tools they used. The project also uses open-source libraries and optional services listed in AI-DISCLOSURE.md and the package manifests.

## D. Links

| Label | URL |
| --- | --- |
| Live app | https://costa-five.vercel.app |
| Judge walkthrough | https://costa-five.vercel.app/how |
| Source code | https://github.com/oliverc08/costa |
| AI disclosure | https://github.com/oliverc08/costa/blob/main/docs/AI-DISCLOSURE.md |
| Public demo video | [ADD AFTER RECORDING AND VERIFYING VISIBILITY] |

## E. Video preparation

Follow the live portal requirements. The current project notes describe a public 1–3 minute video that includes participants' names, app name, purpose, target audience, tools/languages, and a live demonstration. Verify that these instructions are still current.

Suggested order:

1. Each actual participant says their name and introduces Costa.
2. Explain the purpose and intended audience in your own words.
3. Name the languages and tools used by the team.
4. Show the running app and one common-question answer with its source.
5. Show Checkup or My Plan and explain the safety boundary.
6. Optionally show a letter example made from fabricated or fully redacted data.
7. End with the live app and source links.

Before upload, verify that the video is the required length, public, accessible without signing in, and free of personal data. Add captions if useful or required. Paste the final URL into the portal and section D.

## F. Final checks

- [ ] Every entrant and guardian has confirmed eligibility and roster information.
- [ ] Each participant has reviewed the answer drafts and made them accurate and personal.
- [ ] Student contributions are described truthfully and distinctly.
- [ ] AI and third-party tools are fully disclosed by every participant.
- [ ] Current rulebook, district instructions, and live deadline have been checked.
- [ ] App, repository, and judge-walkthrough links have been opened and checked.
- [ ] Demo video is complete and satisfies the current portal instructions.
- [ ] All bracketed fields are resolved; no names or video link are fabricated.
- [ ] Portal entry has been submitted and confirmation saved.
- [ ] Any post-deadline questionnaire required by the rules is completed.
