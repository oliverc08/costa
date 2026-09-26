# Costa setup

Costa runs locally with only an AI Gateway key. Everything else (database, SMS, voice) is optional until you deploy.

Twilio and Vercel billing accounts must be owned by an adult (parent or teacher).

## 1. Local development

```bash
cp .env.example .env.local
# fill in AI_GATEWAY_API_KEY at minimum
npm install
npm run dev
```

Without `DATABASE_URL`, sessions and handoffs live in memory and reset when the server restarts.
Without an AI Gateway key, retrieval falls back to keyword search, and anything needing the model (chat, letters, evals) returns a clear configuration error.

Scripts (`db:setup`, `kb:embed`, `eval`) read `.env.local`, then `.env`.

The partner dashboard is at `/partners`. In development the passcode is `costa-demo` unless `PARTNER_PASSCODE` is set; in production the dashboard stays disabled until you set it. An empty queue shows a "Load sample requests" button for demos.

## 2. Vercel + AI Gateway

1. Create a Vercel account and import this repo as a project.
2. Enable **AI Gateway** for the project. Deployments authenticate automatically with OIDC; locally, `npx vercel env pull .env.local` gives you a short-lived OIDC token (re-pull when it expires). An `AI_GATEWAY_API_KEY` also works if you prefer a static key.
3. Add `PARTNER_PASSCODE`, `SESSION_SECRET` (a long random string, required in production: it signs partner cookies and hashes phone numbers), and `CRON_SECRET` (Vercel Cron sends it to `/api/cron/purge` daily).
4. Pull env vars locally: `npx vercel link && npx vercel env pull .env.local`.

## 3. Neon Postgres (pgvector)

1. In Vercel, go to **Storage**, then **Create Database**, then choose **Neon**, and connect it to the project. This sets `DATABASE_URL`.
2. Apply the schema: `npm run db:setup` (safe to re-run; do it after pulling schema changes)
3. Embed the verified sources: `npm run kb:embed`

Re-run `kb:embed` every time you edit `content/sources/*.md`.

## 4. Twilio (do this on day 1)

1. Create a Twilio account and buy a US phone number with SMS, MMS, and Voice.
2. **Start carrier verification immediately.** For a toll-free number, submit toll-free verification. For a local number, register A2P 10DLC (brand plus campaign). Approval can take weeks. Until then, a trial account can only text verified numbers, which is fine for the demo.
3. On the phone number's configuration page:
   - Messaging webhook (HTTP POST): `https://YOUR-DOMAIN/api/sms`
   - Voice webhook (HTTP POST): `https://YOUR-DOMAIN/api/voice`
4. Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, and `PUBLIC_BASE_URL` (your production URL, used for signature validation).
5. Keep Twilio's **Advanced Opt-Out** on (Messaging → Settings). Costa stays silent for STOP/HELP/START so Twilio's compliant replies are the only ones sent.
6. For local testing, expose your dev server with a tunnel (for example `npx localtunnel --port 3000`), point the webhooks at the tunnel URL, and set `PUBLIC_BASE_URL` to that URL so signatures validate.

How the phone channels work:

- **SMS**: replies are sent through the Twilio REST API after the webhook returns, so long answers never hit Twilio's 15-second timeout. Texting a photo of a letter runs the same letter explainer as the website; the photo is deleted from Twilio after it's read.
- **Voice**: the caller hears a short greeting in five languages. Pressing 1–5 picks a language; otherwise they just talk, and Whisper detects the language. Each answer is computed in the background and picked up by `/api/voice/answer`, so the caller hears "one moment" instead of silence. Recordings are deleted right after transcription.

Without Twilio credentials, `/api/sms` answers inline as TwiML, so you can test it with curl:

```bash
curl -X POST localhost:3000/api/sms -d From=+16505550100 -d "Body=¿Cómo renuevo mi Medi-Cal?" -d NumMedia=0
```

## 5. Verify

```bash
npm test          # deterministic unit tests (no keys needed)
npm run eval      # 150-scenario safety eval (needs AI Gateway access)
```

`npm run eval` accepts `--lang es`, `--intent mc-renew-yellow`, `--limit 10`, and `--concurrency 4`. Only a full 150-scenario run updates `public/eval-results.json`, which the landing page shows as "Costa Safety Eval: N/150 passing". Detailed results go to `evals/results/` (git-ignored).
