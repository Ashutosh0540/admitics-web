import type { ApiError } from "@/types";
import {
  translate,
  type Locale,
  type TranslationKey,
} from "@/lib/i18n/messages";

export class ApiClientError extends Error implements ApiError {
  constructor(
    public code: string,
    message: string,
    public status = 0,
    public requestId?: string,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiClientError";
  }
}
export function errorMessage(reason: unknown): string {
  return reason instanceof Error
    ? reason.message
    : "Something went wrong. Please try again.";
}
const localizedMessages: Record<string, TranslationKey> = {
  "Google sign-in requires the public Supabase configuration. Use the preview form to explore the interface.":
    "errors.google",
  "Password recovery isn't sent in preview mode. Connect Supabase to send a recovery email.":
    "errors.recoveryPreview",
  "Preview accounts don't have passwords. Connect Supabase to enable password changes.":
    "errors.previewPassword",
};
export function localizedErrorMessage(reason: unknown, locale: Locale): string {
  const message = errorMessage(reason);
  const key = localizedMessages[message];
  return key ? translate(locale, key) : message;
}
export function isAbort(reason: unknown) {
  return reason instanceof Error && reason.name === "AbortError";
}
