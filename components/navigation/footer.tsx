"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Logo } from "./logo";
import { useTranslation } from "@/lib/i18n";

export function Footer() {
  const t = useTranslation();
  return (
    <footer className="border-t border-line bg-white">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.6fr_1fr_1fr]">
        <div>
          <Logo />
          <p className="mt-5 max-w-xs text-sm leading-7 text-muted">
            {t("footer.tagline")}
            <br />
            {t("footer.journey")}
          </p>
          <Link
            href="/chat"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand"
          >
            {t("nav.askAdmitics")} <ArrowUpRight size={15} />
          </Link>
        </div>
        <div>
          <h2 className="eyebrow mb-4">{t("footer.findDirection")}</h2>
          <ul className="grid gap-3 text-sm text-muted">
            {[
              [t("nav.explore"), "/admissions"],
              [t("nav.exams"), "/exams"],
              [t("nav.colleges"), "/colleges"],
              [t("nav.courses"), "/courses"],
              [t("nav.scholarships"), "/scholarships"],
            ].map(([label, href]) => (
              <li key={href}>
                <Link className="hover:text-brand" href={href}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="eyebrow mb-4">{t("footer.goodToKnow")}</h2>
          <ul className="grid gap-3 text-sm text-muted">
            {[
              [t("footer.about"), "/about"],
              [t("footer.contact"), "/contact"],
              [t("footer.privacy"), "/privacy"],
              [t("footer.terms"), "/terms"],
              [t("footer.disclaimer"), "/disclaimer"],
            ].map(([label, href]) => (
              <li key={href}>
                <Link className="hover:text-brand" href={href}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="container-page flex flex-col justify-between gap-3 border-t border-line py-6 text-xs leading-5 text-muted sm:flex-row">
        <p>
          © {new Date().getFullYear()} Admitics. {t("footer.copyright")}
        </p>
        <p>{t("footer.guidance")}</p>
      </div>
    </footer>
  );
}
