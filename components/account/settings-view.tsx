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

const loadUsage = (signal: AbortSignal) => usageApi.get(signal);
export function SettingsView() {
  const { user } = useAuth();
  return (
    <AccountGate>
      <WorkspaceNav />
      {user ? (
        <SettingsInner key={user.id} user={user} />
      ) : (
        <div className="container-page max-w-2xl py-10 sm:py-14">
          <p className="eyebrow mb-3">YOUR SPACE, YOUR DETAILS</p>
          <h1 className="editorial mb-9 text-4xl sm:text-5xl">
            Account settings.
          </h1>
          <EmptyState
            title="Make this space yours"
            description="Create a preview account to explore profile settings, or log in when your account is ready."
            action={<ButtonLink href="/signup">Create an account</ButtonLink>}
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
  return (
    <div className="container-page py-10 sm:py-14">
      <p className="eyebrow mb-3">YOUR SPACE, YOUR DETAILS</p>
      <h1 className="editorial mb-9 text-4xl sm:text-5xl">Account settings.</h1>
      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <div className="space-y-6">
          <Card>
            <h2 className="text-base font-semibold">Your profile</h2>
            <p className="mt-2 text-xs leading-6 text-muted">
              Your display name is stored with your identity profile.
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
                  setNotice("Your display name has been updated.");
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
                  Display name
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
                  Email address
                </label>
                <Input
                  id="profile-email"
                  type="email"
                  value={user.email}
                  readOnly
                />
                <p className="mt-2 text-[11px] text-muted">
                  Email changes aren’t available in this frontend milestone.
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
                Save profile
              </Button>
            </form>
          </Card>
          <Card>
            <h2 className="text-base font-semibold">Sign-in & security</h2>
            <p className="mt-3 text-xs leading-7 text-muted">
              {config.authMode === "mock"
                ? "This is a preview account. Credentials aren't verified, and no password is stored."
                : "Supabase manages your identity and sign-in session. Use a recovery email to reset your password."}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <ButtonLink variant="secondary" href="/forgot-password">
                Reset password
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
                Log out
              </Button>
            </div>
          </Card>
        </div>
        <div>
          {loading ? (
            <LoadingState label="Checking your usage…" />
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
