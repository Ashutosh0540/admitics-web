"use client";
import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  Compass,
  FileCheck2,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { BrandMark } from "@/components/navigation/logo";
import { useTranslation } from "@/lib/i18n";

export function JourneyPreview() {
  const t = useTranslation();
  return (
    <div className="relative mx-auto w-full max-w-[480px] py-5 lg:py-12">
      <div
        aria-hidden="true"
        className="subtle-grid absolute inset-0 rounded-[2rem] bg-[#edf1e8]"
      />
      <div className="relative mx-5 rounded-2xl border border-white bg-white p-5 shadow-[0_12px_45px_-20px_#283d3350] sm:mx-8 sm:p-7">
        <div className="flex items-center gap-3 border-b border-line pb-5">
          <BrandMark className="size-10 text-brand" />
          <div>
            <p className="text-sm font-semibold">{t("journey.title")}</p>
            <p className="mt-0.5 text-xs text-muted">{t("journey.subtitle")}</p>
          </div>
          <span className="ml-auto size-2 rounded-full bg-brand" />
        </div>
        <div className="mt-5 flex items-start gap-3">
          <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-peach text-xs font-semibold">
            {t("journey.you")}
          </span>
          <p className="rounded-xl rounded-tl-sm bg-paper px-4 py-3 text-sm leading-6">
            {t("journey.question")}
          </p>
        </div>
        <div className="mt-5">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-brand">
            <Sparkles size={14} /> {t("journey.possibilities")}
          </div>
          <p className="text-sm leading-6 text-muted">
            {t("journey.possibilitiesCopy")}
          </p>
          <div className="mt-4 grid gap-2">
            {[
              [GraduationCap, t("journey.options"), t("journey.optionsCopy")],
              [Compass, t("journey.rightFit"), t("journey.rightFitCopy")],
              [FileCheck2, t("journey.plan"), t("journey.planCopy")],
            ].map(([Icon, title, subtitle]) => {
              const ItemIcon = Icon as typeof Compass;
              return (
                <div
                  key={title as string}
                  className="flex items-center gap-3 rounded-xl border border-line p-3"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-mint text-brand">
                    <ItemIcon size={17} />
                  </span>
                  <div>
                    <p className="text-xs font-semibold">{title as string}</p>
                    <p className="mt-1 text-[11px] text-muted">
                      {subtitle as string}
                    </p>
                  </div>
                  <ArrowUpRight size={14} className="ml-auto text-muted" />
                </div>
              );
            })}
          </div>
        </div>
        <Link
          href="/chat"
          className="mt-5 flex items-center justify-between rounded-xl bg-brand px-4 py-3 text-xs font-semibold text-white"
        >
          {t("journey.together")} <ArrowUpRight size={16} />
        </Link>
      </div>
      <div className="relative mx-auto -mt-1 flex w-fit items-center gap-2 rounded-full border border-line bg-paper px-4 py-2.5 text-xs font-medium shadow-sm">
        <span className="flex size-5 items-center justify-center rounded-full bg-mint text-brand">
          <Check size={12} />
        </span>
        {t("journey.clearerPath")}
      </div>
    </div>
  );
}
