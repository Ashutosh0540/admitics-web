# Admitics Web

The new Admitics frontend, built against `Admitics_Final_Frozen_Architecture.md` (2026-10-05). Next.js App Router, TypeScript, Tailwind CSS; Supabase handles identity. The separate `admitics-ai` API owns application authorization, AI, persistence, and document processing.

## Develop

```sh
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000. Default adapters are clearly labeled **local preview**. Mock conversations and file metadata persist in browser local storage, scoped to the preview identity. Mock credentials are not verified or saved; use made-up values. Files are not read, uploaded, or analyzed. A filename containing `fail` demonstrates a failed document state; a question containing `[demo:error]` demonstrates a retryable chat error. Clear site data to reset all preview data. Feedback is session-local until a backend contract is provided.

## Connect the existing backend

Set `NEXT_PUBLIC_API_MODE=real`, `NEXT_PUBLIC_AUTH_MODE=supabase`, `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Only public Supabase configuration belongs here. Set `NEXT_PUBLIC_SITE_URL` for canonical and social URLs. Environment changes require a restart/rebuild.

`lib/api/contracts.ts` defines frontend domain interfaces. `lib/api/real.ts` maps the inspected `admitics-ai` API: success envelopes, cursor pagination, numeric IDs/Unix timestamps, complete JSON chat results, raw binary uploads, process/retry lifecycle, and daily usage limits. Real failures reload history rather than automatically repeating potentially committed messages. Mock mode retains its simulated stream and browser-local persistence. See [the operation matrix and remaining contract gaps](./docs/backend-integration.md). Exam routes and an eligibility engine do not exist in the backend; exams remain explicitly demo data, and the eligibility form collects inputs without calculating a decision.

In Supabase, enable the intended providers and authorize the frontend `/auth/callback` and `/reset-password` redirect URLs. Auth uses browser PKCE. Bearer tokens go only to the configured Admitics API. There are no frontend API routes, LLM credentials, storage credentials, databases, or AI orchestration.

## Check

```sh
npm run typecheck
npm run lint
npm run format:check
npm run build
npx playwright install chromium
npm test
```

Browser tests start a local production server (port 3100), exercise desktop/mobile flows, inspect navigation, overflow and console errors, and cover preview persistence, retry, documents, authentication, and content. Build with preview modes for these tests; the test server exports them explicitly as well.

Real local acceptance uses `ADMITICS_AI_PATH="/path/to/admitics-ai" npm run test:integration`.
This runs actual Worker/D1/R2 and real-adapter browser flows with ephemeral signed
identity and loopback provider fixtures. It does not prove live Supabase/Google,
email delivery, or live provider acceptance. Other development servers for this
workspace must be stopped before that command.

## Structure

- `app/`: server-rendered pages, metadata, route loading/error boundaries; `/chat` has a full-screen layout.
- `components/`: focused interactive product surfaces and shared UI primitives.
- `lib/api/`: typed adapter interface, HTTP client, validation, isolated mock and real implementations.
- `lib/auth/`: preview and Supabase identity adapters.
- `lib/content/`: replaceable content repository with a small starter collection.
- `types/`: shared domain contracts.

Before public launch: validate the real API/auth/document flows against staging, replace starter content with reviewed content, finalize support contact and legal drafts, and approve production configuration.
