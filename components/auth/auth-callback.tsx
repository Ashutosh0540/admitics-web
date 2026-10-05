"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { errorMessage } from "@/lib/api/errors";
import { safeNext } from "@/lib/config";
import { ErrorState, LoadingState } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";

export function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const url = new URL(window.location.href);
    const failed = url.searchParams.has("error") || new URLSearchParams(url.hash.slice(1)).has("error");
    const code = failed ? null : url.searchParams.get("code");
    const next = safeNext(url.searchParams.get("next"));
    window.history.replaceState(null, "", "/auth/callback");
    void getAuth()
      .completeAuthCallback(code ?? "")
      .then((user) => {
        if (!active) return;
        if (user) router.replace(next);
      })
      .catch((reason) => {
        if (active) setError(errorMessage(reason));
      });
    return () => {
      active = false;
    };
  }, [router]);
  return (
    <div className="container-page max-w-xl py-20">
      {error ? (
        <>
          <ErrorState message={error} />
          <ButtonLink href="/login" className="mt-5">
            Back to log in
          </ButtonLink>
        </>
      ) : (
        <LoadingState label="Completing your sign-in…" />
      )}
    </div>
  );
}
