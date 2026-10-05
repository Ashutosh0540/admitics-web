# Local backend integration — actual contract

Backend inspected: `/Users/ashutosh3063/Desktop/admitics-ai` (the supplied
`/Users/ashutosh3063/admitics-ai` path does not exist). References:
`src/api/routes/{auth,conversations,documents,product}.ts`, `docs/api.md`,
`docs/authentication.md`, `src/documents/presentation.ts`, and `src/usage/index.ts`.
The frozen architecture remains the product/system boundary. Existing backend
implementation is the wire authority for local integration; unimplemented frozen
architecture targets are recorded below, not simulated.

## Common wire rules

- All protected calls use a current Supabase user access token in `Authorization:
  Bearer …`. No API cookies, refresh tokens, or publishable key are sent to the Worker.
- Success: `{success:true,data:…}`. Error:
  `{success:false,error:{code,message,requestId}}`. Partial AI failure also includes
  `data.userMessageId`. HTTP 204 has no body.
- IDs are positive safe integers; timestamps are UTC Unix seconds. The real adapter
  normalizes these into string IDs and ISO dates for the existing frontend models.
- List queries permit only `limit` (1–100, default 50) and an exclusive numeric
  `cursor`. Conversations/documents are newest-ID-first; messages are oldest-ID-first.
  `nextCursor` is numeric or null. The adapter follows every page and rejects a
  repeated cursor rather than silently truncating history.
- Unknown/duplicate queries and writable JSON fields are rejected. JSON is bounded
  to 64 KiB; titles are 1–200 code points, messages 1–8,000 code points.
- Exact-origin CORS is required. Message preflights permit `Idempotency-Key`.
  Upload preflights additionally permit document filename/display name/hash headers.
- There is **no streaming endpoint**. Real chat yields one complete JSON result;
  mock mode keeps its simulated stream.

## Operation matrix

All operations below require a verified bearer. GET resources also support HEAD.

| Frontend operation | Actual method/path | Request | Successful `data` |
| --- | --- | --- | --- |
| Create conversation | POST `/api/v1/conversations` | `{title?}` | `{conversation}`; 201 |
| List conversations | GET `/api/v1/conversations` | `limit,cursor` | `{conversations,nextCursor}` |
| Get conversation | GET `/api/v1/conversations/:id` | None | `{conversation}` |
| Rename conversation | PATCH `/api/v1/conversations/:id` | `{title}` | `{conversation}` |
| Delete conversation | DELETE `/api/v1/conversations/:id` | Empty | 204; cascades messages |
| List messages | GET `/api/v1/conversations/:id/messages` | `limit,cursor` | `{messages,nextCursor}` |
| Send message | POST `/api/v1/conversations/:id/messages` | `{content,role?:"user"}`; optional idempotency header | `{message,assistantMessage?,ai?,knowledge?}`; 201 |
| Verify identity | GET `/api/v1/auth/me` | None | `{user:{id,email,role,provider}}` |
| Get usage | GET `/api/v1/usage` | None | `{usage:{periodStart,periodEnd,limits,used}}` |
| Upload document | POST `/api/v1/documents/upload` | Raw bytes and upload headers | `{document,deduplicated}`; 201 |
| List documents | GET `/api/v1/documents` | `limit,cursor` | `{documents,nextCursor}` |
| Get document | GET `/api/v1/documents/:id` | None | `{document}` |
| Process document | POST `/api/v1/documents/:id/process` | Empty | `{document,queued:true}`; 202 |
| Retry failed document | POST `/api/v1/documents/:id/retry` | Empty | `{document,queued:true}`; 202 |
| Delete document | DELETE `/api/v1/documents/:id` | Empty | 204; repeat owned tombstone deletion succeeds |

Conversation projection: `id,userId,title,createdAt,updatedAt`.
Message projection: `id,conversationId,role,content,createdAt`.
No `documentIds`, automatic title, `lastMessage`, or conversation object is returned
with a message result. AI-disabled success is a saved user message, not an answer.

Upload uses exact MIME `text/plain`, `application/pdf`, or
`application/vnd.openxmlformats-officedocument.wordprocessingml.document`; filename
must be a matching safe basename. `X-Document-Filename` is required;
`X-Document-Display-Name` and `X-Document-SHA256` are optional. Multipart and signed
direct uploads are not supported. The frontend's MIME choices reflect this technical
format contract, **not an advertised plan**; a server-configured MIME subset can
still deny a format with 415. `/usage` does not expose that MIME subset.

Document projection: `id,filename,displayName,mimeType,sizeBytes,status,
statusDescription,canRetry,failureMessage,pageCount,characterCount,chunkCount,
failureCode,createdAt,updatedAt,processedAt,deletedAt`.
States: `UPLOADING,UPLOADED,PROCESSING,READY,FAILED,DELETING,DELETED`.
`PARSE_FAILED` is a **failure code on FAILED**, not a lifecycle state.
Permanent parsing/format/size failures cannot retry; transient failures can retry
only when `canRetry:true` and a queue is composed. READY means processed, not verified.

Usage is daily UTC counters plus document/storage stock. Limits include
`messages,generations,retrievals,embeddings,ingestion_attempts,documents,file_bytes,
storage_bytes`. No subscription name or pricing is returned. The frontend labels
this “Current limits” and uses `messages` as questions sent, not assistant responses.
Usage requires `PRODUCT_CONTROLS_ENABLED=true`. Documents require
`DOCUMENTS_ENABLED=true`; processing additionally needs its runtime/bindings.
An application user must already exist for usage/uploads; creating a validated
conversation is the backend's provisioning path. Reads do not provision users.

