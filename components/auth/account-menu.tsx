"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Settings,
  UserRound,
} from "lucide-react";
import { useAuth } from "./auth-provider";
import { getAuth } from "@/lib/auth";

export function AccountMenu() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [error, setError] = useState("");
  if (loading)
    return (
      <span
        className="h-9 w-16 animate-pulse rounded-lg bg-line/50"
        aria-label="Restoring account"
      />
    );
  if (!user)
    return (
      <Link
        href="/login"
        className="px-2 py-3 text-sm font-medium text-muted hover:text-brand"
      >
        Log in
      </Link>
    );
  return (
    <details className="group relative">
      <summary className="flex min-h-11 list-none items-center gap-2 rounded-lg px-2 text-xs font-medium hover:bg-mint">
        <span className="flex size-8 items-center justify-center rounded-full bg-mint text-brand">
          <UserRound size={16} />
        </span>
        <span className="max-w-24 truncate">{user.name}</span>
        <ChevronDown size={13} />
      </summary>
      <div className="absolute right-0 z-40 mt-2 w-56 rounded-xl border border-line bg-white p-2 shadow-lg">
        <p className="truncate border-b border-line px-3 py-3 text-xs text-muted">
          {user.email}
        </p>
        {[
          [LayoutDashboard, "Dashboard", "/dashboard"],
          [Settings, "Account settings", "/settings"],
        ].map(([Icon, label, href]) => {
          const ItemIcon = Icon as typeof Settings;
          return (
            <Link
              onClick={(event) =>
                event.currentTarget.closest("details")?.removeAttribute("open")
              }
              key={href as string}
              href={href as string}
              className="flex items-center gap-2 rounded-lg p-3 text-xs hover:bg-mint"
            >
              <ItemIcon size={15} />
              {label as string}
            </Link>
          );
        })}
        <button
          onClick={async (event) => {
            const details = event.currentTarget.closest("details");
            try {
              await getAuth().signOut();
              details?.removeAttribute("open");
              router.push("/");
            } catch (reason) {
              setError(
                reason instanceof Error ? reason.message : "Couldn't sign out.",
              );
            }
          }}
          className="flex w-full items-center gap-2 rounded-lg p-3 text-xs hover:bg-mint"
        >
          <LogOut size={15} />
          Log out
        </button>
        {error && (
          <p role="alert" className="p-3 text-xs text-danger">
            {error}
          </p>
        )}
      </div>
    </details>
  );
}
