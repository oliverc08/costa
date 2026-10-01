# Costa — team brief (INTERNAL)

**For us only.** Use this to rehearse the demo video, portal answers, and judge Q&A.  
Not for the CAC portal attachment (that’s `AI-DISCLOSURE.md` + `SUBMISSION.md`).

**North star line (memorize):**  
*AI is for communication. Eligibility math and benefit facts are our code and our sources — not the model inventing answers.*

---

## How to use this

| Situation | What to pull from here |
| --- | --- |
| Demo video (1–3 min) | § Elevator lines + § Video beat cards |
| Portal Q4 (technical difficulty) | § Hardest problem we solved |
| Portal Q5 (what we learned) | § What we actually understand |
| Judge asks “show me the code” | § System cards (file + 30-second pitch) |
| Someone asks “did AI build this?” | § What we did vs what AI helped with |

---

## Elevator lines (say these out loud)

**One-sentence purpose (video must have this):**  
“Costa helps families who don’t speak English fluently access Medi-Cal and other benefits in California’s 16th district.”

**Audience:**  
“Parents and workers who get confusing benefits letters and need a next step — without creating an account.”

**Tools / languages (video must name these):**  
“We built it in **TypeScript** with **Next.js** and **React**, hosted on **Vercel**, using the **AI SDK**. Eligibility screening is plain TypeScript — not the language model.”

**Coding excellence one-liner:**  
“Common questions never hit the model; checkup runs on the phone; every benefit fact comes from curated government sources; if we’re unsure we connect you to a person.”

---

## What we did vs what AI helped with

Say this if asked about Cursor / AI coding:

| We directed / own | AI helped draft / speed up |
| --- | --- |
| Product idea: language layer for benefits in CA-16 | UI scaffolding, boilerplate routes |
| Safety rules: no immigration questions, no “you qualify” | Some FAQ wording for us to edit |
| Deterministic eligibility tables + checkup flow | Test stubs, refactors |
| FAQ bank + fuzzy matcher design | Copy variants |
| Verified-source knowledge base (`content/sources/`) | Markdown formatting polish |
| Letter heuristics + on-device OCR fallback plan | Component wiring |
| Human handoff consent flow | Partner dashboard layout |
| Eval scenarios and pass/fail criteria | Running eval harness |

**Honest sentence:** “We used AI coding tools the way you’d use autocomplete and a fast junior — we still designed the architecture, curated the sources, and can explain every safety decision.”

---

## Video beat cards (backbone for the script)

Keep total under **3:00**. Practice until each card is natural.

| Time | On screen | Say (backbone) | If they ask “prove you get it” |
| --- | --- | --- | --- |
| 0:00–0:15 | Faces / names | “I’m [Name]. We’re students in CA-16. This is **Costa**.” | — |
| 0:15–0:30 | Logo / home | One-sentence purpose (above). | — |
| 0:30–0:40 | Language picker | Audience line. “No account.” | Cookie `costa_lang` picks UI language. |
| 0:40–0:55 | — | Tools/languages line. | “Eligibility is TypeScript in `lib/eligibility`.” |
| 0:55–1:25 | Ask in Spanish / chip | “Common questions match a FAQ we wrote — often **no AI call**. Sources show on screen.” | `matchFaq` in `lib/faq.ts` before the model. |
| 1:25–1:55 | Letter **photo** | “Explains the deadline and next step. Photo isn’t saved.” | Cloud vision, or phone OCR if Gateway is down. |
| 1:55–2:20 | Plan or Help | “Save steps on this phone, or request a real person.” | Plan = `localStorage`; handoff needs consent. |
| 2:20–2:45 | `/how` or safety | “AI explains; it never decides eligibility and never asks immigration status.” | Redact + audit + deterministic screen. |
| 2:45–3:00 | URL | “Try it: costa-five.vercel.app” | — |

---

## Architecture in one picture (words)

