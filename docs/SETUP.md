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

## 2. Vercel + AI Gateway

1. Create a Vercel account and import this repo as a project.
2. In the Vercel dashboard, open **AI Gateway**, create an API key, and add it as `AI_GATEWAY_API_KEY`. On Vercel deployments, OIDC auth also works automatically.
3. Add `PARTNER_PASSCODE`, `SESSION_SECRET` (a long random string), and `CRON_SECRET`.
4. Pull env vars locally: `npx vercel link && npx vercel env pull .env.local`.

## 3. Neon Postgres (pgvector)

1. In Vercel, go to **Storage**, then **Create Database**, then choose **Neon**, and connect it to the project. This sets `DATABASE_URL`.
2. Apply the schema: `npm run db:setup`
3. Embed the verified sources: `npm run kb:embed`

Re-run `kb:embed` every time you edit `content/sources/*.md`.

## 4. Twilio (do this on day 1)

1. Create a Twilio account and buy a US phone number with SMS, MMS, and Voice.
2. **Start carrier verification immediately.** For a toll-free number, submit toll-free verification. For a local number, register A2P 10DLC (brand plus campaign). Approval can take weeks. Until then, a trial account can only text verified numbers, which is fine for the demo.
3. On the phone number's configuration page:
   - Messaging webhook (HTTP POST): `https://YOUR-DOMAIN/api/sms`
   - Voice webhook (HTTP POST): `https://YOUR-DOMAIN/api/voice`
4. Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`, and `PUBLIC_BASE_URL` (your production URL, used for signature validation).
5. For local testing, expose your dev server with a tunnel (for example `npx localtunnel --port 3000`) and point the webhooks at the tunnel URL.

## 5. Verify

```bash
npm test          # deterministic unit tests (no keys needed)
npm run eval      # 150-scenario safety eval (needs AI_GATEWAY_API_KEY)
```
