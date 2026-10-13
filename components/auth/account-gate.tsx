"use client";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useAuth } from "./auth-provider";
import { config } from "@/lib/config";
import { ButtonLink } from "@/components/ui/button";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/ui/primitives";
import { useTranslation } from "@/lib/i18n";

export function AccountGate({
  children,
  returnTo,
}: {
  children: ReactNode;
  returnTo?: string;
}) {
  const { user, loading, error } = useAuth();
  const pathname = usePathname();
  const t = useTranslation();
  if (loading)
    return (
      <div id="main-content" className="container-page py-16">
        <LoadingState label={t("common.loading")} />
      </div>
    );
  if (error)
    return (
      <div id="main-content" className="container-page max-w-xl py-16">
        <ErrorState message={error} retry={() => window.location.reload()} />
      </div>
    );
  if (!user && config.apiMode === "real")
    return (
      <div id="main-content" className="container-page max-w-2xl py-16">
        <EmptyState
          title={t("dashboard.waiting")}
          description={t("dashboard.waitingCopy")}
          action={
            <ButtonLink
              href={`/login?next=${encodeURIComponent(returnTo ?? pathname)}`}
            >
              {t("nav.logIn")}
            </ButtonLink>
          }
        />
      </div>
    );
  return children;
}
