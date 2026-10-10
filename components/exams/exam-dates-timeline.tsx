import { CalendarDays, CheckCircle2, CircleDashed } from "lucide-react";
import type { ExamDate } from "@/types";
import { Badge } from "@/components/ui/primitives";
import { formatExamDateRange } from "./exam-utils";
import { useI18n, useTranslation } from "@/lib/i18n";

export function ExamDatesTimeline({ dates }: { dates: ExamDate[] }) {
  const t = useTranslation();
  const { locale } = useI18n();
  return (
    <ol className="relative mt-7 space-y-1 before:absolute before:top-4 before:bottom-4 before:left-[11px] before:w-px before:bg-line">
      {dates.map((date) => {
        const published = Boolean(date.date);
        return (
          <li key={date.id} className="relative flex gap-4 py-3">
            <span className="relative z-10 mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-white text-brand ring-4 ring-white">
              {published ? (
                <CheckCircle2 size={21} aria-hidden="true" />
              ) : (
                <CircleDashed
                  size={20}
                  className="text-muted"
                  aria-hidden="true"
                />
              )}
            </span>
            <div className="min-w-0 flex-1 rounded-xl border border-line bg-paper px-4 py-3 sm:flex sm:items-center sm:justify-between sm:gap-5">
              <div>
                <p className="text-sm font-semibold">{date.label}</p>
                <p className="mt-1 text-xs leading-5 text-muted">
                  {date.note ?? t("common.officialSources")}
                </p>
              </div>
              <div className="mt-3 flex shrink-0 items-center gap-2 sm:mt-0">
                <CalendarDays
                  size={14}
                  className="text-brand"
                  aria-hidden="true"
                />
                <span className="text-xs font-semibold">
                  {formatExamDateRange(date, locale)}
                </span>
                {!published && (
                  <Badge tone="neutral">{t("common.loading")}</Badge>
                )}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
