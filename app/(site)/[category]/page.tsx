import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { content } from "@/lib/content";
import { categoryDetails, isCategory } from "@/lib/content/types";
import { information, isInformation } from "@/lib/content/information";
import { pageMetadata } from "@/lib/metadata";
import { api } from "@/lib/api";
import { ExamDirectory } from "@/components/exams/exam-directory";
import { InfoView } from "@/components/content/info-view";
import { CategoryPageView } from "@/components/content/category-page-view";

export function generateStaticParams() {
  return [...Object.keys(categoryDetails), ...Object.keys(information)].map(
    (category) => ({ category }),
  );
}
export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category } = await params;
  if (isCategory(category))
    return pageMetadata(
      categoryDetails[category].label,
      categoryDetails[category].description,
      `/${category}`,
    );
  if (isInformation(category))
    return pageMetadata(
      category[0].toUpperCase() + category.slice(1),
      information[category].description,
      `/${category}`,
    );
  return {};
}
export default async function ContentPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  if (category === "exams") {
    const exams = await api.listExams();
    return <ExamDirectory exams={exams} />;
  }
  if (isInformation(category)) {
    return <InfoView slug={category} />;
  }
  if (!isCategory(category)) notFound();
  const entries = await content.list(category);
  return <CategoryPageView category={category} entries={entries} />;
}
