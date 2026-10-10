"use client";

import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Compass,
  GraduationCap,
  Landmark,
  LibraryBig,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";
import { useTranslation } from "@/lib/i18n";
import { JourneyPreview } from "./journey-preview";

export function HomeView() {
  const t = useTranslation();
  const areas = [
    { icon: BookOpen, key: "exams", href: "/exams", tone: "bg-[#edf0e7]" },
    {
      icon: Landmark,
      key: "colleges",
      href: "/colleges",
      tone: "bg-[#eeeaf2]",
    },
    {
      icon: LibraryBig,
      key: "courses",
      href: "/courses",
      tone: "bg-[#f3eae0]",
    },
    {
      icon: Wallet,
      key: "scholarships",
      href: "/scholarships",
      tone: "bg-[#e8eff3]",
    },
  ] as const;
  const questions = [1, 2, 3, 4, 5].map((number) =>
    t(`home.question${number}` as Parameters<typeof t>[0]),
  );
  return (
    <>
      <section className="container-page grid items-center gap-10 py-14 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:py-20">
        <div>
          <Badge className="mb-6 gap-2 px-3.5 py-2">
            <span className="size-1.5 rounded-full bg-brand" />
            {t("home.badge")}
          </Badge>
          <h1 className="editorial max-w-2xl text-[clamp(3.2rem,6.2vw,5.4rem)]">
            {t("home.title1")}
            <br />
            {t("home.title2")}
            <br />
            <span className="text-brand">{t("home.title3")}</span>
          </h1>
          <p className="mt-7 max-w-md text-base leading-8 text-muted">
            {t("home.intro")}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/chat">
              {t("home.ask")} <ArrowUpRight size={17} />
            </ButtonLink>
            <ButtonLink href="/admissions" variant="secondary">
              {t("home.exploreAdmissions")} <ArrowRight size={16} />
            </ButtonLink>
          </div>
          <p className="mt-5 flex items-center gap-2 text-xs text-muted">
            <Compass size={14} className="text-brand" />
            {t("home.audience")}
          </p>
        </div>
        <JourneyPreview />
      </section>
      <div className="container-page flex flex-wrap items-center justify-between gap-4 border-y border-line py-5 text-xs text-muted">
        <p className="font-semibold tracking-wide text-brand">
          {t("home.journeyLabel")}
        </p>
        <div className="flex flex-wrap gap-5 sm:gap-8">
          <span>{t("home.explorePossibilities")}</span>
          <span>{t("home.askBetter")}</span>
          <span>{t("home.takeNext")}</span>
        </div>
        <a
          href="#your-advisor"
          aria-label={t("home.discoverAdvisor")}
          className="flex size-9 items-center justify-center rounded-full border border-line"
        >
          <ArrowDown size={14} />
        </a>
      </div>
      <section
        id="your-advisor"
        className="container-page grid gap-12 py-20 md:grid-cols-2 md:items-center lg:py-28"
      >
        <div>
          <p className="eyebrow mb-5">{t("home.advisorEyebrow")}</p>
          <h2 className="editorial text-4xl sm:text-5xl">
            {t("home.advisorTitle")}
          </h2>
          <p className="mt-6 max-w-md text-sm leading-7 text-muted">
            {t("home.advisorCopy")}
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              "home.goalGuidance",
              "home.clearExplanations",
              "home.sourceLinks",
            ].map((key) => (
              <li key={key} className="flex items-center gap-3">
                <span className="size-1.5 rounded-full bg-brand" />
                {t(key as Parameters<typeof t>[0])}
              </li>
            ))}
          </ul>
          <ButtonLink href="/chat" className="mt-8">
            {t("home.startConversation")} <ArrowUpRight size={16} />
          </ButtonLink>
        </div>
        <div className="rounded-3xl border border-line bg-white p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-mint text-brand">
              <Sparkles size={21} />
            </span>
            <div>
              <p className="font-semibold">{t("home.questionIntro")}</p>
              <p className="mt-1 text-xs text-muted">
                {t("home.questionCopy")}
              </p>
            </div>
          </div>
          <div className="grid gap-2">
            {questions.map((q, i) => (
              <Link
                key={q}
                href={`/chat?q=${encodeURIComponent(q)}`}
                className="group flex items-center gap-3 rounded-xl border border-line p-4 text-sm transition-colors hover:border-brand/30 hover:bg-paper"
              >
                <span className="text-[10px] font-semibold text-muted">
                  0{i + 1}
                </span>
                <span>{q}</span>
                <ArrowUpRight
                  size={16}
                  className="ml-auto shrink-0 text-muted group-hover:text-brand"
                />
              </Link>
            ))}
          </div>
          <p className="mt-5 text-center text-[11px] text-muted">
            {t("home.questionsWelcome")}
          </p>
        </div>
      </section>
      <section className="border-y border-line bg-[#f0f3ec] py-20">
        <div className="container-page">
          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow mb-4">{t("home.directionEyebrow")}</p>
              <h2 className="editorial text-4xl sm:text-5xl">
                {t("home.directionTitle")}
              </h2>
            </div>
            <Link
              href="/admissions"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand"
            >
              {t("home.exploreAdmissions")} <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {areas.map(({ icon: Icon, key, href, tone }) => (
              <Link
                key={href}
                href={href}
                className="group rounded-2xl border border-line bg-white p-6 transition-transform hover:-translate-y-1"
              >
                <span
                  className={`mb-6 flex size-12 items-center justify-center rounded-2xl text-ink ${tone}`}
                >
                  <Icon size={23} />
                </span>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">
                    {t(`home.areas.${key}.title` as Parameters<typeof t>[0])}
                  </h3>
                  <ArrowUpRight
                    size={18}
                    className="text-muted group-hover:text-brand"
                  />
                </div>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {t(`home.areas.${key}.copy` as Parameters<typeof t>[0])}
                </p>
                <p className="mt-6 border-t border-line pt-4 text-[10px] text-muted">
                  {t(`home.areas.${key}.detail` as Parameters<typeof t>[0])}
                </p>
              </Link>
            ))}
          </div>
          <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-2xl border border-brand/15 bg-mint p-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <CalendarDays size={23} className="shrink-0 text-brand" />
              <div>
                <p className="text-sm font-semibold">
                  {t("home.opportunityTitle")}
                </p>
                <p className="mt-1 text-xs leading-5 text-muted">
                  {t("home.opportunityCopy")}
                </p>
              </div>
            </div>
            <Link
              href="/admissions#deadlines"
              className="inline-flex shrink-0 items-center gap-2 text-xs font-semibold text-brand"
            >
              {t("home.planNext")} <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
      <section className="container-page grid gap-8 py-20 md:grid-cols-[.85fr_1.15fr] md:gap-20 lg:py-24">
        <div>
          <ShieldCheck size={32} className="mb-5 text-brand" />
          <p className="eyebrow mb-4">{t("home.clarityEyebrow")}</p>
          <h2 className="editorial text-4xl">{t("home.clarityTitle")}</h2>
        </div>
        <div className="grid gap-7 sm:grid-cols-2">
          <div>
            <h3 className="mb-3 font-semibold">{t("home.sourcesTitle")}</h3>
            <p className="text-sm leading-7 text-muted">
              {t("home.sourcesCopy")}
            </p>
          </div>
          <div>
            <h3 className="mb-3 font-semibold">{t("home.uncertaintyTitle")}</h3>
            <p className="text-sm leading-7 text-muted">
              {t("home.uncertaintyCopy")}
            </p>
          </div>
          <div className="sm:col-span-2">
            <Link
              href="/disclaimer"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand underline underline-offset-4"
            >
              {t("home.useGuidance")} <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </section>
      <section className="container-page mb-20">
        <div className="relative overflow-hidden rounded-3xl bg-brand p-8 text-white sm:p-14">
          <GraduationCap
            size={200}
            strokeWidth={0.6}
            aria-hidden="true"
            className="absolute -right-4 -bottom-8 rotate-[-12deg] text-white/10 sm:right-10"
          />
          <div className="relative">
            <p className="mb-5 text-[10px] font-semibold tracking-[.2em] text-white/70">
              {t("home.nextStep")}
            </p>
            <h2 className="editorial max-w-xl text-4xl sm:text-5xl">
              {t("home.ambition")}
              <br />
              {t("home.direction")}
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-white/80">
              {t("home.ctaCopy")}
            </p>
            <ButtonLink href="/chat" variant="inverse" className="mt-7">
              {t("home.ask")} <ArrowUpRight size={17} />
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
