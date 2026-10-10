import type { Exam, ExamDate, ExamSourceVerification } from "@/types";
import { translate, type Locale } from "@/lib/i18n/messages";

export function formatExamDate(date: string | null, locale: Locale = "en") {
  if (!date) return translate(locale, "exams.notPublished");
  return new Intl.DateTimeFormat(`${locale}-IN`, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function formatExamDateRange(date: ExamDate, locale: Locale = "en") {
  if (!date.date) return translate(locale, "exams.notPublished");
  if (!date.endDate || date.endDate === date.date)
    return formatExamDate(date.date, locale);
  return `${formatExamDate(date.date, locale)} – ${formatExamDate(date.endDate, locale)}`;
}

export function examinationDate(exam: Exam) {
  return exam.dates.find((date) => date.kind === "examination") ?? null;
}

export function verificationLabel(
  status: ExamSourceVerification,
  locale: Locale = "en",
) {
  if (status === "verified") return translate(locale, "exams.verifiedSource");
  if (status === "needs-review") return translate(locale, "exams.needsReview");
  return translate(locale, "exams.demoData");
}

export function buildExamAskHref(
  exam: Exam,
  context: "exam-detail" | "eligibility-check" = "exam-detail",
  locale: Locale = "en",
) {
  const params = new URLSearchParams({
    q: translate(locale, "detail.askPrompt", { title: exam.name }),
    examId: exam.id,
    examSlug: exam.slug,
    context,
    profile: "not-provided",
  });
  return `/chat?${params.toString()}`;
}
