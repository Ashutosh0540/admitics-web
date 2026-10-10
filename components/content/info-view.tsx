"use client";

import { ArrowUpRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { useTranslation, type TranslationKey } from "@/lib/i18n";

export function InfoView({
  slug,
}: {
  slug: "about" | "contact" | "privacy" | "terms" | "disclaimer";
}) {
  const t = useTranslation();
  const base = `info.${slug}` as const;
  const page = t as (key: TranslationKey) => string;
  const title = page(`${base}.title` as TranslationKey);
  const eyebrow = page(`${base}.eyebrow` as TranslationKey);
  const description = page(`${base}.description` as TranslationKey);
  const sections = [0, 1, 2]
    .map((index) => ({
      title: page(`${base}.sections.${index}.title` as TranslationKey),
      body: page(`${base}.sections.${index}.body` as TranslationKey),
    }))
    .filter((section) => !section.title.includes("sections."));
  return (
    <div className="container-page max-w-4xl py-14 sm:py-20">
      <p className="eyebrow mb-5">{eyebrow}</p>
      <h1 className="editorial text-5xl sm:text-6xl">{title}</h1>
      <p className="mt-6 max-w-2xl text-base leading-8 text-muted">
        {description}
      </p>
      <div className="mt-12 space-y-8">
        {sections.map((section) => (
          <section key={section.title} className="border-t border-line pt-7">
            <h2 className="text-lg font-semibold">{section.title}</h2>
            <p className="mt-4 text-sm leading-8 text-muted">{section.body}</p>
          </section>
        ))}
      </div>
      <ButtonLink href="/chat" className="mt-10">
        {t("info.ask")} <ArrowUpRight size={16} />
      </ButtonLink>
    </div>
  );
}
