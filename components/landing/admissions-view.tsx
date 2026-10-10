"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Check,
  Compass,
  Landmark,
  Wallet,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/primitives";
import { useTranslation } from "@/lib/i18n";

export function AdmissionsView() {
  const t = useTranslation();
  const steps = [
    [Compass, "direction", "/courses"],
    [BookOpen, "pathway", "/exams"],
    [Landmark, "shortlist", "/colleges"],
    [Wallet, "investment", "/scholarships"],
  ] as const;
  return (
    <div className="container-page py-14 sm:py-20">
      <p className="eyebrow mb-4">{t("admissions.eyebrow")}</p>
      <h1 className="editorial max-w-3xl text-5xl sm:text-6xl">
        {t("admissions.title")}
        <br />
        <span className="text-brand">{t("admissions.titleAccent")}</span>
      </h1>
      <p className="mt-6 max-w-2xl text-sm leading-8 text-muted">
        {t("admissions.intro")}
      </p>
      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {steps.map(([Icon, key, href], index) => (
          <Link
            key={key}
            href={href}
            className="group rounded-2xl border border-line bg-white p-7"
          >
            <div className="mb-6 flex items-center justify-between">
              <Icon size={26} className="text-brand" />
              <span className="text-xs text-muted">0{index + 1}</span>
            </div>
            <h2 className="text-lg font-semibold">
              {t(`admissions.steps.${key}.title` as Parameters<typeof t>[0])}
            </h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              {t(`admissions.steps.${key}.copy` as Parameters<typeof t>[0])}
            </p>
            <ArrowUpRight size={18} className="mt-5 text-brand" />
          </Link>
        ))}
      </div>
      <section id="deadlines" className="mt-12 scroll-mt-8">
        <Card className="bg-mint p-7 sm:p-10">
          <div className="flex items-center gap-3">
            <CalendarDays size={25} className="text-brand" />
            <h2 className="editorial text-3xl sm:text-4xl">
              {t("admissions.datesTitle")}
            </h2>
          </div>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-muted">
            {t("admissions.datesCopy")}
          </p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {[1, 2, 3, 4].map((number) => (
              <li
                key={number}
                className="flex items-start gap-2 text-xs leading-6"
              >
                <Check size={15} className="mt-1 shrink-0 text-brand" />
                {t(`admissions.date${number}` as Parameters<typeof t>[0])}
              </li>
            ))}
          </ul>
          <ButtonLink
            href={`/chat?q=${encodeURIComponent(t("admissions.chatPrompt"))}`}
            className="mt-7"
          >
            {t("admissions.buildPlan")} <ArrowUpRight size={15} />
          </ButtonLink>
        </Card>
      </section>
    </div>
  );
}
