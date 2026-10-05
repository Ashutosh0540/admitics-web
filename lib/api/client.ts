import { config } from "@/lib/config";
import { getAuth } from "@/lib/auth";
import { ApiClientError } from "./errors";

const publicMessages: Record<string, string> = {
  UNAUTHENTICATED: "Your session has expired. Log in again to continue.",
  FORBIDDEN: "You don't have permission to access this item.",
  RESOURCE_NOT_FOUND:
    "We couldn't find this item. If you just signed up, start a conversation to set up your workspace.",
  DOCUMENT_NOT_FOUND:
    "This document is unavailable. Refresh your library to see the latest files.",
  RESOURCE_CONFLICT:
    "An operation is already in progress or this item has changed. Reload before trying again.",
  DOCUMENT_CONFLICT:
    "This document is already being processed or changed. Refresh to check its status.",
  QUOTA_EXCEEDED:
    "You've reached a usage limit. Check your usage and try again after the period resets.",
  DOCUMENT_TOO_LARGE:
    "This upload exceeds your file, document, or storage limit.",
  DOCUMENT_UNSUPPORTED:
    "This file type is not supported. Choose a supported document format.",
  DOCUMENT_INVALID:
    "We couldn't accept this file. Check its name, format, and contents before trying again.",
  AI_GENERATION_FAILED:
    "Your question was saved, but Admitics couldn't finish the answer. Reload the conversation to check its status.",
  AI_PERSISTENCE_FAILED:
    "Your question was saved, but the answer couldn't be confirmed. Reload the conversation before sending anything again.",
  AI_CONTEXT_TOO_LARGE:
    "This question is too long for the available context. Try a shorter question.",
  AI_UNAVAILABLE:
    "The advisor is temporarily unavailable. Please try again later.",
  DOCUMENT_UNAVAILABLE:
    "Document processing is temporarily unavailable. Your library can be refreshed to check the latest status.",
  DATA_UNAVAILABLE:
    "Your workspace is temporarily unavailable. Please try again later.",
  FEATURE_UNAVAILABLE:
    "This feature isn't available yet. Please try again later.",
  AUTHENTICATION_UNAVAILABLE:
    "Sign-in verification is temporarily unavailable. Your session has been kept; try again later.",
  INVALID_REQUEST:
    "We couldn't accept this request. Check your input and try again.",
  PAYLOAD_TOO_LARGE:
    "This request is too large. Try a smaller file or shorter question.",
};

type RecordValue = Record<string, unknown>;
function record(value: unknown): value is RecordValue {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function statusCode(status: number) {
  const codes: Record<number, string> = {
    401: "UNAUTHENTICATED",
    403: "FORBIDDEN",
    404: "RESOURCE_NOT_FOUND",
    409: "RESOURCE_CONFLICT",
    429: "QUOTA_EXCEEDED",
  };
  return codes[status] ?? (status >= 500 ? "SERVER_UNAVAILABLE" : "HTTP_ERROR");
}

function publicMessage(code: string, status: number) {
  if (publicMessages[code]) return publicMessages[code];
  if (publicMessages[statusCode(status)])
    return publicMessages[statusCode(status)];
  if (status === 413) return "This file or request is too large.";
  if (status >= 500)
    return "Admitics is temporarily unavailable. Please try again later.";
  return "We couldn't complete that request. Please try again.";
}

export function createApiClient({
  baseUrl,
  accessToken,
  allowLocalHttp = process.env.NODE_ENV === "development",
  timeoutMs = 30000,
}: {
  baseUrl: string;
  accessToken: () => Promise<string | null>;
  allowLocalHttp?: boolean;
  timeoutMs?: number;
}) {
  return async function request(
    path: string,
    options: RequestInit = {},
  ): Promise<unknown> {
    if (!baseUrl)
      throw new ApiClientError(
        "CONFIGURATION",
        "The admissions API isn't connected yet. Set NEXT_PUBLIC_API_BASE_URL.",
      );
    let base: URL;
    try {
      base = new URL(baseUrl);
    } catch {
      throw new ApiClientError(
        "CONFIGURATION",
        "The admissions API connection is not configured correctly.",
      );
    }
    if (base.username || base.password || base.search || base.hash)
      throw new ApiClientError(
        "CONFIGURATION",
        "The admissions API connection is not configured correctly.",
      );
    if (
      base.protocol !== "https:" &&
      !(
        allowLocalHttp &&
        ["localhost", "127.0.0.1", "[::1]"].includes(base.hostname) &&
        base.protocol === "http:"
      )
    )
      throw new ApiClientError(
        "CONFIGURATION",
        "The API connection requires HTTPS (local development may use HTTP).",
      );
    const token = await accessToken();
    if (!token)
      throw new ApiClientError(
        "UNAUTHENTICATED",
        "Please log in to continue.",
        401,
      );
    const headers = new Headers(options.headers);
    headers.set("Accept", "application/json");
    headers.set("Authorization", `Bearer ${token}`);
    if (
      options.body &&
      !(options.body instanceof FormData) &&
      !headers.has("Content-Type")
    )
      headers.set("Content-Type", "application/json");
    const timeout = AbortSignal.timeout(timeoutMs);
    try {
      const response = await fetch(`${baseUrl.replace(/\/$/, "")}${path}`, {
        ...options,
        headers,
        cache: "no-store",
        credentials: "omit",
        redirect: "error",
        signal: options.signal
          ? AbortSignal.any([options.signal, timeout])
          : timeout,
      });
      if (!response.ok) {
        let payload: unknown;
        if (response.headers.get("content-type")?.includes("application/json")) {
          try {
            payload = await response.json();
          } catch {
            payload = undefined;
          }
        }
        const error = record(payload) && record(payload.error)
          ? payload.error
          : undefined;
        const code = typeof error?.code === "string"
          ? error.code
          : statusCode(response.status);
        const details = record(payload) && record(payload.data) &&
          typeof payload.data.userMessageId === "number" &&
          Number.isSafeInteger(payload.data.userMessageId) &&
          payload.data.userMessageId > 0
          ? { userMessageId: payload.data.userMessageId }
          : undefined;
        throw new ApiClientError(
          code,
          publicMessage(code, response.status),
          response.status,
          response.headers.get("x-request-id") ??
            (typeof error?.requestId === "string" ? error.requestId : undefined),
          details,
        );
      }
      if (response.status === 204) return undefined;
      if (!response.headers.get("content-type")?.includes("application/json"))
        throw new ApiClientError(
          "CONTRACT_MISMATCH",
          "The API returned an unsupported format. The response contract needs to be connected.",
        );
      return await response.json();
    } catch (error) {
      if (options.signal?.aborted)
        throw new DOMException("Request cancelled", "AbortError");
      if (timeout.aborted)
        throw new ApiClientError(
          "TIMEOUT",
          "The request took too long. Check your conversation history before sending again.",
        );
      if (error instanceof ApiClientError) throw error;
      throw new ApiClientError(
        "NETWORK_ERROR",
        "We couldn't reach Admitics. Check your connection and try again.",
      );
    }
  };
}

export const request = createApiClient({
  baseUrl: config.apiBaseUrl,
  accessToken: async () => {
    if (config.authMode !== "supabase")
      throw new ApiClientError(
        "CONFIGURATION",
        "Real API access requires configured sign-in.",
      );
    return getAuth().getAccessToken();
  },
});