```
User (voice / type / letter photo)
        │
        ▼
   Language cookie + UI
        │
        ├── Ask ──► FAQ matcher ──hit──► canned answer + sources (no model)
        │              │ miss
        │              ▼
        │         Chat agent + 4 tools (only if AI Gateway works)
        │              │
        │              ├── searchBenefits  → our knowledge base
        │              ├── screenEligibility → same math as Checkup
        │              ├── findLocalHelp
        │              └── createHumanHandoff (consent required)
        │
        ├── Checkup ──► 100% on-device TypeScript (no server math)
        ├── Letter ──► cloud vision OR on-device OCR → explain
        └── Plan ──► localStorage only (reminders + steps)
```

---

## System cards (know these cold)

### 1) Language + home
- **Files:** `lib/ui-language.ts`, `components/app/Welcome.tsx`, `VoiceHome.tsx`
- **30s:** First screen chooses a language → cookie `costa_lang`. Home is voice-first; speaking stores the transcript and opens Ask.
- **We understand:** No account. Language is product, not a translation afterthought.

### 2) FAQ matcher (big coding point)
- **Files:** `lib/faq.ts`, `app/api/chat/route.ts`
- **30s:** Before any model call, the server tries to match the question to our multilingual FAQ. Match → stream a pre-written answer with real source cards. That’s why Ask still works when AI is flaky.
- **We understand:** Trust + demo reliability beat “always call GPT.”

### 3) Chat agent + tools
- **Files:** `lib/agent/`, `lib/tools/index.ts`
- **30s:** If FAQ misses and Gateway is up, the agent can only answer with tools. Facts come from `searchBenefits`. It can screen eligibility with the **same function** as Checkup. It can hand someone to a human only with consent.
- **Four tools:** `searchBenefits`, `screenEligibility`, `findLocalHelp`, `createHumanHandoff`

### 4) Eligibility / Checkup (biggest “we didn’t let AI decide” point)
- **Files:** `lib/eligibility/index.ts`, `lib/eligibility/limits.ts`, `lib/checkup.ts`, `components/app/Checkup.tsx`
- **30s:** Checkup is **on the phone**. It runs TypeScript against published income tables. Labels are “may qualify / might / likely not” — never a legal decision. Chat uses the identical `screenEligibility` function.
- **We understand:** Models hallucinate numbers; FPL tables don’t.

### 5) Letter explainer
- **Files:** `components/LetterUpload.tsx`, `app/api/letter/route.ts`, `lib/letter-ocr.ts`, `lib/letter-from-text.ts`
- **30s:** Photo goes to vision when AI works. If the Gateway returns 503, the phone runs OCR (Tesseract) and we explain from text. We don’t keep the photo.
- **We understand:** Killer feature for Medi-Cal letters; needs a clear **photo** for the offline path.

### 6) My Plan
- **Files:** `lib/device.ts`, `app/plan/page.tsx`
- **30s:** Reminders and checklist live in `localStorage` (`costa_device_v1`). No login. Clear data wipes the plan.
- **We understand:** Local-first for sensitive screening answers.

### 7) Human handoff
- **Files:** `lib/handoff.ts`, `app/api/handoff/route.ts`, `components/app/PersonRequest.tsx`
- **30s:** One pipeline for the form and the agent tool. User must consent. Contact info required. We redact sensitive patterns. Partners see a queue (`/partners`). Confirmation looks like `C-XXXXX`.
- **We understand:** Language access without a human path is incomplete.

### 8) Safety
- **Files:** `lib/safety/redact.ts`, `lib/safety/output.ts`, `lib/agent/instructions.ts`
- **30s:** We redact SSN/ITIN-style IDs before the model. After replies we audit for “you qualify,” immigration questions, and fake phone numbers. Evals fail those cases.
- **We understand:** Soft audit on the live stream + hard fail in evals; prompt alone isn’t enough.

### 9) Knowledge base
- **Files:** `content/sources/*.md`, `scripts/build-kb.ts`, `lib/knowledge/`
- **30s:** Benefit facts are markdown we curated with agency + URL + last-verified. Build turns them into chunks. Agent must search before stating facts; if nothing found, admit it.
- **We understand:** RAG over **our** sources, not the open internet.

