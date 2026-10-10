"use client";

import * as React from "react";
import { Search, Sparkles } from "lucide-react";
import type { Exam } from "@/types";
import { Button, ButtonLink } from "@/components/ui/button";
import {
  Badge,
  EmptyState,
  Input,
  inputStyles,
} from "@/components/ui/primitives";
import { ExamCard } from "./exam-card";
import { useTranslation } from "@/lib/i18n";

export function ExamDirectory({ exams }: { exams: Exam[] }) {
  const t = useTranslation();
  const [query, setQuery] = React.useState("");
  const [area, setArea] = React.useState("All areas");
  const [level, setLevel] = React.useState("All levels");
  const areas = [...new Set(exams.map((exam) => exam.category))];
  const filtered = exams.filter((exam) => {
    const searchable =
      `${exam.name} ${exam.shortName ?? ""} ${exam.category} ${exam.level} ${exam.summary}`.toLowerCase();
    return (
      searchable.includes(query.trim().toLowerCase()) &&
      (area === "All areas" || exam.category === area) &&
      (level === "All levels" || exam.level === level)
    );
  });
  const clearFilters = () => {
    setQuery("");
    setArea("All areas");
    setLevel("All levels");
  };

  return (
    <>
      <div className="container-page py-14 sm:py-20">
        <div className="max-w-3xl">
          <Badge className="mb-5 gap-2 px-3 py-1.5">
            <span
              className="size-1.5 rounded-full bg-brand"
              aria-hidden="true"
            />
            {t("exams.previewBadge")}
          </Badge>
          <h1 className="editorial text-5xl sm:text-6xl">{t("exams.title")}</h1>
          <p className="mt-6 max-w-2xl text-base leading-8 text-muted">
            {t("exams.intro")}
          </p>
        </div>
        <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-brand/15 bg-mint/60 p-4 text-xs leading-6 text-muted sm:flex-row sm:items-start sm:p-5">
          <span className="mt-0.5 shrink-0 rounded-full bg-white px-2 py-1 text-[10px] font-semibold tracking-wide text-brand uppercase">
            {t("exams.previewData")}
          </span>
          <p>{t("exams.previewCopy")}</p>
        </div>

        <section aria-labelledby="directory-heading" className="mt-12">
          <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow mb-3">{t("exams.browse")}</p>
              <h2
                id="directory-heading"
                className="editorial text-4xl sm:text-5xl"
              >
                {t("exams.startingPoint")}
              </h2>
            </div>
            <p className="max-w-xs text-xs leading-5 text-muted sm:text-right">
              {t("exams.browseCopy")}
            </p>
          </div>

          <div className="mb-8 grid gap-3 rounded-2xl border border-line bg-white p-4 md:grid-cols-[1.5fr_1fr_1fr] md:p-5">
            <div className="relative">
              <label htmlFor="exam-search" className="sr-only">
                {t("exams.search")}
              </label>
              <Search
                size={17}
                className="absolute top-4 left-4 text-muted"
                aria-hidden="true"
              />
              <Input
                id="exam-search"
                type="search"
                role="searchbox"
                placeholder={t("exams.search")}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="border-transparent bg-paper pl-11"
              />
            </div>
            <div>
              <label htmlFor="area-filter" className="sr-only">
                Filter by area
              </label>
              <select
                id="area-filter"
                value={area}
                onChange={(event) => setArea(event.target.value)}
                className={inputStyles}
              >
                <option>All areas</option>
                {areas.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="level-filter" className="sr-only">
                Filter by level
              </label>
              <select
                id="level-filter"
                value={level}
                onChange={(event) => setLevel(event.target.value)}
                className={inputStyles}
              >
                <option>All levels</option>
                <option value="UG">{t("exams.undergraduate")}</option>
                <option value="PG">{t("exams.postgraduate")}</option>
              </select>
            </div>
          </div>

          <p
            role="status"
            aria-live="polite"
            className="mb-5 text-xs text-muted"
          >
            {t("exams.showing", {
              count: filtered.length,
              item: filtered.length === 1 ? t("exams.exam") : t("exams.exams"),
            })}
          </p>
          {filtered.length === 0 ? (
            <EmptyState
              title={t("exams.noMatches")}
              description={t("exams.noMatchesCopy")}
              action={
                <Button variant="secondary" onClick={clearFilters}>
                  {t("explore.clearFilters")}
                </Button>
              }
            />
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((exam) => (
                <ExamCard key={exam.id} exam={exam} />
              ))}
            </div>
          )}
        </section>
      </div>
      <section className="border-y border-line bg-[#f0f3ec] py-14 sm:py-16">
        <div className="container-page flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="flex gap-4">
            <Sparkles
              className="mt-1 shrink-0 text-brand"
              size={21}
              aria-hidden="true"
            />
            <div>
              <h2 className="font-semibold">{t("exams.notSure")}</h2>
              <p className="mt-2 max-w-xl text-sm leading-7 text-muted">
                {t("exams.notSureCopy")}
              </p>
            </div>
          </div>
          <ButtonLink
            href="/chat?q=Help%20me%20compare%20exam%20pathways&context=exam-directory&profile=not-provided"
            className="shrink-0"
          >
            {t("nav.askAdmitics")}
          </ButtonLink>
        </div>
      </section>
    </>
  );
}
