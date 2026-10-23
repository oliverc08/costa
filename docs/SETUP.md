# Costa setup

Costa's default app runs without a cloud model, AI API key, AI Gateway account, database, or Twilio account. Ask uses a multilingual FAQ and a deterministic local agent. Browser letter OCR and local screening are available in the web app.

## 1. Run the web app locally

Use Node.js 22 or newer.

```bash
npm install
npm run dev
```

Open http://localhost:3000. No environment file is required for the basic demo. To make one for optional settings:

```bash
cp .env.example .env.local
```

Run the project checks:

```bash
npm test
npm run eval
```

The evaluation runs against Costa's local deterministic agent and needs no API credentials or AI Gateway.

### Optional local model

To enable model-assisted chat, point the app to an OpenAI-compatible local server, for example Ollama:

```text
COSTA_LOCAL_LLM_URL=http://127.0.0.1:11434/v1
COSTA_CHAT_MODEL=llama3.2:1b
```

Install and start the model server separately, and download a compatible model before using it. This setting points to the address where that server runs. Costa does not route model requests through Vercel AI Gateway.

## 2. Storage and partner dashboard

Without DATABASE_URL, server-side sessions and handoffs use process memory. They are temporary, are not shared reliably between serverless instances, and may disappear on restart. My Plan and checkup data remain in browser localStorage.

For durable sessions and handoffs, configure Neon Postgres, set DATABASE_URL, and run:

```bash
npm run db:setup
```

The partner dashboard is at /partners. In development, the passcode defaults to costa-demo. To enable partner sign-in in production, set both PARTNER_PASSCODE and SESSION_SECRET to private values. Without a production passcode the dashboard is disabled; production signing also fails without SESSION_SECRET.

The repository configures a daily Vercel Cron request for /api/cron/purge. Set CRON_SECRET in the deployment so the request is authorized. The purge deletes sessions older than 30 days and resolved handoffs older than 30 days. It does not remove unresolved handoffs.

## 3. Optional Vercel deployment

The same application can be deployed to Vercel; hosting is not required for local development.

1. Import the repository as a Vercel project.
2. For a working production partner dashboard, configure PARTNER_PASSCODE and SESSION_SECRET.
3. For durable server-side sessions and handoffs, configure DATABASE_URL and run the database setup.
4. To enable the scheduled purge, configure CRON_SECRET.
5. Deploy and check the live app, dashboard sign-in, and persistence behavior you intend to demonstrate.

Do not configure an AI Gateway integration. Costa does not use it.

## 4. Optional integrations

### Twilio

To enable SMS or phone service, configure TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER, and PUBLIC_BASE_URL, then point the Twilio webhooks at /api/sms and /api/voice. Phone recording transcription requires a local model endpoint; the web app remains the simpler demo path.

### Local knowledge-base embeddings

Lexical source search works without a database or embeddings. Optional database-backed embeddings require DATABASE_URL and a compatible local model endpoint; see the kb:embed script for its current requirements.

## 5. Offline behavior

The service worker caches selected app pages. It does not make every feature available offline: Ask routes, letter-text analysis, partner features, and integrations still depend on the running app server.