### 10) Evals
- **Files:** `evals/scenarios.ts`, `evals/run.ts`
- **30s:** ~150 scenarios (intents × languages) run the real agent and judge language, action, grounding, escalation. Unit tests (`npm test`) work without keys; full eval needs AI Gateway.
- **We understand:** Coding excellence isn’t vibes — we wrote scenarios that catch unsafe answers.

---

## Hardest problem we solved (portal Q4 backbone)

**Problem:** Language models invent benefits facts and can sound sure when they’re wrong — dangerous for Medi-Cal.

**What we did:**
1. Put the most common questions on a **FAQ matcher** so many asks never hit the model.
2. Force open chat through **tools** backed by curated sources.
3. Keep eligibility in **deterministic TypeScript** shared by Checkup and the agent.
4. Add **redaction + output audit + evals**.
5. When cloud AI is down, still help: FAQ path, letter OCR on-device, offline Ask hint.

**One sentence:** “The hard part wasn’t calling an API — it was constraining AI so Costa stays safe and useful.”

---

## What we learned (portal Q5 backbone)

Pick 2–3 and say them in your own voice:

- Public benefits need **product constraints**, not just a chat box.
- **Voice-first + big buttons** matter more for our users than fancy UI chrome.
- A **human handoff** is part of the product, not a failure mode.
- Demo reliability forced us to invent the FAQ shortcut and OCR fallback.

---

## Storage cheat sheet (judges love this)

| Data | Where it lives |
| --- | --- |
| UI language | Cookie `costa_lang` |
| Chat session id | HttpOnly cookie `costa_sid` |
| Web chat transcript | `sessionStorage` `costa_chat_v1` |
| Pending voice text | `sessionStorage` `costa_pending_voice` |
| Plan / checkup summary | `localStorage` `costa_device_v1` |
| Handoffs / SMS sessions | Neon Postgres if configured, else memory |

---

## Practice Q&A (quiz each other)

**Q: Does Costa decide if someone gets Medi-Cal?**  
A: No. Checkup and `screenEligibility` are screening only. We say they may qualify and point to official apply/renew paths.

**Q: Why doesn’t every Ask question use AI?**  
A: FAQ match first. Faster, cheaper, grounded, works offline. Model is for open questions.

**Q: Where do dollar amounts and phone numbers come from?**  
A: Curated `content/sources/` via `searchBenefits`, or local-help directory — not model memory.

**Q: What if the AI Gateway is down during the demo?**  
A: FAQ chips / paraphrase still work; letter photo can OCR on-device; Ask shows an offline hint instead of a silent fail.

**Q: Do you ask immigration status?**  
A: Never. Instructions forbid it; output audit flags it; evals test it.

**Q: Is My Plan in the cloud?**  
A: No. Device `localStorage` only.

**Q: Did AI write the whole app?**  
A: No. AI assisted coding. We designed architecture, sources, safety, eligibility, FAQ, handoff, and evals — and we can walk the code.

**Q: What’s TypeScript doing that the model isn’t?**  
A: FPL/program math in `lib/eligibility`, FAQ matching in `lib/faq`, letter heuristics, redaction regexes, handoff validation.

---

## 10-minute rehearsal plan

1. Each teammate reads **Elevator lines** out loud once.  
2. One person drives the phone through **Video beat cards**; others only say the backbone lines.  
3. Cold-call 5 questions from **Practice Q&A**.  
4. One person explains **Eligibility** and **FAQ** with the file names.  
5. Record a practice take; cut anything that doesn’t show the live app.

---

## Links

| Doc | Use |
| --- | --- |
| [SUBMISSION.md](./SUBMISSION.md) | Official checklist + portal drafts |
| [AI-DISCLOSURE.md](./AI-DISCLOSURE.md) | Paste/attach for CAC AI disclosure |
| [DEMO.md](./DEMO.md) | Recording + partner testing |
| https://costa-five.vercel.app/how | Judge-facing architecture page |
| https://github.com/oliverc08/costa | Public source for judges |
