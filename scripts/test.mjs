import { spawnSync } from "node:child_process";

const packageManager = process.platform === "win32" ? "npm.cmd" : "npm";
const testEnvironment = { ...process.env };

// NEXT_PUBLIC_* values are compiled into static exports. Scrub inherited
// production settings before creating the preview export used by browser tests.
for (const key of Object.keys(testEnvironment)) {
  if (key.startsWith("NEXT_PUBLIC_")) delete testEnvironment[key];
}

Object.assign(testEnvironment, {
  NEXT_PUBLIC_API_MODE: "mock",
  NEXT_PUBLIC_AUTH_MODE: "mock",
  NEXT_PUBLIC_API_BASE_URL: "",
  NEXT_PUBLIC_SITE_URL: "http://127.0.0.1:3100",
  NEXT_PUBLIC_SUPABASE_URL: "",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
  NEXT_PUBLIC_AI_ENABLED: "true",
  NEXT_PUBLIC_DOCUMENTS_ENABLED: "true",
  NEXT_PUBLIC_DOCUMENT_PROCESSING_ENABLED: "true",
  NEXT_PUBLIC_PRODUCT_CONTROLS_ENABLED: "true",
});

function run(args) {
  const result = spawnSync(packageManager, args, {
    env: testEnvironment,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run(["run", "build"]);
run(["exec", "playwright", "test"]);