## Recovery and errors

- Real message requests send the same caller-generated `Idempotency-Key` when
  explicitly replayed. Keys bind normalized content and conversation only with
  `PRODUCT_CONTROLS_ENABLED=true`. Without that flag, the backend ignores the key.
- Complete replay returns the original result without generation or another charge.
  Changed content with a used key or an active turn returns 409. Failed/uncertain keys
  return the saved-turn failure; they are not an AI regeneration endpoint.
- The real UI never automatically repeats a failed/cancelled POST. It reloads canonical
  history and offers a reload. Disconnecting/stopping the browser does not undo a
  committed turn or guarantee server-side cancellation. Creation and uploads have no
  general idempotency contract; refresh state before repeating an uncertain mutation.
- 401 asks for sign-in; 403 reports lack of access; missing/foreign resources both
  return 404; 409 requests a refresh; 429 reports the limit; 5xx preserves the session
  and offers recovery. Timeouts/network failures have fixed messages. Raw SQL,
  provider messages, arbitrary error text, stack traces, and payloads are never rendered.
- `AI_GENERATION_FAILED`/`AI_PERSISTENCE_FAILED` preserve the saved-message ID as
  sanitized metadata. The UI reloads rather than treating them as unsaved questions.

## Sources and remaining wire gaps

POST `data.knowledge` includes `status,answerVerification,citations`. Citation records
contain backend-supplied source/document/chunk attribution, URL, trust, verification,
and assessment. The mapper only renders those records; it does not infer verified
sources from model prose or fabricate URLs/dates. Backend `not_evaluated` is not a
factual correctness claim.

| Frontend/frozen expectation | Backend reality | Required action |
| --- | --- | --- |
| Frozen `/api/v1/me` application profile | Only `/api/v1/auth/me` identity exists; no name/createdAt/profile projection | Use verified identity now. Confirm/add an application-profile endpoint if required; display-name editing remains Supabase identity metadata. |
| Explicit selected document IDs per question | Message body accepts only content and optional user role | Keep preview selection; reject selected-document sends in real mode. Backend must add a validated owned-document selection contract before enabling it. Automatic owner-scoped retrieval is distinct. |
| Structured source cards when reloading history | GET messages contains plain content; RAG appends a serialized snapshot to assistant text | Preserve historical text; request a structured history-knowledge projection. Do not promote arbitrary message text into verified source cards. |
| General real chat retry/streaming | Complete JSON; idempotency only under controls; failed keys do not regenerate | Use history reload and explicit acknowledgement recovery. Streaming/regeneration needs separate approved contracts. |
| Usage plan/MIME policy metadata | Daily limits/stock only, no pricing/plan name or configured MIME subset | Display technical limits; optionally extend upload-policy projection after backend agreement. |
| GET `/api/v1/exams` and `/api/v1/exams/:slug` | No registered routes | Keep clearly labelled exam demo records in both modes. Backend needs reviewed exam directory/detail models, source provenance, cycle dates, pagination/filtering, and verification semantics. |
| Eligibility decision service | No engine or endpoint | Collect structured education/percentage/stream/year/category/exam-specific inputs; no frontend eligibility calculation. Agree an endpoint/request including exam/cycle and a result with status, reasons, missing fields, evaluated rules and authoritative source provenance before wiring it. |
| Bookmark persistence | No bookmark endpoint | Current exam bookmarks remain browser-local preview state. |

## Authentication acceptance

The official Supabase browser SDK uses PKCE, one explicit callback exchange,
persisted/auto-refreshed sessions, and local-scope logout. Recovery returns through
`/auth/callback?next=%2Freset-password`. Auth parameters are removed from browser
history before exchange. Provider errors are mapped to fixed student-facing messages.
Worker verification accepts ES256/RS256 user-session tokens; legacy HS256 is unsupported.

**Live signup/confirmation, password login, Google success/cancel, recovery email,
and reset-password acceptance require staging/client infrastructure.** No live
Supabase project values or real provider credentials are configured or requested
for this milestone.

## Repeat local acceptance

```sh
npm run build
npm run lint
npm run typecheck
npm test
ADMITICS_AI_PATH="/path/to/actual/admitics-ai" npm run test:integration
```

Final local validation (6 October 2026): production build, lint and typecheck
passed; the frontend regression/adapter suite passed **36 tests**, and the local
Worker integration suite passed **6 tests**. The latter covers conversation CRUD,
idempotent replay/conflict, ownership, raw uploads, usage/quota denial, expired
identity, partial persistence, timeout/cancellation recovery, browser session
restoration/logout, document processing/retry, and backend-derived citations.
These results complete local contract acceptance; live authentication/provider
acceptance and the backend features listed above remain outstanding.

Stop other Next development servers for this workspace first. The integration
harness uses ports 3200, 8798, 8799 and 8800, fresh disposable local D1/R2,
ephemeral in-memory ES256 signing keys, loopback JWKS/provider fixtures, and the
real backend entrypoint. A second test-only composition uses the backend's existing
document services/parsers/local embedding/vector adapters to exercise READY,
PARSE_FAILED, transient retry and source/citation contracts. It is not installed
as production knowledge or a production processor. Fixture sessions are never
recorded in screenshots/traces or printed. No backend source is modified.

The normal backend was also run locally at `127.0.0.1:8787`; liveness, 401 and 404
were observed. With checked-in empty auth values and disabled feature flags, that
instance cannot prove live authenticated/provider acceptance. Staging acceptance
still requires correct CORS/redirect origins, asymmetric Supabase signing, enabled
controls/documents/processing, approved providers, bindings and reviewed knowledge.
