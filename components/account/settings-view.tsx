"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, LogOut } from "lucide-react";
import { getAuth } from "@/lib/auth";
import { config } from "@/lib/config";
import { usageApi } from "@/lib/api/usage";
import { errorMessage } from "@/lib/api/errors";
import { useResource } from "@/lib/use-resource";
import { AccountGate } from "@/components/auth/account-gate";
import { useAuth } from "@/components/auth/auth-provider";
import { WorkspaceNav } from "@/components/navigation/workspace-nav";
import { Button, ButtonLink } from "@/components/ui/button";
import {
  Card,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
} from "@/components/ui/primitives";
import { UsageCard } from "@/components/dashboard/usage-card";
import type { User } from "@/types";
import { useTranslation } from "@/lib/i18n";

const loadUsage = (signal: AbortSignal) => usageApi.get(signal);
export function SettingsView() {
  const { user } = useAuth();
  const t = useTranslation();
  return (
    <AccountGate>
      <WorkspaceNav />
      {user ? (
        <SettingsInner key={user.id} user={user} />
      ) : (
        <div className="container-page max-w-2xl py-10 sm:py-14">
          <p className="eyebrow mb-3">{t("settings.eyebrow")}</p>
          <h1 className="editorial mb-9 text-4xl sm:text-5xl">
            {t("settings.title")}
          </h1>
          <EmptyState
            title={t("settings.emptyTitle")}
            description={t("settings.emptyCopy")}
            action={
              <ButtonLink href="/signup">{t("auth.createAccount")}</ButtonLink>
            }
          />
        </div>
      )}
    </AccountGate>
  );
}
function SettingsInner({ user }: { user: User }) {
  const router = useRouter();
  const {
    data: usage,
    loading,
    error: usageError,
    refresh,
  } = useResource(loadUsage);
  const [name, setName] = useState(user.name);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const t = useTranslation();
  return (
    <div className="container-page py-10 sm:py-14">
      <p className="eyebrow mb-3">{t("settings.eyebrow")}</p>
      <h1 className="editorial mb-9 text-4xl sm:text-5xl">
        {t("settings.title")}
      </h1>
      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <div className="space-y-6">
          <Card>
            <h2 className="text-base font-semibold">{t("settings.profile")}</h2>
            <p className="mt-2 text-xs leading-6 text-muted">
              {t("settings.profileCopy")}
            </p>
            <form
              className="mt-6 space-y-5"
              onSubmit={async (event) => {
                event.preventDefault();
                setBusy(true);
                setError("");
                setNotice("");
                try {
                  await getAuth().updateProfile(name.trim());
                  setNotice(t("settings.profileUpdated"));
                } catch (reason) {
                  setError(errorMessage(reason));
                } finally {
                  setBusy(false);
                }
              }}
            >
              <div>
                <label
                  htmlFor="profile-name"
                  className="mb-2 block text-xs font-medium"
                >
                  {t("settings.displayName")}
                </label>
                <Input
                  id="profile-name"
                  autoComplete="name"
                  required
                  maxLength={80}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                />
              </div>
              <div>
                <label
                  htmlFor="profile-email"
                  className="mb-2 block text-xs font-medium"
                >
                  {t("auth.email")}
                </label>
                <Input
                  id="profile-email"
                  type="email"
                  value={user.email}
                  readOnly
                />
                <p className="mt-2 text-[11px] text-muted">
                  {t("settings.emailUnavailable")}
                </p>
              </div>
              {error && <ErrorState message={error} />}
              {notice && (
                <p
                  role="status"
                  className="flex items-center gap-2 text-xs text-brand"
                >
                  <CheckCircle2 size={15} />
                  {notice}
                </p>
              )}
              <Button type="submit" loading={busy} disabled={!name.trim()}>
                {t("settings.saveProfile")}
              </Button>
            </form>
          </Card>
          <Card>
            <h2 className="text-base font-semibold">
              {t("settings.security")}
            </h2>
            <p className="mt-3 text-xs leading-7 text-muted">
              {config.authMode === "mock"
                ? t("settings.previewSecurity")
                : t("settings.realSecurity")}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <ButtonLink variant="secondary" href="/forgot-password">
                {t("settings.resetPassword")}
              </ButtonLink>
              <Button
                variant="ghost"
                loading={busy}
                onClick={async () => {
                  setBusy(true);
                  setError("");
                  try {
                    await getAuth().signOut();
                    router.replace("/");
                  } catch (reason) {
                    setError(errorMessage(reason));
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <LogOut size={15} />
                {t("nav.logOut")}
              </Button>
            </div>
          </Card>
        </div>
        <div>
          {loading ? (
            <LoadingState label={t("settings.checkingUsage")} />
          ) : usageError ? (
            <ErrorState message={usageError} retry={refresh} />
          ) : (
            usage && <UsageCard usage={usage} />
          )}
        </div>
      </div>
    </div>
  );
}
