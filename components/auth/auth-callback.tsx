"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { completeAuthCallback } from "@/lib/auth/callback";
import { errorMessage } from "@/lib/api/errors";
import { ErrorState, LoadingState } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";

export function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState("");
  const completion = useRef<Promise<string> | null>(null);
  useEffect(() => {
    let active = true;
    completion.current ??= completeAuthCallback(
      new URL(window.location.href),
      (code) => getAuth().completeAuthCallback(code),
      () =>
        window.history.replaceState(window.history.state, "", "/auth/callback"),
    );
    void completion.current
      .then((destination) => {
        if (active) router.replace(destination);
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
        <LoadingState />
      )}
    </div>
  );
}
