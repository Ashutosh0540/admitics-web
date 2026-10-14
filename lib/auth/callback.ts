import { safeNext } from "@/lib/config";

function callbackParams(url: URL) {
  const params = new URLSearchParams(url.hash.replace(/^#/, ""));
  url.searchParams.forEach((value, key) => params.set(key, value));
  return params;
}

function callbackError(params: URLSearchParams): string | null {
  if (
    !params.has("error") &&
    !params.has("error_code") &&
    !params.has("error_description")
  )
    return null;

  const code = params.get("error_code") ?? params.get("error");
  if (code === "access_denied" || code === "user_cancelled")
    return "Sign-in was cancelled. Please return to login and try again.";
  if (code === "otp_expired")
    return "This authentication link has expired. Request a new link and try again.";
  return "The sign-in provider could not complete authentication. Please try again.";
}

export function createCallbackCompleter<T>(
  exchange: (code: string) => Promise<T>,
) {
  const inFlight = new Map<string, Promise<T>>();

  return (code: string): Promise<T> => {
    if (!code)
      return Promise.reject(
        new Error(
          "This authentication link is missing its authorization code.",
        ),
      );

    const existing = inFlight.get(code);
    if (existing) return existing;

    const completion = Promise.resolve().then(() => exchange(code));
    inFlight.set(code, completion);
    const clear = () => {
      if (inFlight.get(code) === completion) inFlight.delete(code);
    };
    void completion.then(clear, clear);
    return completion;
  };
}

export async function completeAuthCallback(
  url: URL,
  exchange: (code: string) => Promise<unknown>,
  clearUrl: () => void,
): Promise<string> {
  const params = callbackParams(url);
  const destination = safeNext(params.get("next"));
  const providerError = callbackError(params);

  if (providerError) {
    clearUrl();
    throw new Error(providerError);
  }

  const code = params.get("code");
  if (!code) {
    clearUrl();
    throw new Error(
      "This authentication link is missing its authorization code. Please return to login or request a new link.",
    );
  }

  // Supabase's PKCE exchange may read sb_flow_id from window.location. Keep
  // the original callback URL intact until exchangeCodeForSession completes.
  try {
    await exchange(code);
    return destination;
  } finally {
    clearUrl();
  }
}
