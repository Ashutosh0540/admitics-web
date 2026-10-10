"use client";
import {
  ArrowUpRight,
  BookOpen,
  Compass,
  FileCheck2,
  Wallet,
} from "lucide-react";
import { BrandMark } from "@/components/navigation/logo";
import { useTranslation } from "@/lib/i18n";

export function ChatEmpty({
  onSelect,
}: {
  onSelect: (question: string) => void;
}) {
  const t = useTranslation();
  const starters = [
    {
      icon: Compass,
      title: t("chat.findDirection"),
      question: t("chat.findDirectionQuestion"),
    },
    {
      icon: BookOpen,
      title: t("chat.understandExam"),
      question: t("chat.understandExamQuestion"),
    },
    {
      icon: Wallet,
      title: t("chat.exploreScholarships"),
      question: t("chat.exploreScholarshipsQuestion"),
    },
    {
      icon: FileCheck2,
      title: t("chat.applicationReady"),
      question: t("chat.applicationReadyQuestion"),
    },
  ];
  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col justify-center py-10 sm:py-14">
      <BrandMark className="mb-6 size-12 text-brand" />
      <p className="eyebrow mb-4">{t("chat.emptyEyebrow")}</p>
      <h1 className="editorial text-4xl sm:text-5xl">
        {t("chat.emptyTitle")}
        <br />
        <span className="text-brand">{t("chat.emptyTitleAccent")}</span>
      </h1>
      <p className="mt-5 max-w-lg text-sm leading-7 text-muted">
        {t("chat.emptyCopy")}
      </p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {starters.map(({ icon: Icon, title, question }) => (
          <button
            key={title}
            onClick={() => onSelect(question)}
            className="group rounded-2xl border border-line bg-white p-5 text-left transition-colors hover:border-brand/30 hover:bg-mint/40"
          >
            <div className="mb-3 flex items-center justify-between">
              <Icon size={19} className="text-brand" />
              <ArrowUpRight size={15} className="text-muted" />
            </div>
            <h2 className="text-xs font-semibold">{title}</h2>
            <p className="mt-2 text-xs leading-6 text-muted">{question}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
