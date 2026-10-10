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
import { localizedErrorMessage } from "@/lib/api/errors";
import { Button, ButtonLink } from "@/components/ui/button";
import { ErrorState, Input } from "@/components/ui/primitives";
import { BrandMark } from "@/components/navigation/logo";
import { useI18n, useTranslation } from "@/lib/i18n";

type AuthMode = "login" | "signup" | "forgot" | "reset";
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
  const t = useTranslation();
  const { locale } = useI18n();
  const headings = {
    login: [t("auth.loginTitle"), t("auth.loginCopy")],
    signup: [t("auth.signupTitle"), t("auth.signupCopy")],
    forgot: [t("auth.forgotTitle"), t("auth.forgotCopy")],
    reset: [t("auth.resetTitle"), t("auth.resetCopy")],
  };
  const preview = config.authMode === "mock";
  return (
    <section className="container-page grid gap-10 py-12 lg:grid-cols-2 lg:gap-20 lg:py-20">
      <div className="hidden flex-col justify-center rounded-3xl bg-mint p-12 lg:flex">
        <BrandMark className="mb-8 size-14 text-brand" />
        <p className="eyebrow mb-5">{t("auth.sideEyebrow")}</p>
        <p className="editorial text-6xl">
          {t("home.title3")}
          <br />
          {t("chat.emptyTitle")}
          <br />
          <span className="text-brand">
            {t("auth.sideTitle").split(". ").at(-1)}
          </span>
        </p>
        <p className="mt-7 max-w-sm text-sm leading-8 text-muted">
          {t("auth.sideCopy")}
        </p>
        <div className="mt-12 flex items-start gap-3 text-xs leading-6 text-brand">
          <ShieldCheck size={19} className="mt-1 shrink-0" />
          <p>
            {t("auth.identity")}
            <br />
            {t("auth.authorized")}
          </p>
        </div>
      </div>
      <div className="mx-auto w-full max-w-md py-4">
        <p className="eyebrow mb-4">
          {mode === "signup" ? t("auth.signupEyebrow") : t("auth.loginEyebrow")}
        </p>
        <h1 className="editorial text-4xl sm:text-5xl">{headings[mode][0]}</h1>
        <p className="mt-4 text-sm leading-7 text-muted">{headings[mode][1]}</p>
        {preview && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-6 text-amber">
            <strong>{t("auth.previewAuth")}</strong> {t("auth.previewCopy")}
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
              {t("auth.backToLogin")}
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
                    setSuccess(t("auth.successForgot"));
                  } else if (mode === "reset") {
                    if (!(await auth.getSession()))
                      throw new Error(t("auth.expiredRecovery"));
                    await auth.updatePassword(password);
                    setSuccess(t("auth.successReset"));
                  } else if (mode === "signup") {
                    const user = await auth.signUp(
                      name.trim(),
                      email,
                      password,
                    );
                    if (user) router.replace(safeNext(params.get("next")));
                    else setSuccess(t("auth.successSignup"));
                  } else {
                    await auth.signIn(email, password);
                    router.replace(safeNext(params.get("next")));
                  }
                } catch (reason) {
                  setError(localizedErrorMessage(reason, locale));
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
                    {t("auth.name")}
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
                    {t("auth.email")}
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
                      {mode === "reset"
                        ? t("auth.newPassword")
                        : t("auth.password")}
                    </label>
                    {mode === "login" && (
                      <Link
                        href="/forgot-password"
                        className="text-xs text-brand underline underline-offset-4"
                      >
                        {t("auth.forgotPassword")}
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
                        showPassword
                          ? t("auth.hidePassword")
                          : t("auth.showPassword")
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
                    {t("auth.passwordHelp")}
                    {preview ? t("auth.previewPassword") : ""}
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
                    {t("auth.agree")}{" "}
                    <Link href="/terms" className="text-brand underline">
                      {t("auth.terms")}
                    </Link>{" "}
                    and have read the{" "}
                    <Link href="/privacy" className="text-brand underline">
                      {t("auth.privacyNotice")}
                    </Link>
                    .
                  </span>
                </label>
              )}
              {error && <ErrorState message={error} />}
              <Button type="submit" loading={busy} className="w-full">
                {mode === "forgot"
                  ? t("auth.sendReset")
                  : mode === "reset"
                    ? t("auth.updatePassword")
                    : preview
                      ? t("auth.continuePreview")
                      : mode === "signup"
                        ? t("auth.createAccount")
                        : t("nav.logIn")}
                <ArrowRight size={15} />
              </Button>
            </form>
            {(mode === "login" || mode === "signup") && (
              <>
                <div className="my-6 flex items-center gap-4 text-[11px] text-muted">
                  <span className="h-px flex-1 bg-line" />
                  {t("auth.or")}
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
                      setError(localizedErrorMessage(reason, locale));
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
                  {t("auth.continueGoogle")}
                </Button>
                <p className="mt-6 text-center text-xs text-muted">
                  {mode === "login"
                    ? t("auth.newToAdmitics")
                    : t("auth.alreadyAccount")}{" "}
                  <Link
                    href={mode === "login" ? "/signup" : "/login"}
                    className="font-semibold text-brand underline underline-offset-4"
                  >
                    {mode === "login"
                      ? t("auth.createAnAccount")
                      : t("nav.logIn")}
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
                    ? t("auth.requestRecovery")
                    : t("auth.backToLogin")}
                </Link>
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
}
