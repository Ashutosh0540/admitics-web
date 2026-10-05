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

export function AccountGate({ children }: { children: ReactNode }) {
  const { user, loading, error } = useAuth();
  const pathname = usePathname();
  if (loading)
    return (
      <div id="main-content" className="container-page py-16">
        <LoadingState label="Restoring your session…" />
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
          title="Your next chapter has a place here."
          description="Log in to save your conversations, use your documents, and keep your guidance together."
          action={
            <ButtonLink href={`/login?next=${encodeURIComponent(pathname)}`}>
              Log in to continue
            </ButtonLink>
          }
        />
      </div>
    );
  return children;
}
