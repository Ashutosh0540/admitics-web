import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { content } from "@/lib/content";
import { examples } from "@/lib/content/examples";
import { isCategory } from "@/lib/content/types";
import { pageMetadata } from "@/lib/metadata";
import { api } from "@/lib/api";
import { demoExams } from "@/lib/exams/mock-data";
import { ExamDetail } from "@/components/exams/exam-detail";
import { ContentDetailView } from "@/components/content/content-detail-view";

type Props = { params: Promise<{ category: string; slug: string }> };
export function generateStaticParams() {
  return [
    ...examples
      .filter((item) => item.category !== "exams")
      .map((item) => ({ category: item.category, slug: item.slug })),
    ...demoExams.map((exam) => ({
      category: "exams" as const,
      slug: exam.slug,
    })),
  ];
}
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params;
  if (!isCategory(category)) return {};
  if (category === "exams") {
    const exam = await api.getExam(slug);
    return exam
      ? pageMetadata(exam.name, exam.summary, `/exams/${exam.slug}`)
      : {};
  }
  const entry = await content.get(category, slug);
  return entry
    ? pageMetadata(entry.title, entry.summary, `/${category}/${slug}`)
    : {};
}
export default async function DetailPage({ params }: Props) {
  const { category, slug } = await params;
  if (!isCategory(category)) notFound();
  if (category === "exams") {
    const exam = await api.getExam(slug);
    if (!exam) notFound();
    return <ExamDetail exam={exam} />;
  }
  const entry = await content.get(category, slug);
  if (!entry) notFound();
  return <ContentDetailView entry={entry} />;
}
