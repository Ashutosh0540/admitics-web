"use client";
import Link from "next/link";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { Logo } from "./logo";
import { useTranslation } from "@/lib/i18n";

export function Footer() {
  const t = useTranslation();
  return (
    <footer className="bg-[#091d39] text-[#d2def0]">
      <div className="container-page grid gap-10 py-16 sm:grid-cols-2 xl:grid-cols-[1.5fr_repeat(3,1fr)]">
        <div className="sm:col-span-2 xl:col-span-1">
          <Logo light />
          <p className="mt-5 max-w-sm text-sm leading-7 text-[#b8c9df]">
            {t("footer.tagline")}
            <br />
            {t("footer.journey")}
          </p>
          <Link
            href="/chat"
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-4 text-sm font-bold text-[#091d39] transition-colors hover:bg-[#eaf1ff]"
          >
            {t("nav.askAdmitics")} <ArrowUpRight size={15} />
          </Link>
        </div>
        <div>
          <h2 className="mb-4 text-sm font-extrabold text-white">
            {t("footer.findDirection")}
          </h2>
          <ul className="grid gap-3 text-sm text-[#b8c9df]">
            {[
              [t("nav.explore"), "/admissions"],
              [t("nav.exams"), "/exams"],
              [t("nav.colleges"), "/colleges"],
              [t("nav.courses"), "/courses"],
              [t("nav.scholarships"), "/scholarships"],
            ].map(([label, href]) => (
              <li key={href}>
                <Link
                  className="transition-colors hover:text-white"
                  href={href}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-4 text-sm font-extrabold text-white">
            {t("footer.goodToKnow")}
          </h2>
          <ul className="grid gap-3 text-sm text-[#b8c9df]">
            {[
              [t("footer.about"), "/about"],
              [t("footer.contact"), "/contact"],
              [t("footer.privacy"), "/privacy"],
              [t("footer.terms"), "/terms"],
              [t("footer.disclaimer"), "/disclaimer"],
            ].map(([label, href]) => (
              <li key={href}>
                <Link
                  className="transition-colors hover:text-white"
                  href={href}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-4 text-sm font-extrabold text-white">
            {t("footer.trustTitle")}
          </h2>
          <div className="flex items-start gap-3 text-sm leading-6 text-[#b8c9df]">
            <ShieldCheck size={18} className="mt-1 shrink-0 text-[#83c9ff]" />
            <p>{t("footer.guidance")}</p>
          </div>
          <Link
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white hover:text-[#83c9ff]"
            href="/disclaimer"
          >
            {t("footer.disclaimer")} <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
      <div className="container-page flex flex-col justify-between gap-3 border-t border-[#29405b] py-6 text-xs leading-5 text-[#aec0d8] sm:flex-row">
        <p>
          © {new Date().getFullYear()} Admitics. {t("footer.copyright")}
        </p>
        <p>{t("footer.guidance")}</p>
      </div>
    </footer>
  );
}
