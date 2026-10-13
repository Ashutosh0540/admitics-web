"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  CalendarDays,
  Check,
  Compass,
  Cpu,
  Globe2,
  GraduationCap,
  Landmark,
  LibraryBig,
  School,
  Sparkles,
  Stethoscope,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";

const pathways: {
  key: string;
  href: string;
  icon: LucideIcon;
  tone: string;
}[] = [
  { key: "school", href: "/colleges", icon: School, tone: "#eaf1ff" },
  { key: "after10", href: "/courses", icon: Compass, tone: "#fff0e5" },
  { key: "after12", href: "/courses", icon: BookOpen, tone: "#e9f8e9" },
  { key: "medical", href: "/exams", icon: Stethoscope, tone: "#f6edff" },
  { key: "engineering", href: "/exams", icon: Cpu, tone: "#fcecf2" },
  { key: "abroad", href: "/admissions", icon: Globe2, tone: "#e7f6fa" },
  { key: "funding", href: "/scholarships", icon: Wallet, tone: "#fff5d9" },
  {
    key: "careers",
    href: "/courses",
    icon: BriefcaseBusiness,
    tone: "#e9effe",
  },
];

const areas = [
  { key: "exams", href: "/exams", icon: BookOpen },
  { key: "colleges", href: "/colleges", icon: Landmark },
  { key: "courses", href: "/courses", icon: LibraryBig },
  { key: "scholarships", href: "/scholarships", icon: Wallet },
] as const;

const topicQuestions: Record<string, number> = {
  exams: 1,
  colleges: 3,
  courses: 2,
  scholarships: 4,
  abroad: 5,
};

