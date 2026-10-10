"use client";

import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Check, ExternalLink } from "lucide-react";
import type { ContentEntry } from "@/lib/content/types";
import { categoryDetails } from "@/lib/content/types";
import { ButtonLink } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/primitives";
import { useTranslation } from "@/lib/i18n";

export function ContentDetailView({ entry }: { entry: ContentEntry }) {
  const t = useTranslation();
  return (
    <div className="container-page py-12 sm:py-16">
      <Link
        href={`/${entry.category}`}
        className="mb-8 inline-flex items-center gap-2 text-xs text-brand"
      >
        <ArrowLeft size={14} />
        {t("detail.all", {
          category: categoryDetails[entry.category].label.toLowerCase(),
        })}
      </Link>
      <div className="mb-10">
        <Badge>{entry.tag}</Badge>
        <h1 className="editorial mt-5 text-5xl sm:text-6xl">{entry.title}</h1>
        <p className="mt-3 text-sm text-muted">{entry.subtitle}</p>
        <p className="mt-5 max-w-2xl text-base leading-8 text-muted">
          {entry.summary}
        </p>
      </div>
      <div className="grid gap-7 lg:grid-cols-[1.7fr_1fr]">
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold">
              {t("detail.startingPoint")}
            </h2>
            <p className="mt-4 text-sm leading-8 text-muted">
              {entry.overview}
            </p>
          </Card>
          <Card>
            <h2 className="text-lg font-semibold">
              {t("detail.beforeDecide")}
            </h2>
            <ul className="mt-5 space-y-5">
              {entry.checkpoints.map((text) => (
                <li
                  key={text}
                  className="flex items-start gap-3 text-sm leading-7 text-muted"
                >
                  <Check size={18} className="mt-1 shrink-0 text-brand" />
                  {text}
                </li>
              ))}
            </ul>
          </Card>
        </div>
        <aside className="space-y-6">
          <Card>
            <h2 className="text-sm font-semibold">{t("detail.atGlance")}</h2>
            <dl className="mt-5 space-y-4">
              {entry.facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="text-[11px] text-muted">{fact.label}</dt>
                  <dd className="mt-1 text-sm font-medium">{fact.value}</dd>
                </div>
              ))}
            </dl>
            <a
              href={entry.source.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 flex items-center justify-between gap-3 border-t border-line pt-5 text-xs font-semibold text-brand"
            >
              {entry.source.title}
              <ExternalLink size={14} />
              <span className="sr-only">{t("common.opensInNewTab")}</span>
            </a>
            <p className="mt-3 text-[10px] leading-6 text-muted">
              {t("detail.officialReference")}
            </p>
          </Card>
          <div className="rounded-2xl bg-brand p-6 text-white">
            <h2 className="editorial text-3xl">{t("detail.personal")}</h2>
            <p className="mt-4 text-xs leading-7 text-white/80">
              {t("detail.personalCopy", { title: entry.title })}
            </p>
            <ButtonLink
              href={`/chat?q=${encodeURIComponent(t("detail.askPrompt", { title: entry.title }))}`}
              variant="inverse"
              className="mt-5"
            >
              {t("detail.ask")} <ArrowUpRight size={15} />
            </ButtonLink>
          </div>
        </aside>
      </div>
    </div>
  );
}
