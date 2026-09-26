# Demo, user testing, and submission

The Congressional App Challenge deadline for CA-16 is **Monday, October 26, 2026, 9:00 AM PT**. Aim to submit by **October 24** so there's slack for upload problems.

## Before recording

- [ ] Production deploy on Vercel with AI Gateway, Neon (`db:setup`, `kb:embed`), and Twilio connected
- [ ] Your phone number verified on the Twilio trial (or carrier verification approved)
- [ ] `npm run eval` run once against production models; the landing page shows "Costa Safety Eval: N/150 passing"
- [ ] A real Medi-Cal renewal letter (MC 216) or request-for-information letter (MC 355) with every personal detail covered. Print a blank sample if you don't have one.
- [ ] Partner dashboard signed in on a laptop, queue cleared (or loaded with sample requests)
- [ ] Screen recorder plus a second camera or phone to film the call

## Two-minute demo script

| Time | Show | Say |
| --- | --- | --- |
| 0:00–0:15 | Landing page, switch languages | "In our district, [X]% of people speak a language other than English at home. Medi-Cal renewals, notices, and 2026 rule changes are confusing even in English. Costa is a language layer for benefits." |
| 0:15–0:45 | **Call Costa** on speakerphone. Say in Spanish: "Me llegó un sobre amarillo de Medi-Cal, ¿qué hago?" | Let the answer play. "No app, no account. It answered in Spanish, from the official DHCS source, with the next step." |
| 0:45–1:10 | `/letter`: photo of an MC 355 letter, explained in Vietnamese | Point at the deadline badge and the numbered steps. "It reads the deadline and what the county wants, checks it against verified sources, and the photo is never saved." |
| 1:10–1:25 | Chat: "My Medi-Cal was cut off last month" → "I want to talk to a person" | Show the source chips, then the handoff reference number. |
| 1:25–1:45 | Partner dashboard: the new request appears; click **Assign to me**, open the detail view | "A local organization gets the language, the benefit, a summary, and how to reach them. Nothing else." |
| 1:45–2:00 | Safety section with the eval score | "Costa uses AI for communication, not authority. It never decides eligibility, never asks about immigration status, and removes Social Security numbers. We test it on 150 scenarios in five languages." |

Fill in [X] from the Census Bureau's American Community Survey (table S1601, "Language Spoken at Home," for California's 16th Congressional District at data.census.gov) and cite it in the write-up.

Tips: record each segment separately and cut them together. Keep the phone call real; judges can tell. Add captions in English for the non-English parts.

## User testing with community organizations

Goal: five to eight real users, plus at least one staff member from a partner organization, before October 20.

Organizations to contact (all listed in Costa's directory):

- **ALAS** (Half Moon Bay), 650-560-8947: farmworker families, Spanish
- **Puente de la Costa Sur** (Pescadero), (650) 879-1691: South Coast families, Spanish
- **Sacred Heart Community Service** (San José), (408) 278-2160: Spanish and Vietnamese speakers

Ask for 20 minutes with staff first. Show the dashboard and ask whether the handoff summary gives them what they need. Then ask if one or two clients would try Costa while staff are present.

Session plan (15 minutes per person, in their language, with a staff member or bilingual volunteer):

1. Consent: explain it's a student project, nothing is recorded, and don't use real ID numbers.
2. Task A: "Ask Costa what to do about a renewal letter" (by phone or text, their choice).
3. Task B: "Take a photo of this sample letter and find out the deadline."
4. Task C: "Ask for a person to help you."
5. Ask: What was confusing? Did you trust the answer? Why or why not? Would you use it again?

Record per session: language, channel, whether each task was completed without help, time taken, quotes, and any wrong or confusing answer. Turn every wrong answer into a new eval scenario in `evals/scenarios.ts`.

Put two or three quotes and the task completion rate in the submission write-up.

## Submission checklist

- [ ] Demo video (2–3 minutes) uploaded to YouTube or Vimeo as **Unlisted**
- [ ] Code on GitHub (public or shared with the district office)
- [ ] Write-up: the problem (language access and Medi-Cal churn in CA-16), what Costa does, how it's built, safety approach, eval score, and user-testing results
- [ ] Team member info and grade levels
- [ ] Submit through the official Congressional App Challenge portal for **CA-16 (Rep. Sam Liccardo)** before Oct 26, 9:00 AM PT