export function HomeView() {
  const router = useRouter();
  const t = useTranslation();
  const [question, setQuestion] = useState("");
  const [topic, setTopic] = useState("scholarships");
  const [openingChat, setOpeningChat] = useState(false);
  const handoffStarted = useRef(false);
  const questionInput = useRef<HTMLInputElement>(null);

  function submitQuestion(value: string) {
    const trimmed = value.trim();
    if (!trimmed || handoffStarted.current) return;
    handoffStarted.current = true;
    setOpeningChat(true);
    const handoffId = crypto.randomUUID();
    router.push(
      `/chat?q=${encodeURIComponent(trimmed)}&handoff=${encodeURIComponent(handoffId)}`,
    );
  }

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitQuestion(question);
  }

  const questionForTopic = (key: string) =>
    t(`home.question${topicQuestions[key] ?? 4}` as Parameters<typeof t>[0]);

  return (
    <>
      <section className="reference-hero">
        <div className="container-page grid items-center gap-10 py-12 sm:py-14 lg:grid-cols-[1.03fr_.97fr] lg:gap-10 lg:py-16">
          <div className="relative z-10">
            <Badge className="mb-3 border-[#d8e6fa] bg-[#f0f6ff] px-3 py-2 text-[#315c9d]">
              <span className="mr-1.5 size-2 rounded-full bg-[#25b28c]" />
              {t("home.badge")}
            </Badge>
            <h1 className="editorial mt-5 max-w-2xl text-[clamp(2.8rem,5.5vw,4.75rem)] leading-[1.06]">
              {t("home.title1")}{" "}
              <span className="text-brand">{t("home.title2")}</span>{" "}
              {t("home.title3")}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-[#566681] sm:text-lg">
              {t("home.intro")}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#ask"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-extrabold text-white shadow-[0_8px_20px_rgba(34,90,226,.15)] transition hover:-translate-y-0.5 hover:bg-brand-dark"
              >
                {t("home.ask")} <ArrowRight size={17} />
              </a>
              <a
                href="#explore"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#d5deed] bg-white px-5 py-3 text-sm font-extrabold text-ink transition hover:-translate-y-0.5 hover:border-brand"
              >
                {t("home.exploreAdmissions")} <ArrowUpRight size={16} />
              </a>
            </div>
            <p className="mt-5 flex items-center gap-2 text-xs leading-5 font-semibold text-muted">
              <Compass size={15} className="shrink-0 text-brand" />
              {t("home.audience")}
            </p>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-[11px] font-bold text-[#5b6c83]">
              {["home.trust1", "home.trust2", "home.trust3"].map((key) => (
                <span key={key} className="inline-flex items-center gap-1.5">
                  <Check size={13} className="text-[#159b79]" />
                  {t(key as Parameters<typeof t>[0])}
                </span>
              ))}
            </div>
          </div>
          <StudentIllustration
            labels={[t("home.trust3"), t("home.advisorTitle")]}
          />
        </div>
      </section>

      <section
        id="ask"
        aria-labelledby="ask-heading"
        className="container-page relative z-10 -mt-6 scroll-mt-24"
      >
        <div className="rounded-[22px] border border-[#e6ecf4] bg-white p-5 shadow-[0_16px_54px_rgba(16,47,96,.09)] sm:p-7">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 id="ask-heading" className="editorial text-xl sm:text-2xl">
              {t("home.dashboardHeading")}
            </h2>
            <Badge className="border-[#d8e6fa] bg-[#f0f6ff] text-[#315c9d]">
              <Sparkles size={13} className="mr-1.5" />
              {t("home.dashboardEyebrow")}
            </Badge>
          </div>
          <form
            className="flex flex-col gap-2.5 sm:flex-row"
            onSubmit={submitForm}
          >
            <label className="sr-only" htmlFor="home-question">
              {t("home.dashboardHeading")}
            </label>
            <input
              ref={questionInput}
              id="home-question"
              className="min-h-14 min-w-0 flex-1 rounded-xl border border-[#dbe4f0] bg-white px-4 text-sm text-ink placeholder:text-[#8b99ac] focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none"
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder={t("home.dashboardPlaceholder")}
              maxLength={8000}
              autoComplete="off"
              disabled={openingChat}
            />
            <button
              type="submit"
              disabled={openingChat || !question.trim()}
              className="inline-flex min-h-14 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-extrabold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50 sm:min-w-52"
            >
              {openingChat ? t("home.openingChat") : t("home.dashboardButton")}
              <ArrowRight size={17} />
            </button>
          </form>
          <div
            className="mt-3 flex flex-wrap gap-2"
            role="group"
            aria-label={t("home.questionCopy")}
          >
            {[1, 2, 3, 4, 5].map((number) => (
              <button
                key={number}
                type="button"
                disabled={openingChat}
                onClick={() => {
                  setQuestion(
                    t(`home.question${number}` as Parameters<typeof t>[0]),
                  );
                  questionInput.current?.focus();
                }}
                className="min-h-10 rounded-full border border-[#dbe6f3] bg-white px-3.5 text-xs font-bold text-[#48617e] transition hover:border-brand hover:text-brand focus-visible:outline-offset-2 disabled:opacity-50"
              >
                {t(`home.suggestion${number}` as Parameters<typeof t>[0])}
              </button>
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-5 text-muted">
            {t("home.dashboardNote")}
          </p>
        </div>
      </section>

      <section
        id="explore"
        className="scroll-mt-24 bg-[#f7f9fc] py-16 sm:py-20"
      >
        <div className="container-page">
          <div className="mb-8 max-w-3xl">
            <p className="eyebrow">{t("home.pathwayEyebrow")}</p>
            <h2 className="editorial mt-3 text-3xl sm:text-5xl">
              {t("home.pathwayTitle")}
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted sm:text-base">
              {t("home.pathwayCopy")}
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {pathways.map(({ key, href, icon: Icon, tone }) => (
              <Link
                key={key}
                href={href}
                className="group flex min-h-[218px] flex-col rounded-[20px] border border-[#e5ebf3] bg-white p-5 transition duration-200 hover:-translate-y-1 hover:border-[#cbdcf4] hover:shadow-[0_16px_54px_rgba(16,47,96,.09)] focus-visible:outline-offset-4"
              >
                <span
                  className="mb-5 flex size-12 items-center justify-center rounded-2xl text-brand"
                  style={{ backgroundColor: tone }}
                >
                  <Icon size={23} aria-hidden="true" />
                </span>
                <h3 className="text-lg font-extrabold tracking-tight text-ink">
                  {t(`home.pathways.${key}.title` as Parameters<typeof t>[0])}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted">
                  {t(`home.pathways.${key}.copy` as Parameters<typeof t>[0])}
                </p>
                <span className="mt-auto flex items-center gap-1 pt-4 text-xs font-extrabold text-brand">
                  {t("home.exploreAdmissions")} <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#091d39] py-12 text-white">
        <div className="container-page grid items-center gap-5 md:grid-cols-[1fr_auto]">
          <div>
            <p className="eyebrow text-[#83c9ff]">{t("home.clarityEyebrow")}</p>
            <h2 className="editorial mt-2 text-3xl sm:text-4xl">
              {t("home.clarityTitle")}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-[#b8c9df]">
              {t("home.uncertaintyCopy")}
            </p>
          </div>
          <a
            href="#opportunities"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-extrabold text-[#091d39] transition hover:bg-[#eaf1ff]"
          >
            {t("home.planNext")} <ArrowUpRight size={16} />
          </a>
        </div>
      </section>

      <section
        id="features"
        className="container-page scroll-mt-24 py-16 sm:py-20"
      >
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">{t("home.directionEyebrow")}</p>
            <h2 className="editorial mt-3 text-3xl sm:text-5xl">
              {t("home.directionTitle")}
            </h2>
          </div>
          <Link
            href="/admissions"
            className="inline-flex items-center gap-2 text-sm font-extrabold text-brand"
          >
            {t("home.exploreAdmissions")} <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {areas.map(({ key, href, icon: Icon }) => (
            <Link
              key={key}
              href={href}
              className="rounded-[20px] border border-line bg-white p-6 transition hover:-translate-y-1 hover:shadow-[0_16px_54px_rgba(16,47,96,.09)]"
            >
              <Icon size={25} className="mb-5 text-brand" aria-hidden="true" />
              <h3 className="text-lg font-extrabold">
                {t(`home.areas.${key}.title` as Parameters<typeof t>[0])}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                {t(`home.areas.${key}.copy` as Parameters<typeof t>[0])}
              </p>
              <p className="mt-5 border-t border-line pt-4 text-[10px] font-semibold text-muted">
                {t(`home.areas.${key}.detail` as Parameters<typeof t>[0])}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section
        id="opportunities"
        className="scroll-mt-24 bg-[#f7f9fc] py-16 sm:py-20"
      >
        <div className="container-page grid gap-8 lg:grid-cols-[.9fr_1.1fr] lg:items-center">
          <div>
            <p className="eyebrow">{t("home.directionEyebrow")}</p>
            <h2 className="editorial mt-3 text-3xl sm:text-4xl">
              {t("home.opportunityTitle")}
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              {t("home.opportunityCopy")}
            </p>
            <Link
              href="/admissions#deadlines"
              className="mt-5 inline-flex items-center gap-2 text-sm font-extrabold text-brand"
            >
              {t("home.planNext")} <ArrowUpRight size={16} />
            </Link>
          </div>
          <form
            className="rounded-[22px] border border-[#e3ebfa] bg-[#f1f6ff] p-5 sm:p-7"
            onSubmit={(event) => {
              event.preventDefault();
              submitQuestion(questionForTopic(topic));
            }}
          >
            <div className="mb-5 flex items-start gap-3">
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white text-brand">
                <CalendarDays size={22} />
              </span>
              <div>
                <h3 className="font-extrabold text-ink">
                  {t("home.questionIntro")}
                </h3>
                <p className="mt-1 text-xs leading-5 text-muted">
                  {t("home.questionCopy")}
                </p>
              </div>
            </div>
            <label
              htmlFor="opportunity-topic"
              className="mb-2 block text-xs font-bold text-ink"
            >
              {t("home.dashboardHeading")}
            </label>
            <select
              id="opportunity-topic"
              value={topic}
              onChange={(event) => setTopic(event.target.value)}
              disabled={openingChat}
              className="min-h-12 w-full rounded-xl border border-[#d8e3f2] bg-white px-3 text-sm text-ink focus:border-brand focus:ring-2 focus:ring-brand/20 focus:outline-none"
            >
              {areas.map(({ key }) => (
                <option key={key} value={key}>
                  {t(`home.areas.${key}.title` as Parameters<typeof t>[0])}
                </option>
              ))}
              <option value="abroad">{t("home.suggestion5")}</option>
            </select>
            <button
              type="submit"
              disabled={openingChat}
              className="mt-3 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-extrabold text-white transition hover:bg-brand-dark disabled:opacity-50"
            >
              {openingChat ? t("home.openingChat") : t("home.planNext")}
              <ArrowRight size={16} />
            </button>
            <p className="mt-3 text-[11px] leading-5 text-muted">
              {t("home.dashboardNote")}
            </p>
          </form>
        </div>
      </section>

      <section id="how" className="container-page scroll-mt-24 py-16 sm:py-20">
        <div className="mx-auto mb-9 max-w-3xl text-center">
          <p className="eyebrow">{t("home.journeyLabel")}</p>
          <h2 className="editorial mt-3 text-3xl sm:text-5xl">
            {t("home.advisorTitle")}
          </h2>
          <p className="mt-4 text-sm leading-7 text-muted sm:text-base">
            {t("home.advisorCopy")}
          </p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            ["01", "home.questionIntro", "home.questionsWelcome"],
            ["02", "home.directionTitle", "home.advisorCopy"],
            ["03", "home.planNext", "home.opportunityCopy"],
          ].map(([number, title, copy]) => (
            <article
              key={number}
              className="rounded-[20px] border border-line bg-white p-6"
            >
              <p className="text-4xl font-black tracking-tight text-[#d5e4f9]">
                {number}
              </p>
              <h3 className="mt-4 text-lg font-extrabold">
                {t(title as Parameters<typeof t>[0])}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                {t(copy as Parameters<typeof t>[0])}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="container-page pb-16 sm:pb-20">
        <div className="grid gap-8 rounded-[26px] border border-[#dce7f5] bg-[#f7faff] p-6 sm:p-10 md:grid-cols-2 md:items-center">
          <div>
            <p className="eyebrow">{t("home.advisorEyebrow")}</p>
            <h2 className="editorial mt-3 text-3xl sm:text-4xl">
              {t("home.chatPreviewTitle")}
            </h2>
            <p className="mt-4 text-sm leading-7 text-muted">
              {t("home.chatPreviewCopy")}
            </p>
            <ButtonLink href="/#ask" className="mt-6">
              {t("home.ask")} <ArrowUpRight size={16} />
            </ButtonLink>
          </div>
          <div className="rounded-[22px] border border-[#dde7f1] bg-white p-5 shadow-[0_22px_65px_rgba(21,57,100,.08)] sm:p-6">
            <div className="flex items-center gap-3 border-b border-line pb-4">
              <span className="flex size-10 items-center justify-center rounded-xl bg-brand text-white">
                <Sparkles size={19} />
              </span>
              <div>
                <p className="text-sm font-extrabold">{t("nav.askAdmitics")}</p>
                <p className="mt-1 text-[11px] text-muted">
                  {t("home.questionCopy")}
                </p>
              </div>
            </div>
            <p className="mt-5 ml-auto max-w-[88%] rounded-2xl rounded-br-sm bg-[#eaf1ff] p-4 text-sm leading-6 text-ink">
              {t("home.question3")}
            </p>
            <div className="mt-5 rounded-xl border border-[#dbe4f0] px-4 py-3 text-xs text-muted">
              {t("home.dashboardPlaceholder")}
            </div>
            <p className="mt-3 text-center text-[10px] leading-5 text-muted">
              {t("home.dashboardNote")}
            </p>
          </div>
        </div>
      </section>

      <section className="container-page mb-16 sm:mb-20">
        <div className="relative overflow-hidden rounded-[26px] bg-brand p-7 text-white sm:p-12">
          <GraduationCap
            size={190}
            strokeWidth={0.7}
            aria-hidden="true"
            className="absolute -right-6 -bottom-8 rotate-[-12deg] text-white/10 sm:right-8"
          />
          <div className="relative max-w-2xl">
            <p className="mb-4 text-[10px] font-extrabold tracking-[.2em] text-white/75">
              {t("home.nextStep")}
            </p>
            <h2 className="editorial text-3xl sm:text-5xl">
              {t("home.ambition")} {t("home.direction")}
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/85">
              {t("home.ctaCopy")}
            </p>
            <ButtonLink href="/#ask" variant="inverse" className="mt-6">
              {t("home.ask")} <ArrowUpRight size={17} />
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}

function StudentIllustration({ labels }: { labels: [string, string] }) {
  return (
    <div className="relative mx-auto flex min-h-[340px] w-full max-w-[570px] items-center justify-center sm:min-h-[440px]">
      <div className="absolute size-[min(78vw,420px)] rotate-[-12deg] rounded-[42%_58%_58%_42%/51%_46%_54%_49%] bg-[#d9ecff]" />
      <div className="relative z-10 h-[330px] w-[min(72%,350px)] overflow-hidden rounded-[28px] bg-[#d5e7ef] shadow-[0_30px_80px_rgba(22,68,126,.17)] sm:h-[400px]">
        <svg
          viewBox="0 0 350 420"
          className="h-full w-full"
          role="img"
          aria-label="Student reading and studying"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="350" height="420" fill="#b8d8ee" />
          <circle cx="278" cy="66" r="98" fill="#f2f8fb" opacity=".45" />
          <ellipse cx="174" cy="388" rx="136" ry="24" fill="#88adc8" />
          <path
            d="M70 415V260q12-74 103-78c89 0 109 41 112 100v133"
            fill="#24559a"
          />
          <path d="M129 173h88v88h-88z" fill="#d99870" />
          <ellipse cx="173" cy="133" rx="72" ry="86" fill="#d89a77" />
          <path
            d="M102 125c-4-60 23-103 80-103 48 0 81 44 61 111-7-26-21-41-46-49-41 31-76 22-95 41"
            fill="#243248"
          />
          <path d="M80 276q93-37 194 0l-7 139H91z" fill="#f6f8f8" />
          <path d="M66 289l108 29 108-29-21 113-89-20-89 20z" fill="#e7a764" />
          <path d="M174 319v64" stroke="#b7753f" strokeWidth="3" />
          <path d="M90 390l82-12 89 12" stroke="#bb8649" strokeWidth="2" />
          <path d="M95 295l75 28 104-28" stroke="#fbda9f" strokeWidth="6" />
        </svg>
      </div>
      <div className="absolute top-[10%] left-0 z-20 flex max-w-[210px] items-center gap-3 rounded-2xl border border-[#ecf0f5] bg-white p-3 shadow-[0_16px_54px_rgba(16,47,96,.09)] sm:left-1">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#e8f2ff] text-brand">
          <GraduationCap size={22} />
        </span>
        <span className="text-xs leading-5 font-extrabold text-ink">
          {labels[0]}
          <small className="block font-medium text-muted">{labels[1]}</small>
        </span>
      </div>
      <div className="absolute right-0 bottom-[10%] z-20 flex max-w-[210px] items-center gap-3 rounded-2xl border border-[#ecf0f5] bg-white p-3 shadow-[0_16px_54px_rgba(16,47,96,.09)] sm:right-1">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#fff3e8] text-[#d87732]">
          <Sparkles size={19} />
        </span>
        <span className="text-xs leading-5 font-extrabold text-ink">
          {labels[1]}
          <small className="block font-medium text-muted">{labels[0]}</small>
        </span>
      </div>
      <span className="sr-only">{labels.join(". ")}</span>
    </div>
  );
}
