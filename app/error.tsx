"use client";
import { ErrorState } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="main-content" className="container-page max-w-2xl py-20">
      <h1 className="editorial mb-6 text-4xl">Let’s try that step again.</h1>
      <ErrorState
        message="This page couldn't be opened. Please try again."
        retry={reset}
      />
      <ButtonLink href="/" variant="secondary" className="mt-5">
        Back to Admitics
      </ButtonLink>
    </main>
  );
}
