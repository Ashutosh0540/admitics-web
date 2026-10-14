import { config, safeNext } from "@/lib/config";
import type { User } from "@/types";
import { createCallbackCompleter } from "./callback";

export interface AuthAdapter {
  getSession(): Promise<User | null>;
  getAccessToken(): Promise<string | null>;
  signIn(email: string, password: string): Promise<User>;
  signUp(
    name: string,
    email: string,
    password: string,
    returnTo?: string,
  ): Promise<User | null>;
  signInWithGoogle(returnTo?: string): Promise<void>;
  completeAuthCallback(code: string): Promise<User>;
  signOut(): Promise<void>;
  resetPassword(email: string): Promise<void>;
  updatePassword(password: string): Promise<void>;
  updateProfile(name: string): Promise<void>;
  subscribe(listener: (user: User | null) => void): () => void;
}

const sessionKey = "admitics:preview:identity";
function readPreview(key = sessionKey): User | null {
  if (typeof window === "undefined") return null;
  try {
    const value: unknown = JSON.parse(localStorage.getItem(key) ?? "null");
    return value &&
      typeof value === "object" &&
      "id" in value &&
      typeof value.id === "string" &&
      "email" in value &&
      typeof value.email === "string" &&
      "name" in value &&
      typeof value.name === "string" &&
      "createdAt" in value &&
      typeof value.createdAt === "string"
      ? (value as User)
      : null;
  } catch {
    return null;
  }
}
function emitPreview(user: User | null) {
  if (user) {
    localStorage.setItem(sessionKey, JSON.stringify(user));
    localStorage.setItem(
      `admitics:preview:profile:${user.id}`,
      JSON.stringify(user),
    );
  } else localStorage.removeItem(sessionKey);
  window.dispatchEvent(new Event("admitics:auth"));
}
const mockAuth: AuthAdapter = {
  getSession: async () => readPreview(),
  getAccessToken: async () => null,
  async signIn(email) {
    email = email.trim().toLowerCase();
    const user = readPreview(`admitics:preview:profile:preview:${email}`) ?? {
      id: `preview:${email.toLowerCase()}`,
      email,
      name: email.split("@")[0],
      createdAt: new Date().toISOString(),
    };
    emitPreview(user);
    return user;
  },
  async signUp(name, email) {
    email = email.trim().toLowerCase();
    const user = {
      id: `preview:${email.toLowerCase()}`,
      email,
      name,
      createdAt: new Date().toISOString(),
    };
    emitPreview(user);
    return user;
  },
  async signInWithGoogle() {
    throw new Error(
      "Google sign-in requires the public Supabase configuration. Use the preview form to explore the interface.",
    );
  },
  async completeAuthCallback() {
    throw new Error(
      "Preview authentication does not use an email or Google callback.",
    );
  },
  async signOut() {
    emitPreview(null);
  },
  async resetPassword() {
    throw new Error(
      "Password recovery isn't sent in preview mode. Connect Supabase to send a recovery email.",
    );
  },
  async updatePassword() {
    throw new Error(
      "Preview accounts don't have passwords. Connect Supabase to enable password changes.",
    );
  },
  async updateProfile(name) {
    const user = readPreview();
    if (user) emitPreview({ ...user, name });
  },
  subscribe(listener) {
    const notify = () => listener(readPreview());
    window.addEventListener("admitics:auth", notify);
    window.addEventListener("storage", notify);
    return () => {
      window.removeEventListener("admitics:auth", notify);
      window.removeEventListener("storage", notify);
    };
  },
};

