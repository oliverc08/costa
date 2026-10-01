# Costa setup

Costa is **local-first**. You can run the full web demo with **no cloud LLM and no AI Gateway**. Ask uses a deterministic agent (FAQ + lexical knowledge search). Letters use on-device OCR. Optional: small local models via Ollama.

Twilio and Vercel billing accounts must be owned by an adult (parent or teacher) if you use those services.

## 1. Local development

```bash
cp .env.example .env.local
npm install
npm run dev
```

Optional in `.env.local` for freer chat with a tiny local model:

```bash
# After: brew install ollama && ollama pull llama3.2:1b
COSTA_LOCAL_LLM_URL=http://127.0.0.1:11434/v1
COSTA_CHAT_MODEL=llama3.2:1b
```

Without `DATABASE_URL`, sessions and handoffs live in memory and reset when the server restarts.
Without `COSTA_LOCAL_LLM_URL`, Ask still works via the local agent; letters use on-device OCR on the web.

```bash
npm test          # unit tests, no keys
npm run eval      # 150-scenario local safety eval, no keys
```

The partner dashboard is at `/partners`. Passcode defaults to `costa-demo` in development (`PARTNER_PASSCODE` in `.env.example`). **Set `PARTNER_PASSCODE` and `SESSION_SECRET` on Vercel** so judges can open `/partners` and use “Load sample requests”.

## 2. Vercel deploy

1. Import this repo as a Vercel project.
2. Add `PARTNER_PASSCODE`, `SESSION_SECRET` (long random string), and `CRON_SECRET`.
3. Do **not** configure AI Gateway — Costa does not use it.
4. Deploy. Live demo: your `*.vercel.app` URL.

## 3. Neon Postgres (optional)

1. In Vercel **Storage**, create **Neon**, connect it (`DATABASE_URL`).
2. `npm run db:setup`
3. Optional embeddings with a local embed model: set `COSTA_LOCAL_LLM_URL` and `npm run kb:embed`

Lexical search works without embeddings.

## 4. Twilio (optional)

1. Create a Twilio account and buy a US number with SMS, MMS, and Voice.
2. Set `TWILIO_*` and `PUBLIC_BASE_URL` to your deployed URL.
3. Point Twilio webhooks at `/api/sms` and `/api/voice`.
4. Phone/SMS letter vision needs `COSTA_LOCAL_LLM_URL`; otherwise point users to the web OCR path.

## 5. PWA / offline

The service worker at `/sw.js` caches the app shell (home, Ask, Help, etc.). API routes are never cached.
