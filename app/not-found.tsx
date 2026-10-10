"use client";
import { Header } from "@/components/navigation/header";
import { Footer } from "@/components/navigation/footer";
import { ButtonLink } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n";
export default function NotFound() {
  const t = useTranslation();
  return (
    <>
      <Header />
      <main id="main-content" className="container-page py-24 text-center">
        <p className="eyebrow mb-5">{t("common.notFoundEyebrow")}</p>
        <h1 className="editorial text-5xl">{t("common.notFoundTitle")}</h1>
        <p className="mt-5 text-sm text-muted">{t("common.notFoundCopy")}</p>
        <div className="mt-7 flex justify-center gap-3">
          <ButtonLink href="/">{t("common.backToExplore")}</ButtonLink>
          <ButtonLink href="/chat" variant="secondary">
            {t("nav.askAdmitics")}
          </ButtonLink>
        </div>
      </main>
      <Footer />
    </>
  );
}
