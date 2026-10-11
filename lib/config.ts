export const config = {
  apiMode: process.env.NEXT_PUBLIC_API_MODE === "real" ? "real" : "mock",
  authMode:
    process.env.NEXT_PUBLIC_AUTH_MODE === "supabase" ? "supabase" : "mock",
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "https://admitics.org",
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "",
} as const;

export const isPreview = config.apiMode === "mock";

function publicCapability(value: string | undefined, fallback: boolean) {
  return value === undefined ? fallback : value.trim().toLowerCase() === "true";
}

// These flags control presentation only. The API remains authoritative for
// authorization and feature availability. Mock mode keeps existing local
// development and browser-test behavior unless a test explicitly overrides it.
export const capabilities = {
  ai: publicCapability(process.env.NEXT_PUBLIC_AI_ENABLED, isPreview),
  documents: publicCapability(
    process.env.NEXT_PUBLIC_DOCUMENTS_ENABLED,
    isPreview,
  ),
  documentProcessing: publicCapability(
    process.env.NEXT_PUBLIC_DOCUMENT_PROCESSING_ENABLED,
    isPreview,
  ),
  productControls: publicCapability(
    process.env.NEXT_PUBLIC_PRODUCT_CONTROLS_ENABLED,
    isPreview,
  ),
} as const;

export function safeNext(value: string | null): string {
  return value &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("\\")
    ? value
    : "/dashboard";
}
