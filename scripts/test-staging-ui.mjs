import { spawnSync } from "node:child_process";

function run(command, args, env) {
  const result = spawnSync(command, args, {
    env,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

const baseEnv = {
  ...process.env,
  NEXT_PUBLIC_API_MODE: "mock",
  NEXT_PUBLIC_AUTH_MODE: "mock",
  NEXT_PUBLIC_AI_ENABLED: "false",
  NEXT_PUBLIC_DOCUMENTS_ENABLED: "false",
  NEXT_PUBLIC_DOCUMENT_PROCESSING_ENABLED: "false",
  NEXT_PUBLIC_PRODUCT_CONTROLS_ENABLED: "false",
};

console.log("Building staging UI export with all four capabilities disabled.");
run("npm", ["run", "build", "--", "--webpack"], baseEnv);
run(
  "npx",
  [
    "playwright",
    "test",
    "--config",
    "playwright.staging.config.ts",
    "--grep-invert",
    "document processing disabled still permits uploads",
  ],
  { ...baseEnv, STAGING_TEST_PROFILE: "all-disabled" },
);

const processingEnv = {
  ...baseEnv,
  NEXT_PUBLIC_DOCUMENTS_ENABLED: "true",
};
console.log(
  "Building a separate export with documents enabled and document processing disabled.",
);
run("npm", ["run", "build", "--", "--webpack"], processingEnv);
run(
  "npx",
  [
    "playwright",
    "test",
    "--config",
    "playwright.staging.config.ts",
    "--grep",
    "document processing disabled still permits uploads",
  ],
  { ...processingEnv, STAGING_TEST_PROFILE: "processing" },
);
