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

## Build and check locally

```sh
npm install
npm run typecheck
npm run lint
npm run build
npm run build:production
npx playwright install chromium
npm run test:local
npm test
```

`npm run build` creates the static export in `out/`. To serve that build directly, run
`npm run serve:export -- --port 3100` and open http://localhost:3100. The server supports
clean route URLs and files such as `/_next/static/...`. `npm test` serves the existing
`out/` export automatically on port 3100 and runs desktop and mobile browser checks.
Set `NEXT_PUBLIC_API_MODE=mock` and `NEXT_PUBLIC_AUTH_MODE=mock` when building to exercise
the local preview; those are also the browser test server defaults. `npm run test:local`
runs focused Node tests for translation catalogs and static export serving without a browser.

### Production static export

`NEXT_PUBLIC_*` values are compiled into the browser assets during `next build`; changing
hosting environment variables after the build does not change the export. Configure these
values in the build environment for the production Pages project, then run
`npm run build:production`:

```text
NEXT_PUBLIC_API_MODE=real
NEXT_PUBLIC_AUTH_MODE=supabase
NEXT_PUBLIC_API_BASE_URL=https://admitics-ai-worker-production.dr-csrraju.workers.dev
NEXT_PUBLIC_SITE_URL=https://app.admitics.org
NEXT_PUBLIC_SUPABASE_URL=https://hdvbwzsfglexhzqorkml.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<operator-provided Supabase publishable key>
NEXT_PUBLIC_AI_ENABLED=false
NEXT_PUBLIC_DOCUMENTS_ENABLED=false
NEXT_PUBLIC_DOCUMENT_PROCESSING_ENABLED=false
NEXT_PUBLIC_PRODUCT_CONTROLS_ENABLED=false
```

The production command runs `scripts/check-production-env.mjs` before building. It loads
Next.js production `.env*` files and validates the required modes, approved HTTPS URLs,
non-empty publishable key, and disabled initial-release capabilities. It reports variable
names and validation reasons only; it never prints configured values. The existing
`npm run build` remains the generic build command used by isolated preview/test workflows.
Do not use `.env.example` for production: it contains local mock defaults. `.env*` files
are ignored by Git except for that template. Keep private server credentials out of every
`NEXT_PUBLIC_*` variable; Next.js exposes those values in browser bundles. The Supabase
publishable key is intended for browser use and is not a substitute for a private key.

After building, inspect the generated `out/` export before publishing. A static export
freezes these settings into its HTML/JavaScript and cannot consume Pages runtime variables.
Cloudflare Pages must serve clean route URLs and the `public/_headers` security headers;
verify both on the live deployment before release.

### Staging UI capabilities

Set these public build-time presentation flags to `false` in the staging Pages
project environment:

```text
NEXT_PUBLIC_AI_ENABLED=false
NEXT_PUBLIC_DOCUMENTS_ENABLED=false
NEXT_PUBLIC_DOCUMENT_PROCESSING_ENABLED=false
NEXT_PUBLIC_PRODUCT_CONTROLS_ENABLED=false
```

Keep the staging API base URL and Supabase authentication variables in the
staging Pages environment as already configured. These flags only control what
the frontend presents; the Worker remains authoritative for authorization and
feature availability. In mock mode, omitted flags default to enabled so local
preview and browser-test behavior stays intact. In real API mode, omitted flags
default to disabled.

`npm run test:staging-ui` builds temporary mock static exports and tests them
locally without calling staging services. It first builds with all four flags
set to `false`, then builds a second export with Documents enabled and document
processing disabled to verify uploads remain available without processing.

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
