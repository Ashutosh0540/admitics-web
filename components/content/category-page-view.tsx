"use client";

import { ArrowUpRight, Sparkles } from "lucide-react";
import type { ContentCategory, ContentEntry } from "@/lib/content/types";
import { ExploreList } from "@/components/content/explore-list";
import { ButtonLink } from "@/components/ui/button";
import { useTranslation, type TranslationKey } from "@/lib/i18n";

export function CategoryPageView({
  category,
  entries,
}: {
  category: ContentCategory;
  entries: ContentEntry[];
}) {
  const t = useTranslation();
  const key = `explore.categories.${category}` as const;
  return (
    <div className="container-page py-14 sm:py-20">
      <p className="eyebrow mb-4">{t(`${key}.eyebrow` as TranslationKey)}</p>
      <h1 className="editorial max-w-3xl text-5xl sm:text-6xl">
        {t(`${key}.title` as TranslationKey)}
      </h1>
      <p className="mt-6 max-w-2xl text-sm leading-8 text-muted">
        {t(`${key}.description` as TranslationKey)}
      </p>
      <div className="mt-7 mb-10 rounded-xl border border-line bg-mint/50 px-4 py-3 text-[11px] leading-6 text-muted">
        {t("explore.starterContent")}
      </div>
      <ExploreList category={category} entries={entries} />
      <div className="mt-12 flex flex-col justify-between gap-5 rounded-2xl bg-mint p-7 sm:flex-row sm:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Sparkles size={18} className="text-brand" />
            {t("explore.notSure")}
          </h2>
          <p className="mt-2 text-xs leading-6 text-muted">
            {t("explore.notSureCopy")}
          </p>
        </div>
        <ButtonLink
          href={`/chat?q=${encodeURIComponent(t("explore.chatPrompt", { category }))}`}
        >
          {t("explore.exploreTogether")} <ArrowUpRight size={15} />
        </ButtonLink>
      </div>
    </div>
  );
}
