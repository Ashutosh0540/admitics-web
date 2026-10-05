import type { Exam, ExamDate, ExamSourceVerification } from "@/types";

export function formatExamDate(date: string | null) {
  if (!date) return "Not published";
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function formatExamDateRange(date: ExamDate) {
  if (!date.date) return "Not published";
  if (!date.endDate || date.endDate === date.date)
    return formatExamDate(date.date);
  return `${formatExamDate(date.date)} – ${formatExamDate(date.endDate)}`;
}

export function examinationDate(exam: Exam) {
  return exam.dates.find((date) => date.kind === "examination") ?? null;
}

export function verificationLabel(status: ExamSourceVerification) {
  if (status === "verified") return "Verified source";
  if (status === "needs-review") return "Needs review";
  return "Demo data";
}

export function buildExamAskHref(
  exam: Exam,
  context: "exam-detail" | "eligibility-check" = "exam-detail",
) {
  const params = new URLSearchParams({
    q: `Help me understand ${exam.name} and what I should check before applying.`,
    examId: exam.id,
    examSlug: exam.slug,
    context,
    profile: "not-provided",
  });
  return `/chat?${params.toString()}`;
}