type SupabaseClient = import("@supabase/supabase-js").SupabaseClient;
let clientPromise: Promise<SupabaseClient> | undefined;
async function supabase() {
  if (!config.supabaseUrl || !config.supabaseKey)
    throw new Error(
      "Sign-in isn't configured yet. Add the public Supabase URL and publishable key.",
    );
  const authUrl = new URL(config.supabaseUrl);
  if (
    authUrl.protocol !== "https:" &&
    !(
      process.env.NODE_ENV === "development" &&
      authUrl.protocol === "http:" &&
      ["localhost", "127.0.0.1", "[::1]"].includes(authUrl.hostname)
    )
  )
    throw new Error("Supabase authentication requires an HTTPS URL.");
  clientPromise ??= import("@supabase/supabase-js").then(({ createClient }) =>
    createClient(config.supabaseUrl, config.supabaseKey, {
      auth: {
        flowType: "pkce",
        detectSessionInUrl: false,
        persistSession: true,
        autoRefreshToken: true,
      },
    }),
  );
  return clientPromise;
}
function identity(user: import("@supabase/supabase-js").User): User {
  return {
    id: user.id,
    email: user.email ?? "",
    name:
      typeof user.user_metadata.name === "string"
        ? user.user_metadata.name
        : (user.email?.split("@")[0] ?? "Student"),
    createdAt: user.created_at,
  };
}
function authError(error: { code?: string } | null, fallback: string): never {
  const messages: Record<string, string> = {
    invalid_credentials:
      "That email and password combination wasn't recognised. Please try again.",
    email_not_confirmed: "Please confirm your email before logging in.",
    weak_password: "Choose a stronger password and try again.",
    over_request_rate_limit:
      "Too many sign-in attempts. Please wait a little and try again.",
    over_email_send_rate_limit: "Please wait before requesting another email.",
  };
  throw new Error((error?.code && messages[error.code]) || fallback);
}
const supabaseAuth: AuthAdapter = {
  async getSession() {
    const { data, error } = await (await supabase()).auth.getSession();
    if (error)
      authError(
        error,
        "We couldn't restore your session. Please log in again.",
      );
    return data.session ? identity(data.session.user) : null;
  },
  async getAccessToken() {
    const { data, error } = await (await supabase()).auth.getSession();
    if (error)
      authError(
        error,
        "We couldn't refresh your session. Please log in again.",
      );
    return data.session?.access_token ?? null;
  },
  async signIn(email, password) {
    const { data, error } = await (
      await supabase()
    ).auth.signInWithPassword({ email, password });
    if (error)
      authError(error, "Sign-in could not be completed. Please try again.");
    return identity(data.user);
  },
  async signUp(name, email, password, returnTo = "/dashboard") {
    const { data, error } = await (
      await supabase()
    ).auth.signUp({
      email,
      password,
      options: {
        data: { name },
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          safeNext(returnTo),
        )}`,
      },
    });
    if (error)
      authError(error, "Sign-up could not be completed. Please try again.");
    return data.session && data.user ? identity(data.user) : null;
  },
  async signInWithGoogle(returnTo = "/dashboard") {
    const { error } = await (
      await supabase()
    ).auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          safeNext(returnTo),
        )}`,
      },
    });
    if (error)
      authError(
        error,
        "Google sign-in could not be started. Please try again.",
      );
  },
  completeAuthCallback: createCallbackCompleter(async (code) => {
    const { data, error } = await (
      await supabase()
    ).auth.exchangeCodeForSession(code);
    if (error || !data.user)
      throw new Error("Sign-in could not be completed. Please try again.");
    return identity(data.user);
  }),
  async signOut() {
    const { error } = await (await supabase()).auth.signOut({ scope: "local" });
    if (error)
      authError(error, "Sign-out could not be completed. Please try again.");
  },
  async resetPassword(email) {
    const { error } = await (
      await supabase()
    ).auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=%2Freset-password`,
    });
    if (error)
      authError(
        error,
        "The recovery email could not be requested. Please try again.",
      );
  },
  async updatePassword(password) {
    const { error } = await (await supabase()).auth.updateUser({ password });
    if (error)
      authError(
        error,
        "Your password could not be updated. Please request a new recovery link.",
      );
  },
  async updateProfile(name) {
    const { error } = await (
      await supabase()
    ).auth.updateUser({ data: { name } });
    if (error)
      authError(
        error,
        "Your display name could not be updated. Please try again.",
      );
  },
  subscribe(listener) {
    let disposed = false;
    let unsubscribe: (() => void) | undefined;
    void supabase()
      .then((client) => {
        if (disposed) return;
        const { data } = client.auth.onAuthStateChange((_event, session) =>
          listener(session ? identity(session.user) : null),
        );
        unsubscribe = () => data.subscription.unsubscribe();
      })
      .catch(() => {});
    return () => {
      disposed = true;
      unsubscribe?.();
    };
  },
};
export function getAuth(): AuthAdapter {
  return config.authMode === "supabase" ? supabaseAuth : mockAuth;
}
