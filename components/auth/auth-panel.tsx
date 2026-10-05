"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useId, useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import { config, safeNext } from "@/lib/config";
import { getAuth } from "@/lib/auth";
import { errorMessage } from "@/lib/api/errors";
import { Button, ButtonLink } from "@/components/ui/button";
import { ErrorState, Input } from "@/components/ui/primitives";
import { BrandMark } from "@/components/navigation/logo";

type AuthMode = "login" | "signup" | "forgot" | "reset";
const headings = {
  login: ["Welcome back.", "Your next chapter is right where you left it."],
  signup: [
    "Make room for possibility.",
    "Keep your questions, plans, and guidance in one place.",
  ],
  forgot: [
    "Let’s get you back in.",
    "We’ll send you a link to reset your password.",
  ],
  reset: ["A fresh start.", "Choose a new password for your Admitics account."],
};

export function AuthPanel({ mode }: { mode: AuthMode }) {
  const fieldId = useId();
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const preview = config.authMode === "mock";
  return (
    <section className="container-page grid gap-10 py-12 lg:grid-cols-2 lg:gap-20 lg:py-20">
      <div className="hidden flex-col justify-center rounded-3xl bg-mint p-12 lg:flex">
        <BrandMark className="mb-8 size-14 text-brand" />
        <p className="eyebrow mb-5">A LITTLE CLARITY. A LOT OF POSSIBILITY.</p>
        <p className="editorial text-6xl">
          Your future.
          <br />
          Your questions.
          <br />
          <span className="text-brand">Your space.</span>
        </p>
        <p className="mt-7 max-w-sm text-sm leading-8 text-muted">
          Keep your education journey together. Pick up a conversation, bring in
          a document, and find your next step.
        </p>
        <div className="mt-12 flex items-start gap-3 text-xs leading-6 text-brand">
          <ShieldCheck size={19} className="mt-1 shrink-0" />
          <p>
            Identity is handled by Supabase Auth.
            <br />
            Your application access is authorized by Admitics.
          </p>
        </div>
      </div>
      <div className="mx-auto w-full max-w-md py-4">
        <p className="eyebrow mb-4">
          {mode === "signup" ? "LET’S BEGIN" : "YOUR ADMITICS ACCOUNT"}
        </p>
        <h1 className="editorial text-4xl sm:text-5xl">{headings[mode][0]}</h1>
        <p className="mt-4 text-sm leading-7 text-muted">{headings[mode][1]}</p>
        {preview && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber">
            <strong>Preview authentication.</strong> Credentials aren’t verified
            or stored. Use a made-up email and password; don’t enter real
            credentials. Google and email recovery need Supabase configuration.
          </div>
        )}
        {success ? (
          <div
            role="status"
            className="mt-8 rounded-2xl border border-line bg-mint p-6"
          >
            <CheckCircle2 size={25} className="mb-4 text-brand" />
            <p className="text-sm leading-7">{success}</p>
            <ButtonLink href="/login" variant="secondary" className="mt-5">
              Back to log in
            </ButtonLink>
          </div>
        ) : (
          <>
            <form
              className="mt-7 space-y-5"
              onSubmit={async (event) => {
                event.preventDefault();
                setBusy(true);
                setError("");
                try {
                  const auth = getAuth();
                  if (mode === "forgot") {
                    await auth.resetPassword(email);
                    setSuccess(
                      "If an account exists for that address, a password reset link will arrive shortly. Check your inbox and spam folder.",
                    );
                  } else if (mode === "reset") {
                    if (!(await auth.getSession()))
                      throw new Error(
                        "This recovery link is missing or expired. Request a new password reset link.",
                      );
                    await auth.updatePassword(password);
                    setSuccess(
                      "Your password has been updated. You can now log in with your new password.",
                    );
                  } else if (mode === "signup") {
                    const user = await auth.signUp(
                      name.trim(),
                      email,
                      password,
                    );
                    if (user) router.replace(safeNext(params.get("next")));
                    else
                      setSuccess(
                        "Check your email to confirm your account. Then come back to log in and start your next chapter.",
                      );
                  } else {
                    await auth.signIn(email, password);
                    router.replace(safeNext(params.get("next")));
                  }
                } catch (reason) {
                  setError(errorMessage(reason));
                } finally {
                  setBusy(false);
                }
              }}
            >
              {mode === "signup" && (
                <div>
                  <label
                    htmlFor={`${fieldId}-name`}
                    className="mb-2 block text-xs font-medium"
                  >
                    Your name
                  </label>
                  <Input
                    id={`${fieldId}-name`}
                    name="name"
                    autoComplete="name"
                    required
                    maxLength={80}
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    disabled={busy}
                  />
                </div>
              )}
              {mode !== "reset" && (
                <div>
                  <label
                    htmlFor={`${fieldId}-email`}
                    className="mb-2 block text-xs font-medium"
                  >
                    Email address
                  </label>
                  <Input
                    id={`${fieldId}-email`}
                    name="email"
                    autoComplete="email"
                    type="email"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder={
                      preview ? "explorer@example.com" : "you@example.com"
                    }
                    disabled={busy}
                  />
                </div>
              )}
              {mode !== "forgot" && (
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor={`${fieldId}-password`}
                      className="text-xs font-medium"
                    >
                      {mode === "reset" ? "New password" : "Password"}
                    </label>
                    {mode === "login" && (
                      <Link
                        href="/forgot-password"
                        className="text-xs text-brand underline underline-offset-4"
                      >
                        Forgot password?
                      </Link>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      id={`${fieldId}-password`}
                      name="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete={
                        mode === "login" ? "current-password" : "new-password"
                      }
                      required
                      minLength={8}
                      maxLength={128}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="pr-12"
                      disabled={busy}
                      aria-describedby={`${fieldId}-password-help`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="absolute top-1 right-1 flex size-10 items-center justify-center text-muted"
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                  <p
                    id={`${fieldId}-password-help`}
                    className="mt-2 text-[11px] text-muted"
                  >
                    At least 8 characters.
                    {preview ? " A made-up password is fine for preview." : ""}
                  </p>
                </div>
              )}
              {mode === "signup" && (
                <label className="flex items-start gap-3 text-xs leading-6 text-muted">
                  <input
                    type="checkbox"
                    required
                    className="mt-1 size-4 shrink-0 accent-brand"
                  />
                  <span>
                    I agree to the{" "}
                    <Link href="/terms" className="text-brand underline">
                      Terms
                    </Link>{" "}
                    and have read the{" "}
                    <Link href="/privacy" className="text-brand underline">
                      Privacy notice
                    </Link>
                    .
                  </span>
                </label>
              )}
              {error && <ErrorState message={error} />}
              <Button type="submit" loading={busy} className="w-full">
                {mode === "forgot"
                  ? "Send reset link"
                  : mode === "reset"
                    ? "Update password"
                    : preview
                      ? "Continue in preview"
                      : mode === "signup"
                        ? "Create account"
                        : "Log in"}
                <ArrowRight size={15} />
              </Button>
            </form>
            {(mode === "login" || mode === "signup") && (
              <>
                <div className="my-6 flex items-center gap-4 text-[11px] text-muted">
                  <span className="h-px flex-1 bg-line" />
                  or
                  <span className="h-px flex-1 bg-line" />
                </div>
                <Button
                  variant="secondary"
                  disabled={busy}
                  onClick={async () => {
                    setBusy(true);
                    setError("");
                    try {
                      await getAuth().signInWithGoogle();
                    } catch (reason) {
                      setError(errorMessage(reason));
                    } finally {
                      setBusy(false);
                    }
                  }}
                  className="w-full"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    className="size-4"
                  >
                    <path
                      fill="#4285F4"
                      d="M21.6 12.23c0-.71-.06-1.39-.18-2.05H12v3.88h5.38a4.6 4.6 0 0 1-2 3.02v2.51h3.24c1.9-1.75 2.98-4.33 2.98-7.36Z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 22c2.7 0 4.97-.9 6.62-2.42l-3.24-2.51c-.9.6-2.05.96-3.38.96-2.6 0-4.81-1.76-5.6-4.13H3.06v2.6A10 10 0 0 0 12 22Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M6.4 13.9a6 6 0 0 1 0-3.8V7.5H3.06a10 10 0 0 0 0 9l3.34-2.6Z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.97c1.47 0 2.8.5 3.83 1.5l2.88-2.88A9.6 9.6 0 0 0 12 2a10 10 0 0 0-8.94 5.5l3.34 2.6C7.19 7.73 9.4 5.97 12 5.97Z"
                    />
                  </svg>
                  Continue with Google
                </Button>
                <p className="mt-6 text-center text-xs text-muted">
                  {mode === "login"
                    ? "New to Admitics?"
                    : "Already have an account?"}{" "}
                  <Link
                    href={mode === "login" ? "/signup" : "/login"}
                    className="font-semibold text-brand underline underline-offset-4"
                  >
                    {mode === "login" ? "Create an account" : "Log in"}
                  </Link>
                </p>
              </>
            )}
            {(mode === "forgot" || mode === "reset") && (
              <p className="mt-6 text-center">
                <Link
                  href={mode === "reset" ? "/forgot-password" : "/login"}
                  className="text-xs text-brand underline underline-offset-4"
                >
                  {mode === "reset"
                    ? "Request a new recovery link"
                    : "Back to log in"}
                </Link>
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
