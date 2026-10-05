import Link from "next/link";
import { ArrowUpRight, CalendarDays, ChevronRight, GraduationCap } from "lucide-react";
import type { Exam } from "@/types";
import { Badge } from "@/components/ui/primitives";
import { cn } from "@/lib/utils";
import { examinationDate, formatExamDateRange } from "./exam-utils";

const statusTone = {
  open: "green",
  "opening-soon": "amber",
  closed: "neutral",
  "not-published": "neutral",
} as const;

export function ExamCard({ exam }: { exam: Exam }) {
  const nextExamDate = examinationDate(exam);
  return (
    <article className="group flex flex-col rounded-2xl border border-line bg-white p-6 transition-transform hover:-translate-y-1 hover:border-brand/30 hover:shadow-[0_16px_34px_rgba(25,44,40,.07)]">
      <div className="flex items-start justify-between gap-4">
        <span className="flex size-11 items-center justify-center rounded-xl bg-mint text-brand">
          <GraduationCap size={21} aria-hidden="true" />
        </span>
        <Badge tone={statusTone[exam.applicationStatus.code]}>
          <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
          {exam.applicationStatus.label}
        </Badge>
      </div>
      <div className="mt-6 flex items-center gap-2 text-[10px] font-semibold tracking-[.12em] text-muted uppercase">
        <span>{exam.category}</span>
        <span aria-hidden="true">·</span>
        <span>{exam.level}</span>
      </div>
      <h2 className="mt-3 text-xl font-semibold tracking-tight">{exam.name}</h2>
      <p className="mt-3 flex-1 text-sm leading-7 text-muted">{exam.summary}</p>
      <div className="mt-6 grid gap-3 border-t border-line pt-5">
        <div className="flex items-start gap-3 text-xs">
          <CalendarDays size={16} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
          <div>
            <p className="text-[10px] tracking-wide text-muted uppercase">Upcoming examination</p>
            <p className="mt-1 font-medium">{nextExamDate ? formatExamDateRange(nextExamDate) : "Not published"}</p>
          </div>
        </div>
        <div className="flex items-start gap-3 text-xs">
          <span className="mt-0.5 flex size-4 items-center justify-center rounded-full border border-brand/40 text-[9px] font-bold text-brand" aria-hidden="true">
            ↗
          </span>
          <div>
            <p className="text-[10px] tracking-wide text-muted uppercase">Conducting body</p>
            <p className="mt-1 line-clamp-1 font-medium text-muted">{exam.conductingBody}</p>
          </div>
        </div>
      </div>
      <Link
        href={`/exams/${exam.slug}`}
        className={cn(
          "mt-6 flex min-h-11 items-center justify-between rounded-xl bg-paper px-4 py-3 text-xs font-semibold text-brand transition-colors hover:bg-mint",
        )}
      >
        Explore {exam.name}
        <ArrowUpRight size={15} aria-hidden="true" />
        <span className="sr-only"> exam details</span>
      </Link>
      <p className="mt-3 flex items-center gap-1 text-[10px] text-muted">
        Demo record <ChevronRight size={12} aria-hidden="true" />
        <span>confirm before applying</span>
      </p>
    </article>
  );
}
