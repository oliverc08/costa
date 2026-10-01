# Costa — full CAC application draft (copy into the portal)

**District:** CA-16 (Rep. Sam Liccardo)  
**Deadline:** Monday, October 26, 2026 — **9:00 AM Pacific** (same as 12:00 pm EDT national)  
**Submit by:** October 24 if possible  

**Fill in before submitting:** replace every `[BRACKET]`  
**Live app:** https://costa-five.vercel.app  
**Source code:** https://github.com/oliverc08/costa  
**Judge walkthrough:** https://costa-five.vercel.app/how  

Related docs: [TEAM-BRIEF.md](./TEAM-BRIEF.md) (rehearsal) · [AI-DISCLOSURE.md](./AI-DISCLOSURE.md) · [SUBMISSION.md](./SUBMISSION.md)

---

## A. Registration fields (portal profile)

| Field | What to enter |
| --- | --- |
| Personal email | **Not** your school email |
| Home address | Full street + **9-digit ZIP** |
| School address | Full street + **9-digit ZIP** |
| Congressional district | California’s 16th / Sam Liccardo |
| Parent/guardian name + email | Required |
| Coding teacher/mentor | Optional — `[NAME / EMAIL]` |
| Team | One person creates the team; invite ≤3 others |
| Eligibility quiz | Middle or high school on Oct 26, 2026; live or attend school in CA-16 (or ≥½ of team); U.S. resident; one entry per person |

**Team roster (edit):**

| Role | Full name | Grade | School |
| --- | --- | --- | --- |
| Lead / creates team | `[NAME 1]` | `[ ]` | `[ ]` |
| Teammate | `[NAME 2]` | `[ ]` | `[ ]` |
| Teammate | `[NAME 3]` | `[ ]` | `[ ]` |
| Teammate | `[NAME 4]` | `[ ]` | `[ ]` |

---

## B. Application questions (paste these)

### 1. What is the title of your app?

Costa

### 2. Explain the app’s purpose.

Costa is a free, multilingual benefits navigator for families in San Mateo and Santa Clara counties (California’s 16th district). It helps people who don’t speak English fluently understand Medi-Cal and related programs (CalFresh, WIC, CalEITC, and disaster aid), explain confusing government letters, save next steps on their phone, and connect to a real local helper — without creating an account or installing an app.

Users can speak or type in English, Spanish, Mandarin, Tagalog, Vietnamese, Korean, or Portuguese. Costa uses AI to communicate in the user’s language, but it does **not** decide eligibility. Benefit facts come from curated official sources, and screening math runs in plain TypeScript on the device.

**Live demo:** https://costa-five.vercel.app

### 3. What inspired you to create this app?

California’s 16th district asked students to build something that helps people access vital federal, state, or local benefits and services. That matched a problem we see every day: families get Medi-Cal renewals and notices that are hard even in English, and harder when English isn’t the language spoken at home.

We wanted a “language layer” between people and the benefits system — something voice-first, free, and trustworthy. Existing chatbots often invent facts or sound too sure. So we designed Costa so that common questions can be answered from a verified FAQ without calling a model, eligibility screening is deterministic code (not AI), and when someone still needs a person, they can request local help with consent.

### 4. What technical/coding difficulty did you face, and how did you address it?

The hardest problem was **trust**. Language models are great at sounding helpful, but for Medi-Cal they can invent deadlines, phone numbers, or eligibility. That would make Costa dangerous.

We solved it with product constraints in code:

1. **FAQ matcher first** — Common questions are matched with fuzzy text matching to pre-written multilingual answers, so many Ask requests never hit a model (`lib/faq.ts`).
2. **Tool-backed chat** — Open questions go through an agent that must use tools like `searchBenefits` over our curated knowledge base (`content/sources/`), instead of answering from model memory.
3. **Deterministic eligibility** — Checkup and the agent’s `screenEligibility` tool share the same TypeScript rules and FPL tables (`lib/eligibility/`). Costa says someone *may* qualify; it never decides benefits.
4. **Safety layer** — We redact sensitive ID patterns before the model, audit replies for definite eligibility claims / immigration questions / unverified phones, and maintain a multilingual safety eval suite.
5. **Fallbacks** — If cloud AI is down, FAQ still works, Ask shows an offline hint, and letter photos can be read with on-device OCR.

The challenge wasn’t “calling an API” — it was architecting the app so AI is for communication, not authority.

### 5. What did you learn while participating in the CAC? What was your biggest takeaway?

Biggest takeaway: for public benefits, **AI features are not enough**. You need verified data, hard product rules, and a path to a human.

We also learned that voice-first design, huge tap targets, and offline fallbacks matter more to real users (and to a live demo) than adding another model call. Building Costa taught us to treat safety and language access as engineering problems — FAQ matching, deterministic screening, redaction, evals — not just prompt wording.

### 6. What would you change about your app if you were to create a 2.0 version?

In 2.0 we would:

- Finish full UI translations for every supported language (not only FAQ/content paths)
- Improve letter support for PDFs and low-light photos
- Complete structured user testing with partners like ALAS, Puente de la Costa Sur, and Sacred Heart Community Service, and fold their feedback into the UX
- Publish always-on safety-eval scores on the site after every release
- Add clearer “how to renew” guided checklists per county

---

## C. AI / open-source disclosure (paste or attach)

If the portal has a dedicated AI field, paste this. Otherwise attach `docs/AI-DISCLOSURE.md` or include this under Q4.

