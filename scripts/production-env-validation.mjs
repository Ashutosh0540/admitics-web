const required = [
  "NEXT_PUBLIC_API_MODE",
  "NEXT_PUBLIC_AUTH_MODE",
  "NEXT_PUBLIC_API_BASE_URL",
  "NEXT_PUBLIC_SITE_URL",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_AI_ENABLED",
  "NEXT_PUBLIC_DOCUMENTS_ENABLED",
  "NEXT_PUBLIC_DOCUMENT_PROCESSING_ENABLED",
  "NEXT_PUBLIC_PRODUCT_CONTROLS_ENABLED",
];

const productionUrls = {
  NEXT_PUBLIC_API_BASE_URL:
    "https://admitics-ai-worker-production.dr-csrraju.workers.dev",
  NEXT_PUBLIC_SITE_URL: "https://app.admitics.org",
  NEXT_PUBLIC_SUPABASE_URL: "https://hdvbwzsfglexhzqorkml.supabase.co",
};

const disabledCapabilities = [
  "NEXT_PUBLIC_AI_ENABLED",
  "NEXT_PUBLIC_DOCUMENTS_ENABLED",
  "NEXT_PUBLIC_DOCUMENT_PROCESSING_ENABLED",
  "NEXT_PUBLIC_PRODUCT_CONTROLS_ENABLED",
];

export function validateProductionEnvironment(env) {
  const errors = [];

  for (const name of required) {
    if (!env[name]?.trim()) errors.push(`${name} is required`);
  }

  if (env.NEXT_PUBLIC_API_MODE !== "real") {
    errors.push("NEXT_PUBLIC_API_MODE must be real");
  }
  if (env.NEXT_PUBLIC_AUTH_MODE !== "supabase") {
    errors.push("NEXT_PUBLIC_AUTH_MODE must be supabase");
  }

  for (const [name, expected] of Object.entries(productionUrls)) {
    const value = env[name]?.trim();
    if (!value) continue;

    try {
      const url = new URL(value);
      if (
        url.protocol !== "https:" ||
        url.username ||
        url.password ||
        url.search ||
        url.hash ||
        url.toString().replace(/\/$/, "") !== expected
      ) {
        errors.push(`${name} must use the approved production HTTPS URL`);
      }
    } catch {
      errors.push(`${name} must be a valid HTTPS URL`);
    }
  }

  const publishableKey = env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (publishableKey && /[\u0000-\u001f\u007f]/.test(publishableKey)) {
    errors.push(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must not contain control characters",
    );
  }

  for (const name of disabledCapabilities) {
    const value = env[name]?.trim().toLowerCase();
    if (value !== "true" && value !== "false") {
      errors.push(`${name} must be true or false`);
    } else if (value !== "false") {
      errors.push(`${name} must be false for the initial release`);
    }
  }

  return errors;
}
