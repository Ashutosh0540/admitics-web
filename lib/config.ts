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

export function safeNext(value: string | null): string {
  return value &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !value.includes("\\")
    ? value
    : "/dashboard";
}