```
AI DISCLOSURE — Costa (Congressional App Challenge 2026)

Runtime AI in the product:
- FAQ matcher (no model): maps common questions to pre-written multilingual answers.
- Chat agent (AI Gateway + AI SDK): only when FAQ misses; must use tools backed by curated government sources.
- Letter vision (when Gateway works): explains a letter photo; photo is not permanently stored.
- On-device OCR fallback (Tesseract.js): when cloud AI is unavailable.
- Speech: browser speech first; Whisper/TTS only as fallback.
- Eligibility checkup: deterministic TypeScript only — AI never decides eligibility.

AI used while building:
- Coding assistants (including Cursor) helped scaffold UI/API routes, draft FAQ copy for our review, and suggest tests/refactors.
- Students directed architecture, product decisions, safety rules, source curation, eligibility tables, FAQ design, handoff flow, letter heuristics, eval scenarios, and UX.
- AI did not write the entire app unattended. Significant personal/student contribution is required by the rules and is reflected in the systems above.

Open-source / platforms (not student-written):
Next.js, React, TypeScript, Tailwind CSS, Vercel AI SDK, Vercel AI Gateway, Zod, Twilio (optional), Neon Postgres + pgvector (optional), Tesseract.js, Vitest.

Principle: AI for communication, not authority.
Full detail: https://github.com/oliverc08/costa/blob/main/docs/AI-DISCLOSURE.md
```

---

## D. Links for judges (put wherever the portal asks for source / demo)

| Label | URL |
| --- | --- |
| Live app | https://costa-five.vercel.app |
| How it works (judges) | https://costa-five.vercel.app/how |
| Source code (public) | https://github.com/oliverc08/costa |
| AI disclosure | https://github.com/oliverc08/costa/blob/main/docs/AI-DISCLOSURE.md |
| Demo video | `[PASTE YOUTUBE OR VIMEO PUBLIC LINK]` |

---

## E. Full demo video script (read this on camera)

**Rules reminder:** 1–3 minutes · **Public** on YouTube or Vimeo (not Unlisted) · Include names, app name, one-sentence purpose, audience, tools/languages, live showcase.

**Replace names. Practice once with a phone timer.**

---

**[0:00–0:15] Faces / name cards**  
“Hi — I’m `[NAME 1]`[, and this is `NAME 2` / `NAME 3`]. We’re students in California’s 16th congressional district. This is **Costa**.”

**[0:15–0:30] Home screen**  
“Costa helps families who don’t speak English fluently **access Medi-Cal and other benefits** in California’s 16th district.”

**[0:30–0:40] Language picker**  
“It’s for parents and workers who get confusing benefits letters and need a clear next step — with **no account** and no app install.”

**[0:40–0:55] Keep home or flash `/how`**  
“We built Costa with **TypeScript, Next.js, and React**, hosted on **Vercel**, using the **AI SDK**. Eligibility screening is plain TypeScript — not the language model.”

**[0:55–1:25] Phone: switch to Spanish or Vietnamese → Ask**  
*(Tap a common-question chip, or paraphrase one.)*  
“You can speak or type. Many common questions match a FAQ we wrote, so the answer can come from verified sources **without inventing facts**. No account required.”

**[1:25–1:55] Letter → take/upload a clear photo**  
“Here’s a Medi-Cal letter. Costa explains the deadline and what to do next. The photo isn’t saved on our servers.”

**[1:55–2:20] Plan tab or Help → request a person**  
“You can save steps on this phone in My Plan, or request a real person from a local partner — with your consent.”

**[2:20–2:45] Safety line (stay on `/how` or Help)**  
“AI helps with language. It never decides eligibility, and Costa never asks about immigration status.”

**[2:45–3:00] End card**  
“Try Costa at **costa-five.vercel.app**. Thanks for watching.”

---

### Video checklist before upload

- [ ] Length between 1:00 and 3:00  
- [ ] Every teammate’s name said on camera  
- [ ] App name “Costa” said clearly  
- [ ] One-sentence purpose said clearly  
- [ ] Audience said  
- [ ] Tools/languages said (TypeScript, Next.js, React, Vercel, AI SDK)  
- [ ] Live phone demo (not only slides)  
- [ ] YouTube/Vimeo set to **Public**  
- [ ] English captions if any spoken language isn’t English  
- [ ] Link pasted into section D above and into the portal  

---

## F. Optional “extra credit” blurbs (if there’s a free-response / notes box)

**District theme:**  
Costa directly addresses CA-16’s 2026 theme: helping people access vital federal, state, or local benefits and services — focused on Medi-Cal and related programs for San Mateo and Santa Clara families.

**Coding excellence (short):**  
Deterministic eligibility engine; multilingual FAQ matcher before the LLM; verified-source search; input redaction and output safety audit; on-device letter OCR fallback; 399 automated unit tests; multilingual safety eval suite.

**User testing (fill after you talk to orgs):**  
“In early feedback sessions with `[ORG / N people]`, users said: “[QUOTE 1]” and “[QUOTE 2].” We changed `[WHAT]` based on that.”

Partner contacts (from DEMO.md): ALAS (Half Moon Bay) · Puente de la Costa Sur (Pescadero) · Sacred Heart Community Service (San José).

---

## G. Final submit checklist

- [ ] Registered with personal email; eligibility quiz passed  
- [ ] Team invites accepted (if any)  
- [ ] Questions 1–6 pasted (edited into your voice)  
- [ ] AI disclosure pasted or file attached  
- [ ] Demo video Public + link added  
- [ ] Live URL + GitHub URL added  
- [ ] Parent/guardian info complete  
- [ ] Submitted before **Oct 26, 2026, 9:00 AM PT**  
- [ ] After deadline: every teammate completes the Exit Questionnaire  

---

## H. Voice pass (do this before paste)

Read Q2–Q6 out loud once. Change any sentence that doesn’t sound like you. Keep the facts; swap the wording. Judges can tell when answers are generic — they can’t tell you used a draft if it sounds like your team.
