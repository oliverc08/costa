# Demo and submission preparation

Use the canonical checklist in SUBMISSION.md and verify every current requirement in the official portal before submitting. This file is a practical run sheet; it is not evidence that a video, user test, or submission has been completed.

## Local run-through

From the project root, start the default app:

```bash
npm install
npm run dev
```

Open http://localhost:3000. The default run does not need AI credentials or an AI Gateway account.

Before recording, walk through these paths on the device you will show:

- [ ] Choose one supported language and confirm the visible labels are understandable.
- [ ] Ask a common question using a FAQ suggestion; confirm the response displays its source.
- [ ] Try one typed question that is not in the FAQ; confirm the local agent returns a useful, grounded response.
- [ ] Open the Checkup and My Plan paths; explain that screening is guidance and saved plan details stay in browser storage.
- [ ] Try the letter path with a fabricated or fully redacted sample. OCR is performed in the browser, redacted extracted text is sent to the app server, and the server redacts it again before analysis. Redaction may miss details; do not use an unredacted real benefits letter.
- [ ] If showing a person handoff, configure and test partner sign-in and storage first. Without DATABASE_URL, handoffs are temporary process memory and are unsuitable for a durable shared queue.
- [ ] Run npm run eval and review any failures. The evaluation uses the local deterministic agent and needs no AI Gateway.

For the hosted app, check the same paths on the actual deployment. If demonstrating partner handoff, verify the production PARTNER_PASSCODE and SESSION_SECRET, durable storage if required, and the partner dashboard before recording.

## Video run sheet

The 2026 CAC instructions call for a 1–3 minute video; verify the current portal instructions before upload. Make it public on the required hosting service and include the participants' actual names, app name, purpose, target audience, tools/languages, and a live demonstration. Do not publish unapproved personal details from a real user or partner.

Suggested two-minute sequence:

| Time | Show | Say |
| --- | --- | --- |
| 0:00–0:15 | Participants and app | Each participant gives their real name; introduce Costa. |
| 0:15–0:30 | Home screen | Explain the app's purpose and who it is for, in your own words. |
| 0:30–0:45 | Language picker | Show the language the team can comfortably present. |
| 0:45–1:10 | Ask | Ask a common question and point out its source. Explain the default local FAQ/agent path. |
| 1:10–1:30 | Checkup or Plan | Show the screening guidance and local saved steps. |
| 1:30–1:50 | Redacted sample letter | Show OCR and the resulting explanation; do not use private information. |
| 1:50–2:00 | How page / links | Explain that the default app does not use a cloud AI Gateway and eligibility is code. |

Before uploading:

- [ ] Video is between 1 and 3 minutes and plays from a signed-out browser.
- [ ] Every team member's name and role is accurate.
- [ ] The video names Costa, its purpose, audience, tools/languages, and shows the working app.
- [ ] Public visibility and captions meet the portal instructions.
- [ ] The video does not show real personal data or unapproved participant information.
- [ ] Add the final video URL to the portal and the application draft.

## Optional user feedback

If the team conducts user testing, first get informed consent and permission to quote. Record the date, number and type of participants, what they tried, what changed, and whether a quote may be used publicly. Do not list an organization as a partner or claim endorsement without its permission. The team can consider organizations such as ALAS, Puente de la Costa Sur, or Sacred Heart Community Service; no outreach or testing is implied by this list.

## Current submission tasks

- [ ] Confirm eligibility and roster details with each entrant and guardian.
- [ ] Verify the deadline and all video/file requirements in the official portal and district instructions.
- [ ] Review the AI and third-party tools disclosure with every entrant.
- [ ] Replace draft application language with the team's own accurate account.
- [ ] Record and publish the required video.
- [ ] Complete the portal application and retain confirmation.

See SUBMISSION.md for official links and the full checklist.
