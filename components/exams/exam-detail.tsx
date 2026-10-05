"use client";

import Link from "next/link";
import { useCallback, useSyncExternalStore } from "react";
import {
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  Check,
  ExternalLink,
  FileCheck2,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";
import type { Exam } from "@/types";
import { Button, ButtonLink } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/primitives";
import { safeExternalUrl } from "@/lib/utils";
import { buildExamAskHref, examinationDate, formatExamDateRange, verificationLabel } from "./exam-utils";
import { ExamDatesTimeline } from "./exam-dates-timeline";
import { EligibilityChecker } from "./eligibility-checker";

const statusTone = {
  open: "green",
  "opening-soon": "amber",
  closed: "neutral",
  "not-published": "neutral",
} as const;

export function ExamDetail({ exam }: { exam: Exam }) {
  const storageKey = `admitics:exam:${exam.slug}`;
  const subscribeSaved = useCallback((onStoreChange: () => void) => {
    window.addEventListener("storage", onStoreChange);
    window.addEventListener("admitics:saved-exams", onStoreChange);
    return () => {
      window.removeEventListener("storage", onStoreChange);
      window.removeEventListener("admitics:saved-exams", onStoreChange);
    };
  }, []);
  const getSavedSnapshot = useCallback(
    () => {
      try {
        return window.localStorage.getItem(storageKey) === "saved";
      } catch {
        return false;
      }
    },
    [storageKey],
  );
  const saved = useSyncExternalStore(subscribeSaved, getSavedSnapshot, () => false);
  const nextExamDate = examinationDate(exam);
  const toggleSaved = () => {
    const next = !saved;
    try {
      if (next) window.localStorage.setItem(storageKey, "saved");
      else window.localStorage.removeItem(storageKey);
    } catch {
      // Saving remains useful for this visit when browser storage is unavailable.
    }
    window.dispatchEvent(new Event("admitics:saved-exams"));
  };

  return (
    <div className="container-page py-10 sm:py-14">
      <Link href="/exams" className="mb-8 inline-flex items-center gap-2 text-xs font-semibold text-brand">
        <ArrowLeft size={14} aria-hidden="true" />
        All exams
      </Link>
      <div className="grid gap-10 lg:grid-cols-[1.4fr_.6fr] lg:items-end">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{exam.category}</Badge>
            <Badge tone="neutral">{exam.level}</Badge>
            <Badge tone="amber">Demo record</Badge>
          </div>
          <h1 className="editorial mt-5 text-5xl sm:text-6xl">{exam.name}</h1>
          <p className="mt-3 text-sm font-medium text-muted">{exam.conductingBody}</p>
          <p className="mt-5 max-w-2xl text-base leading-8 text-muted">{exam.description}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <ButtonLink href={buildExamAskHref(exam)}>
              Ask Admitics <ArrowUpRight size={16} aria-hidden="true" />
            </ButtonLink>
            <Button
              type="button"
              variant="secondary"
              onClick={toggleSaved}
              aria-pressed={saved}
              aria-label={`${saved ? "Remove" : "Save"} ${exam.name}`}
            >
              <Bookmark size={16} fill={saved ? "currentColor" : "none"} aria-hidden="true" />
              {saved ? "Saved" : "Save exam"}
            </Button>
          </div>
        </div>
        <div className="rounded-2xl border border-line bg-white p-5">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] font-semibold tracking-[.14em] text-muted uppercase">Application status</p>
            <Badge tone={statusTone[exam.applicationStatus.code]}>{exam.applicationStatus.label}</Badge>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted">{exam.applicationStatus.note}</p>
          <div className="mt-5 flex items-start gap-3 border-t border-line pt-5">
            <FileCheck2 size={18} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
            <div>
              <p className="text-[10px] tracking-wide text-muted uppercase">Upcoming exam date</p>
              <p className="mt-1 text-sm font-semibold">{nextExamDate ? formatExamDateRange(nextExamDate) : "Not published"}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 flex items-start gap-3 rounded-2xl border border-brand/15 bg-mint/60 p-4 text-xs leading-6 text-muted sm:p-5">
        <ShieldCheck size={18} className="mt-1 shrink-0 text-brand" aria-hidden="true" />
        <div>
          <p className="font-semibold text-ink">{verificationLabel(exam.verificationStatus)} · verify before you act</p>
          <p className="mt-1">{exam.verificationNote}</p>
        </div>
      </div>

      <div className="mt-12 grid gap-7 lg:grid-cols-[1.55fr_.85fr]">
        <div className="space-y-7">
          <Card>
            <p className="eyebrow mb-3">THE OVERVIEW</p>
            <h2 className="text-xl font-semibold">What this exam profile can help you understand</h2>
            <p className="mt-4 text-sm leading-8 text-muted">{exam.summary}</p>
            <div className="mt-6 grid gap-3 border-t border-line pt-5 sm:grid-cols-2">
              <div>
                <p className="text-[10px] tracking-wide text-muted uppercase">Level</p>
                <p className="mt-1 text-sm font-semibold">{exam.level}</p>
              </div>
              <div>
                <p className="text-[10px] tracking-wide text-muted uppercase">Conducting body</p>
                <p className="mt-1 text-sm font-semibold">{exam.conductingBody}</p>
              </div>
            </div>
          </Card>

          <Card id="important-dates">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <p className="eyebrow mb-3">PLAN AROUND THE MILESTONES</p>
                <h2 className="text-xl font-semibold">Important dates</h2>
              </div>
              <Badge tone="amber">Demo timeline</Badge>
            </div>
            <ExamDatesTimeline dates={exam.dates} />
            <p className="mt-5 flex items-start gap-2 border-t border-line pt-5 text-[11px] leading-5 text-muted">
              <LockKeyhole size={14} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
              Dates shown here are demo values. Confirm every
              milestone in the current official notification.
            </p>
          </Card>

          <section id="eligibility" aria-labelledby="eligibility-heading">
            <div className="mb-5">
              <p className="eyebrow mb-3">START WITH YOUR PROFILE</p>
              <h2 id="eligibility-heading" className="text-xl font-semibold">Check your eligibility</h2>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-muted">
                Prepare your profile for a preliminary check. Until the checking
                service is available, use the official notice to confirm eligibility.
              </p>
            </div>
            <EligibilityChecker exam={exam} />
          </section>
        </div>

        <aside className="space-y-7">
          <Card>
            <p className="eyebrow mb-3">APPLICATION INFORMATION</p>
            <h2 className="text-lg font-semibold">Keep your next step visible</h2>
            <p className="mt-4 text-sm leading-7 text-muted">{exam.applicationStatus.note}</p>
            <ul className="mt-5 space-y-3 border-t border-line pt-5">
              {["Check the current application notice", "Keep your academic documents nearby", "Confirm the target course or institution separately"].map((item) => (
                <li key={item} className="flex items-start gap-3 text-xs leading-5 text-muted">
                  <Check size={15} className="mt-0.5 shrink-0 text-brand" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="eyebrow mb-3">SOURCE CHECK</p>
                <h2 className="text-lg font-semibold">Official sources</h2>
              </div>
              <ShieldCheck size={21} className="text-brand" aria-hidden="true" />
            </div>
            <div className="mt-5 space-y-3">
              {exam.sources.map((source) => {
                const safeUrl = source.url ? safeExternalUrl(source.url) : undefined;
                return (
                  <div key={source.id} className="rounded-xl border border-line bg-paper p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{source.title}</p>
                        <p className="mt-1 text-[11px] text-muted">{source.publisher}</p>
                      </div>
                      <Badge tone={source.verificationStatus === "verified" ? "green" : source.verificationStatus === "needs-review" ? "amber" : "neutral"}>
                        {verificationLabel(source.verificationStatus)}
                      </Badge>
                    </div>
                    <p className="mt-3 text-[11px] leading-5 text-muted">{source.note}</p>
                    {safeUrl ? (
                      <a href={safeUrl} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-brand">
                        Open source <ExternalLink size={13} aria-hidden="true" />
                        <span className="sr-only"> (opens in a new tab)</span>
                      </a>
                    ) : (
                      <p className="mt-3 text-[11px] font-medium text-muted">Official link will appear after review</p>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          <div className="rounded-2xl bg-brand p-6 text-white">
            <p className="text-[10px] font-semibold tracking-[.18em] text-white/65 uppercase">A QUESTION IS A GOOD START</p>
            <h2 className="editorial mt-4 text-3xl">Ask Admitics about this exam.</h2>
            <p className="mt-4 text-xs leading-7 text-white/80">
              Your exam slug and this page context can travel with the question;
              an academic profile can be added when you choose to share one.
            </p>
            <ButtonLink href={buildExamAskHref(exam)} variant="inverse" className="mt-5">
              Ask Admitics about this exam <ArrowUpRight size={15} aria-hidden="true" />
            </ButtonLink>
          </div>
        </aside>
      </div>
    </div>
  );
}
