"use client";

import { useTranslation } from "@/lib/i18n";

export function SkipLink() {
  const t = useTranslation();
  return (
    <a className="skip-link" href="#main-content">
      {t("common.skipToContent")}
    </a>
  );
}
