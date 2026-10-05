"use client";
import Link from "next/link";
import { useState } from "react";
import {
  ArrowUpRight,
  BookOpen,
  Landmark,
  LibraryBig,
  Search,
  Wallet,
} from "lucide-react";
import type { ContentCategory, ContentEntry } from "@/lib/content/types";
import {
  Badge,
  EmptyState,
  Input,
  inputStyles,
} from "@/components/ui/primitives";
import { Button } from "@/components/ui/button";

const icons = {
  exams: BookOpen,
  colleges: Landmark,
  courses: LibraryBig,
  scholarships: Wallet,
};
export function ExploreList({
  category,
  entries,
}: {
  category: ContentCategory;
  entries: ContentEntry[];
}) {
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("All areas");
  const tags = [...new Set(entries.map((item) => item.tag))];
  const filtered = entries.filter(
    (item) =>
      `${item.title} ${item.subtitle} ${item.summary} ${item.tag}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (tag === "All areas" || item.tag === tag),
  );
  const Icon = icons[category];
  return (
    <>
      <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-line bg-white p-4 sm:flex-row">
        <div className="relative flex-1">
          <label htmlFor="content-search" className="sr-only">
            Search {category}
          </label>
          <Search size={17} className="absolute top-4 left-4 text-muted" />
          <Input
            id="content-search"
            type="search"
            placeholder={`Find ${category === "colleges" ? "a college" : category === "courses" ? "a course" : category === "exams" ? "an exam" : "support"}…`}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="border-transparent bg-paper pl-11"
          />
        </div>
        <label className="sr-only" htmlFor="area-filter">
          Filter by area
        </label>
        <select
          id="area-filter"
          value={tag}
          onChange={(event) => setTag(event.target.value)}
          className={`${inputStyles} sm:w-56`}
        >
          <option>All areas</option>
          {tags.map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
      </div>
      <p role="status" className="mb-5 text-xs text-muted">
        {filtered.length} starter overview{filtered.length !== 1 ? "s" : ""}
      </p>
      {filtered.length === 0 ? (
        <EmptyState
          title="No matches just yet"
          description="Try a different search or area. This collection will grow as reviewed content is added."
          action={
            <Button
              variant="secondary"
              onClick={() => {
                setQuery("");
                setTag("All areas");
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((entry) => (
            <article
              key={entry.slug}
              className="flex flex-col rounded-2xl border border-line bg-white p-6"
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="flex size-11 items-center justify-center rounded-xl bg-mint text-brand">
                  <Icon size={21} />
                </span>
                <Badge tone="neutral">{entry.tag}</Badge>
              </div>
              <h2 className="text-xl font-semibold tracking-tight">
                {entry.title}
              </h2>
              <p className="mt-2 text-[11px] text-muted">{entry.subtitle}</p>
              <p className="mt-4 flex-1 text-sm leading-7 text-muted">
                {entry.summary}
              </p>
              <dl className="mt-5 space-y-2 border-t border-line pt-4">
                {entry.facts.map((fact) => (
                  <div
                    key={fact.label}
                    className="flex items-start justify-between gap-4 text-[10px] leading-5"
                  >
                    <dt className="shrink-0 text-muted">{fact.label}</dt>
                    <dd className="text-right">{fact.value}</dd>
                  </div>
                ))}
              </dl>
              <Link
                href={`/${category}/${entry.slug}`}
                className="mt-6 flex items-center justify-between rounded-lg bg-paper px-3 py-3 text-xs font-semibold text-brand"
              >
                Explore {entry.title}
                <ArrowUpRight size={15} />
              </Link>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
