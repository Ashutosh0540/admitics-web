import assert from "node:assert/strict";
import test from "node:test";
import { validateProductionEnvironment } from "../../scripts/production-env-validation.mjs";

const productionEnvironment = {
  NEXT_PUBLIC_API_MODE: "real",
  NEXT_PUBLIC_AUTH_MODE: "supabase",
  NEXT_PUBLIC_API_BASE_URL:
    "https://admitics-ai-worker-production.dr-csrraju.workers.dev",
  NEXT_PUBLIC_SITE_URL: "https://app.admitics.org",
  NEXT_PUBLIC_SUPABASE_URL: "https://hdvbwzsfglexhzqorkml.supabase.co",
  // Structural test fixture only; this does not verify a live Supabase key.
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "fixture-key-for-validator-test",
  NEXT_PUBLIC_AI_ENABLED: "false",
  NEXT_PUBLIC_DOCUMENTS_ENABLED: "false",
  NEXT_PUBLIC_DOCUMENT_PROCESSING_ENABLED: "false",
  NEXT_PUBLIC_PRODUCT_CONTROLS_ENABLED: "false",
};

test("production environment validator accepts the required release contract", () => {
  assert.deepEqual(validateProductionEnvironment(productionEnvironment), []);
});

test("production environment validator requires all ten variables", () => {
  for (const name of Object.keys(productionEnvironment)) {
    const environment = { ...productionEnvironment };
    delete environment[name];

    assert.ok(
      validateProductionEnvironment(environment).some((error) =>
        error.startsWith(`${name} `),
      ),
      `${name} should be required`,
    );
  }
});

test("production environment validator rejects preview modes and URLs", () => {
  const errors = validateProductionEnvironment({
    ...productionEnvironment,
    NEXT_PUBLIC_API_MODE: "mock",
    NEXT_PUBLIC_AUTH_MODE: "mock",
    NEXT_PUBLIC_API_BASE_URL: "http://localhost:8787",
    NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    NEXT_PUBLIC_SUPABASE_URL: "https://other-project.supabase.co",
  });

  assert.ok(errors.includes("NEXT_PUBLIC_API_MODE must be real"));
  assert.ok(errors.includes("NEXT_PUBLIC_AUTH_MODE must be supabase"));
  for (const name of [
    "NEXT_PUBLIC_API_BASE_URL",
    "NEXT_PUBLIC_SITE_URL",
    "NEXT_PUBLIC_SUPABASE_URL",
  ]) {
    assert.ok(errors.some((error) => error.startsWith(`${name} `)));
  }
});

test("production environment validator rejects enabled capabilities", () => {
  const errors = validateProductionEnvironment({
    ...productionEnvironment,
    NEXT_PUBLIC_AI_ENABLED: "true",
    NEXT_PUBLIC_DOCUMENTS_ENABLED: "true",
    NEXT_PUBLIC_DOCUMENT_PROCESSING_ENABLED: "true",
    NEXT_PUBLIC_PRODUCT_CONTROLS_ENABLED: "true",
  });

  for (const name of [
    "NEXT_PUBLIC_AI_ENABLED",
    "NEXT_PUBLIC_DOCUMENTS_ENABLED",
    "NEXT_PUBLIC_DOCUMENT_PROCESSING_ENABLED",
    "NEXT_PUBLIC_PRODUCT_CONTROLS_ENABLED",
  ]) {
    assert.ok(errors.includes(`${name} must be false for the initial release`));
  }
});

test("production environment validator rejects key control characters without echoing the key", () => {
  for (const unsafeKey of [
    "fixture-key\r\nInjected-Header: value",
    "fixture-key\n",
  ]) {
    const errors = validateProductionEnvironment({
      ...productionEnvironment,
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: unsafeKey,
    });

    assert.ok(
      errors.includes(
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must not contain control characters",
      ),
    );
    assert.ok(errors.every((error) => !error.includes(unsafeKey)));
  }
});
