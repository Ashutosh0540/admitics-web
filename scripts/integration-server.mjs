// Local-only contract acceptance against the real admitics-ai Worker, D1 and
// private R2. Identity/provider fixtures are not live Supabase or AI services.
import { createServer } from "node:http";
import { generateKeyPairSync, sign, randomUUID } from "node:crypto";
import { execFileSync, spawn } from "node:child_process";
import { existsSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";
import { composedWorkerSource } from "./composed-integration-worker.mjs";

const backend = process.env.ADMITICS_AI_PATH;
if (!backend || !existsSync(join(backend, "src/api/routes/conversations.ts")))
  throw new Error("Set ADMITICS_AI_PATH to the actual admitics-ai repository.");
const root = resolve(import.meta.dirname, "..");
const state = mkdtempSync(join(tmpdir(), "admitics-web-integration-"));
const fixtureOrigin = "http://127.0.0.1:8798";
const apiOrigin = "http://127.0.0.1:8799";
const webOrigin = "http://127.0.0.1:3200";
const { privateKey, publicKey } = generateKeyPairSync("ec", {
  namedCurve: "P-256",
});
const kid = randomUUID();
const jwks = {
  keys: [
    { ...publicKey.export({ format: "jwk" }), kid, alg: "ES256", use: "sig" },
  ],
};
const ids = [
  "11111111-1111-4111-8111-111111111111",
  "22222222-2222-4222-8222-222222222222",
];
const encode = (value) =>
  Buffer.from(JSON.stringify(value)).toString("base64url");
function session(identity = 0, expired = false) {
  const now = Math.floor(Date.now() / 1000);
  const claims = {
    iss: `${fixtureOrigin}/auth/v1`,
    aud: "authenticated",
    sub: ids[identity],
    iat: now - 120,
    exp: expired ? now - 60 : now + 3600,
    role: "authenticated",
    session_id: "33333333-3333-4333-8333-333333333333",
    is_anonymous: false,
    email: `student${identity}@example.test`,
    app_metadata: { provider: "email" },
  };
  const unsigned = `${encode({ alg: "ES256", kid, typ: "JWT" })}.${encode(claims)}`;
  const signature = sign("sha256", Buffer.from(unsigned), {
    key: privateKey,
    dsaEncoding: "ieee-p1363",
  }).toString("base64url");
  return {
    access_token: `${unsigned}.${signature}`,
    refresh_token: "fixture-only-no-refresh",
    token_type: "bearer",
    expires_at: claims.exp,
    expires_in: 3600,
    user: {
      id: ids[identity],
      email: claims.email,
      aud: "authenticated",
      role: "authenticated",
      created_at: new Date().toISOString(),
      app_metadata: claims.app_metadata,
      user_metadata: { name: "Local Student" },
    },
  };
}
const fixture = createServer(async (req, res) => {
  const url = new URL(req.url, fixtureOrigin);
  res.setHeader("Access-Control-Allow-Origin", webOrigin);
  if (req.method === "OPTIONS") {
    res
      .writeHead(204, {
        "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
        "Access-Control-Allow-Headers":
          "authorization,apikey,content-type,x-client-info,x-supabase-api-version",
      })
      .end();
    return;
  }
  if (req.method === "POST" && url.pathname === "/auth/v1/logout") {
    res.writeHead(204).end();
    return;
  }
  if (
    req.method === "GET" &&
    url.pathname === "/auth/v1/.well-known/jwks.json"
  ) {
    res
      .writeHead(200, { "Content-Type": "application/json" })
      .end(JSON.stringify(jwks));
    return;
  }
  // Available only on the local test fixture, never an Admitics API endpoint.
  if (req.method === "GET" && url.pathname === "/test/session") {
    res
      .writeHead(200, {
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      })
      .end(
        JSON.stringify(
          session(
            url.searchParams.get("other") === "true" ? 1 : 0,
            url.searchParams.get("expired") === "true",
          ),
        ),
      );
    return;
  }
  if (
    req.method === "POST" &&
    ["/v1/chat/completions", "/v1/messages"].includes(url.pathname)
  ) {
    let body = "";
    for await (const chunk of req) {
      body += chunk;
      if (body.length > 100000) {
        res.writeHead(413).end();
        return;
      }
    }
    const input = JSON.parse(body);
    const last = input.messages?.at(-1)?.content ?? "";
    if (String(last).includes("[integration:fail]")) {
      res.writeHead(401).end("private-provider-error");
      return;
    }
    if (String(last).includes("[integration:slow]")) await delay(4000);
    const grounded = input.messages?.some((message) =>
      String(message.content).includes('"kind":"retrieved_evidence"'),
    );
    const answer = grounded
      ? JSON.stringify({
          answer: "Synthetic local source response, not admissions advice.",
          citations: ["E1"],
        })
      : "Local contract fixture response. Confirm admission details with the current official notice.";
    const primary = url.pathname === "/v1/chat/completions";
    res.writeHead(200, { "Content-Type": "application/json" }).end(
      JSON.stringify(
        primary
          ? {
              model: "fixture-openai-version",
              choices: [
                {
                  message: { role: "assistant", content: answer },
                  finish_reason: "stop",
                },
              ],
              usage: {
                prompt_tokens: 10,
                completion_tokens: 5,
                total_tokens: 15,
              },
            }
          : {
              model: "fixture-anthropic-version",
              role: "assistant",
              content: [{ type: "text", text: answer }],
              stop_reason: "end_turn",
              usage: { input_tokens: 10, output_tokens: 5 },
            },
      ),
    );
    return;
  }
  res.writeHead(404).end();
});
const processes = [];
let cleaning;
async function cleanup() {
  cleaning ??= (async () => {
    for (const child of processes.reverse()) {
      try {
        child.kill("SIGTERM");
      } catch {
        /* already stopped */
      }
    }
    await delay(1500);
    for (const child of processes) {
      try {
        child.kill("SIGKILL");
      } catch {
        /* already stopped */
      }
    }
    fixture.closeAllConnections();
    fixture.close();
    rmSync(state, { recursive: true, force: true });
  })();
  return cleaning;
}
for (const signal of ["SIGINT", "SIGTERM"])
  process.once(signal, () => void cleanup().then(() => process.exit(0)));
const safeEnv = {
  ...process.env,
  CI: "true",
  WRANGLER_SEND_METRICS: "false",
  CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV: "false",
  CLOUDFLARE_INCLUDE_PROCESS_ENV: "false",
};
const wrangler = join(backend, "node_modules/wrangler/bin/wrangler.js");
try {
  execFileSync(
    process.execPath,
    [
      wrangler,
      "d1",
      "migrations",
      "apply",
      "DB",
      "--config",
      "wrangler.toml",
      "--env=",
      "--local",
      "--persist-to",
      state,
    ],
    { cwd: backend, env: safeEnv, stdio: "pipe", timeout: 60000 },
  );
  // Only this disposable database is altered to make quota denial observable.
  execFileSync(
    process.execPath,
    [
      wrangler,
      "d1",
      "execute",
      "DB",
      "--config",
      "wrangler.toml",
      "--env=",
      "--local",
      "--persist-to",
      state,
      "--command",
      "UPDATE plan_limits SET maximum=5 WHERE plan_id='free' AND metric='messages'",
    ],
    { cwd: backend, env: safeEnv, stdio: "pipe", timeout: 60000 },
  );
  await new Promise((done) => fixture.listen(8798, "127.0.0.1", done));
  const variables = join(state, "fixture.vars");
  writeFileSync(
    variables,
    [
      "APP_ENV=local",
      `SUPABASE_URL=${fixtureOrigin}`,
      `CORS_ALLOWED_ORIGINS=${webOrigin}`,
      "DOCUMENTS_ENABLED=true",
      "DOCUMENT_PROCESSING_ENABLED=false",
      "PRODUCT_CONTROLS_ENABLED=true",
      "AI_ENABLED=true",
      "RAG_ENABLED=false",
      "AI_PRIMARY_PROVIDER=openai",
      "AI_PRIMARY_MODEL=fixture-openai",
      "AI_FALLBACK_PROVIDER=anthropic",
      "AI_FALLBACK_MODEL=fixture-anthropic",
      "OPENAI_API_KEY=fixture-only-openai",
      "ANTHROPIC_API_KEY=fixture-only-anthropic",
      `AI_OPENAI_BASE_URL=${fixtureOrigin}`,
      `AI_ANTHROPIC_BASE_URL=${fixtureOrigin}`,
      "AI_TIMEOUT_MS=6000",
    ].join("\n"),
    { mode: 0o600 },
  );
  const worker = spawn(
    process.execPath,
    [
      wrangler,
      "dev",
      "--config",
      "wrangler.toml",
      "--env=",
      "--local",
      "--persist-to",
      state,
      "--port",
      "8799",
      "--inspector-port",
      "0",
      "--env-file",
      variables,
      "--var",
      `SUPABASE_URL:${fixtureOrigin}`,
      "--var",
      `CORS_ALLOWED_ORIGINS:${webOrigin}`,
      "--var",
      "DOCUMENTS_ENABLED:true",
      "--var",
      "PRODUCT_CONTROLS_ENABLED:true",
      "--var",
      "AI_ENABLED:true",
    ],
    {
      cwd: backend,
      env: { ...safeEnv, CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV: "true" },
      stdio: "pipe",
    },
  );
  processes.push(worker);
  worker.stdout.resume();
  worker.stderr.resume();
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try {
      ready = (await fetch(`${apiOrigin}/api/v1/health`)).ok;
    } catch {
      /* starting */
    }
    if (ready) break;
    await delay(300);
  }
  if (!ready) throw new Error("The local Worker did not start.");
  const composedState = join(state, "composed");
  execFileSync(
    process.execPath,
    [
      wrangler,
      "d1",
      "migrations",
      "apply",
      "DB",
      "--config",
      "wrangler.toml",
      "--env=",
      "--local",
      "--persist-to",
      composedState,
    ],
    { cwd: backend, env: safeEnv, stdio: "pipe", timeout: 60000 },
  );
  const entry = join(state, "composed-worker.ts");
  writeFileSync(entry, composedWorkerSource(backend));
  const composed = spawn(
    process.execPath,
    [
      wrangler,
      "dev",
      entry,
      "--config",
      "wrangler.toml",
      "--env=",
      "--local",
      "--persist-to",
      composedState,
      "--port",
      "8800",
      "--inspector-port",
      "0",
      "--env-file",
      variables,
      "--var",
      `SUPABASE_URL:${fixtureOrigin}`,
      "--var",
      `CORS_ALLOWED_ORIGINS:${webOrigin}`,
      "--var",
      "DOCUMENTS_ENABLED:true",
      "--var",
      "PRODUCT_CONTROLS_ENABLED:true",
      "--var",
      "AI_ENABLED:true",
      "--var",
      "RAG_ENABLED:true",
    ],
    {
      cwd: backend,
      env: { ...safeEnv, CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV: "true" },
      stdio: "pipe",
    },
  );
  processes.push(composed);
  composed.stdout.resume();
  composed.stderr.resume();
  ready = false;
  for (let i = 0; i < 100; i++) {
    try {
      ready = (await fetch("http://127.0.0.1:8800/api/v1/health")).ok;
    } catch {
      /* starting */
    }
    if (ready) break;
    await delay(300);
  }
  if (!ready)
    throw new Error("The composed local fixture Worker did not start.");
  const frontend = spawn(
    process.execPath,
    [
      join(root, "node_modules/next/dist/bin/next"),
      "dev",
      "--hostname",
      "127.0.0.1",
      "--port",
      "3200",
    ],
    {
      cwd: root,
      stdio: "pipe",
      env: {
        ...process.env,
        NEXT_PUBLIC_API_MODE: "real",
        NEXT_PUBLIC_AUTH_MODE: "supabase",
        NEXT_PUBLIC_API_BASE_URL: apiOrigin,
        NEXT_PUBLIC_SUPABASE_URL: fixtureOrigin,
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "fixture-only-public-key",
        NEXT_PUBLIC_SITE_URL: webOrigin,
      },
    },
  );
  processes.push(frontend);
  frontend.stdout.resume();
  frontend.stderr.resume();
  frontend.once("exit", () => void cleanup().then(() => process.exit(1)));
  console.log(
    "Local integration: real Worker/D1/R2 + fixture identity and AI provider; live Supabase is not tested.",
  );
} catch (error) {
  await cleanup();
  throw error;
}
