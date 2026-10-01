# Congressional App Challenge — CA-16 submission pack

**Internal (script + code understanding):** [TEAM-BRIEF.md](./TEAM-BRIEF.md) — not for the portal attachment.  
**Full application draft (copy-paste):** [APPLICATION.md](./APPLICATION.md)

District: **California’s 16th** (Rep. Sam Liccardo) — hosting ✅  
National rules: [2026 CAC Rules PDF](https://www.congressionalappchallenge.us/wp-content/uploads/2026/05/2026-CAC-Rules.pdf)  
District page: [liccardo.house.gov/services/congressional-app-challenge](https://liccardo.house.gov/services/congressional-app-challenge)  
Student portal: [congressionalappchallenge.us](https://www.congressionalappchallenge.us/students/student-registration/)  
District contact: CAC.Liccardo@mail.house.gov · (408) 245-2339

**Hard deadline (use the earlier of these):**

- National: **Monday, October 26, 2026, 12:00 pm EDT**
- CA-16 office: **Monday, October 26, 2026, 9:00 am Pacific** (same moment as 12:00 pm EDT)

Aim to submit by **October 24** so uploads can be fixed.

---

## Why Costa is a strong fit for CA-16

Liccardo’s district theme for this year asks students to build an app that helps people **access vital federal, state, or local benefits and services** ([district page](https://liccardo.house.gov/services/congressional-app-challenge); federal agencies list can inform examples). Costa is built exactly for that: Medi-Cal, CalFresh, WIC, CalEITC, and disaster aid for San Mateo & Santa Clara families, in multiple languages, with a path to a real human helper.

Judging criteria (national rules §7):

1. **Quality of the idea** (creativity & originality) → language-access + benefits navigation with safety constraints  
2. **Implementation** (UX & design) → voice-first mobile web, huge targets, FAQ chips, letter explainer, Plan  
3. **Coding excellence** → deterministic eligibility, verified-source RAG, FAQ matcher, eval suite, on-device OCR fallback  

### Recommendations that improve odds (beyond the minimum)

| Recommendation | Why judges care | Costa action |
| --- | --- | --- |
| Lead with the district theme in the video’s one-sentence purpose | CA-16 theme is benefits access | Script already says Medi-Cal / benefits |
| Show the app working (not just slides) | Functionality is required | Phone demo beats in script |
| Document AI + open source | Rules §3 originality + AI | [AI-DISCLOSURE.md](./AI-DISCLOSURE.md) |
| Make source easy to open | Judges may request code | Public GitHub + `/how` |
| Prove coding depth | Criterion 3 | Deterministic checkup, FAQ matcher, `npm test` (399), `npm run eval` when Gateway works |
| Real user quotes | Credibility / UX | Partner list in DEMO.md — gather before portal submit |
| Submit early (by Oct 24) | Fix upload issues | Aim before Oct 26 9am PT |
| Personal email + exit questionnaire | Rules §2 / §6 | Checklist below |  

---

## Official requirements → Costa status

| Requirement | Status | Evidence / action |
| --- | --- | --- |
| Middle/high school student(s) on Oct 26, 2026 | ⬜ You confirm | Eligibility quiz in portal |
| Live/attend school in CA-16 (or ≥½ of team) | ⬜ You confirm | District quiz |
| U.S. resident | ⬜ You confirm | Portal |
| Team ≤ 4; one entry per person | ⬜ You confirm | Portal |
| App created after Oct 30, 2025 | ✅ | Repo timeline / commits |
| Functional app | ✅ | https://costa-five.vercel.app |
| Decency / no IP theft | ✅ | Original product; MIT + disclosed deps |
| **AI use fully disclosed** | ✅ | [AI-DISCLOSURE.md](./AI-DISCLOSURE.md) — paste into application |
| Open-source / tools documented | ✅ | Same file + `package.json` |
| Significant student contribution | ✅ | Architecture, sources, safety, evals, UX |
| Demo video 1–3 min, **public** YouTube/Vimeo | ⬜ Record | Script below — must be **public**, not unlisted |
| Video includes: names, app name, one-sentence purpose, audience, tools/languages, live demo | ⬜ Record | Checklist in script |
| Application questions answered | ⬜ Draft below | Copy/edit into portal |
| Source available if judges request | ✅ | https://github.com/oliverc08/costa (public) · homepage set to live demo |
| Exit questionnaire after deadline | ⬜ After Oct 26 | Every teammate |

---

## Pre-submit product checklist (winning polish)

- [x] Production URL live: https://costa-five.vercel.app  
- [x] Ask FAQ + paraphrase matching (works without model)  
- [x] Offline Ask guidance when Gateway unavailable  
- [x] Letter photo path + on-device OCR fallback  
- [x] Checkup + My Plan tab  
- [x] Human handoff (incl. ko/pt languages)  
- [x] `/how` judge page  
- [x] MIT `LICENSE` + AI disclosure  
- [x] **GitHub public** with description + homepage → https://github.com/oliverc08/costa  
- [ ] Run `npm run eval` after unlocking AI Gateway (Vercel AI Gateway currently needs a credit card on file for free credits). That writes `public/eval-results.json` for the score on `/how`.  
- [ ] Record **public** demo video (1–3 min) — required; see script above  
- [ ] Fill portal questions; register with **personal** (non-school) email  
- [ ] Strong for winning: 2–3 user-testing quotes from ALAS / Puente / Sacred Heart (see DEMO.md)  

---

## Demo video script (≤ 3:00) — matches CAC required beats

| Time | On screen | Say (include these exact beats) |
| --- | --- | --- |
| 0:00–0:15 | Face or name cards + Costa logo | “I’m [Name(s)], student(s) in California’s 16th district. This is **Costa**.” |
| 0:15–0:30 | One sentence purpose | “Costa helps families who don’t speak English fluently **access Medi-Cal and other benefits** in California’s 16th district.” |
| 0:30–0:40 | Audience | “It’s for parents and workers who get confusing benefits letters and need a next step—without an account.” |
| 0:40–0:55 | Tools | “We built it with **TypeScript, Next.js, React**, on **Vercel**, with the **AI SDK**. Eligibility math is plain TypeScript—not the model.” |
| 0:55–1:25 | Phone: Spanish → Ask / mic | Show FAQ or paraphrase answer with sources. “No account. Verified government sources.” |
| 1:25–1:55 | Letter photo | Deadline + steps. “Photo isn’t saved.” |
| 1:55–2:20 | Plan or handoff | “Save steps, or request a real person.” |
| 2:20–2:45 | `/how` or safety line | “AI explains; it never decides eligibility and never asks immigration status.” |
| 2:45–3:00 | URL | “Try it at costa-five.vercel.app.” |

Upload to YouTube/Vimeo as **Public**. Add English captions if you speak another language on camera.

---

## Draft portal answers (edit in your own voice)

**Use the full copy-paste pack:** [APPLICATION.md](./APPLICATION.md) (questions 1–6, AI disclosure, video script, registration + submit checklists).

**1. Title**  
Costa

**2. Purpose**  
Costa is a free, multilingual benefits navigator that helps families in San Mateo and Santa Clara counties understand Medi-Cal and related programs, explain confusing letters, and connect to local human help—without creating an account.

**3. Inspiration**  
In CA-16 many households speak a language other than English at home, and Medi-Cal renewals and notices are hard even in English. We wanted a language layer that uses official sources and still gets people to a real helper.

**4. Technical difficulty & how you solved it**  
Keeping answers trustworthy when models can hallucinate. We (1) put common questions on a multilingual FAQ with fuzzy matching so many asks never hit the model, (2) require tool-backed sources for open chat, (3) keep eligibility screening in deterministic TypeScript, and (4) audit replies for eligibility claims and invented phones. When cloud AI is down, on-device OCR + heuristics still explain letters.

**5. What you learned**  
That “AI features” are not enough for public benefits—you need product constraints, verified data, and a human path. Also that voice-first UX and offline fallbacks matter more in a live demo than another model call.

**6. What you’d change in 2.0**  
Full UI translations for every supported language, stronger letter PDF support, completed partner user testing across more orgs, and always-on eval scores on the home page after each release.

**AI disclosure (paste or attach):** see [AI-DISCLOSURE.md](./AI-DISCLOSURE.md).

---

## Registration tips (rules §2)

- Use a **personal** email (not school)  
- 9-digit ZIP for home and school  
- Parent/guardian contact required  
- Optional coding teacher/mentor  
- Teams: one person creates the team and invites ≤3 others  

---

## After you submit

1. Do not modify the submission (rules). Keep improving the live site for demos if asked.  
2. Every teammate completes the **Exit Questionnaire**.  
3. Be ready to give judges access to the running app + source (already live; make repo public).  

Questions for the district office: CAC.Liccardo@mail.house.gov
