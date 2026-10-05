import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Check, ExternalLink } from "lucide-react";
import { content } from "@/lib/content";
import { examples } from "@/lib/content/examples";
import { categoryDetails, isCategory } from "@/lib/content/types";
import { ButtonLink } from "@/components/ui/button";
import { Badge, Card } from "@/components/ui/primitives";
import { pageMetadata } from "@/lib/metadata";
import { api } from "@/lib/api";
import { demoExams } from "@/lib/exams/mock-data";
import { ExamDetail } from "@/components/exams/exam-detail";

type Props = { params: Promise<{ category: string; slug: string }> };
export function generateStaticParams() {
  return [
    ...examples
      .filter((item) => item.category !== "exams")
      .map((item) => ({ category: item.category, slug: item.slug })),
    ...demoExams.map((exam) => ({ category: "exams" as const, slug: exam.slug })),
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
  return (
    <div className="container-page py-12 sm:py-16">
      <Link
        href={`/${category}`}
        className="mb-8 inline-flex items-center gap-2 text-xs text-brand"
      >
        <ArrowLeft size={14} />
        All {categoryDetails[category].label.toLowerCase()}
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
            <h2 className="text-lg font-semibold">The starting point</h2>
            <p className="mt-4 text-sm leading-8 text-muted">
              {entry.overview}
            </p>
          </Card>
          <Card>
            <h2 className="text-lg font-semibold">Before you decide</h2>
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
            <h2 className="text-sm font-semibold">At a glance</h2>
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
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            <p className="mt-3 text-[10px] leading-6 text-muted">
              Official reference link. This overview does not verify current
              admission-cycle details.
            </p>
          </Card>
          <div className="rounded-2xl bg-brand p-6 text-white">
            <h2 className="editorial text-3xl">Make it personal.</h2>
            <p className="mt-4 text-xs leading-7 text-white/80">
              Ask about {entry.title} in the context of your goals and starting
              point.
            </p>
            <ButtonLink
              href={`/chat?q=${encodeURIComponent(`Help me understand ${entry.title} and what I should check before applying.`)}`}
              variant="inverse"
              className="mt-5"
            >
              Ask Admitics <ArrowUpRight size={15} />
            </ButtonLink>
          </div>
        </aside>
      </div>
    </div>
  );
}
