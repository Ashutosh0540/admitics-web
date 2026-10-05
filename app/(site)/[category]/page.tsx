import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { content } from "@/lib/content";
import { categoryDetails, isCategory } from "@/lib/content/types";
import { information, isInformation } from "@/lib/content/information";
import { ExploreList } from "@/components/content/explore-list";
import { ButtonLink } from "@/components/ui/button";
import { pageMetadata } from "@/lib/metadata";
import { api } from "@/lib/api";
import { ExamDirectory } from "@/components/exams/exam-directory";

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
    const page = information[category];
    return (
      <div className="container-page max-w-4xl py-14 sm:py-20">
        <p className="eyebrow mb-5">{page.eyebrow}</p>
        <h1 className="editorial text-5xl sm:text-6xl">{page.title}</h1>
        <p className="mt-6 max-w-2xl text-base leading-8 text-muted">
          {page.description}
        </p>
        <div className="mt-12 space-y-8">
          {page.sections.map((section) => (
            <section key={section.title} className="border-t border-line pt-7">
              <h2 className="text-lg font-semibold">{section.title}</h2>
              <p className="mt-4 text-sm leading-8 text-muted">
                {section.body}
              </p>
            </section>
          ))}
        </div>
        <ButtonLink href="/chat" className="mt-10">
          Ask Admitics <ArrowUpRight size={16} />
        </ButtonLink>
      </div>
    );
  }
  if (!isCategory(category)) notFound();
  const details = categoryDetails[category];
  const entries = await content.list(category);
  return (
    <div className="container-page py-14 sm:py-20">
      <p className="eyebrow mb-4">{details.eyebrow}</p>
      <h1 className="editorial max-w-3xl text-5xl sm:text-6xl">
        {details.title}
      </h1>
      <p className="mt-6 max-w-2xl text-sm leading-8 text-muted">
        {details.description}
      </p>
      <div className="mt-7 mb-10 rounded-xl border border-line bg-mint/50 px-4 py-3 text-[11px] leading-6 text-muted">
        Starter content for exploration. Current dates, eligibility, fees, and
        availability need confirmation on official sites.
      </div>
      <ExploreList category={category} entries={entries} />
      <div className="mt-12 flex flex-col justify-between gap-5 rounded-2xl bg-mint p-7 sm:flex-row sm:items-center">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <Sparkles size={18} className="text-brand" />
            Not sure where to start?
          </h2>
          <p className="mt-2 text-xs leading-6 text-muted">
            Tell Admitics what you’re studying and what you’re curious about.
          </p>
        </div>
        <ButtonLink
          href={`/chat?q=${encodeURIComponent(`Help me explore ${category} that fit my interests.`)}`}
        >
          Let’s explore together <ArrowUpRight size={15} />
        </ButtonLink>
      </div>
    </div>
  );
}
