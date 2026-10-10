"use client";
import { ErrorState } from "@/components/ui/primitives";
import { ButtonLink } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslation();
  return (
    <main id="main-content" className="container-page max-w-2xl py-20">
      <h1 className="editorial mb-6 text-4xl">{t("common.pageErrorTitle")}</h1>
      <ErrorState message={t("common.pageError")} retry={reset} />
      <ButtonLink href="/" variant="secondary" className="mt-5">
        {t("common.backToAdmitics")}
      </ButtonLink>
    </main>
  );
}
