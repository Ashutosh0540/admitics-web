import type { ApiError } from "@/types";

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
export function isAbort(reason: unknown) {
  return reason instanceof Error && reason.name === "AbortError";
}
