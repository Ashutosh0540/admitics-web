"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Menu } from "lucide-react";
import { Logo } from "./logo";
import { AccountMenu } from "@/components/auth/account-menu";
import { ButtonLink } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { LanguageSelector } from "./language-selector";
import { useTranslation } from "@/lib/i18n";

const links = [
  ["explorePaths", "/#explore"],
  ["whatWeCover", "/#features"],
  ["askAdmitics", "/#ask"],
  ["opportunities", "/#opportunities"],
  ["howItWorks", "/#how"],
];

export function Header() {
  const [open, setOpen] = useState(false);
  const t = useTranslation();
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/95 backdrop-blur-xl">
      <div className="container-page flex h-[78px] items-center justify-between gap-6">
        <Logo />
        <nav
          aria-label={t("nav.main")}
          className="hidden items-center gap-4 xl:flex"
        >
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              className="py-3 text-[13px] font-semibold text-[#47566c] transition-colors hover:text-brand"
            >
              {t(`nav.${label}` as Parameters<typeof t>[0])}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 xl:flex">
          <LanguageSelector />
          <AccountMenu />
          <ButtonLink
            href="/#ask"
            className="min-h-11 rounded-xl px-4 py-2.5 text-xs"
          >
            {t("nav.askAdmitics")} <ArrowUpRight size={15} />
          </ButtonLink>
        </div>
        <button
          aria-label={t("nav.openNavigation")}
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="flex size-11 items-center justify-center rounded-xl border border-line xl:hidden"
        >
          <Menu size={21} />
        </button>
      </div>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t("nav.exploreAdmitics")}
      >
        <nav aria-label={t("nav.mobile")} className="grid gap-1">
          {links.map(([label, href]) => (
            <Link
              onClick={() => setOpen(false)}
              key={href}
              href={href}
              className="rounded-xl px-3 py-3 text-sm hover:bg-mint"
            >
              {t(`nav.${label}` as Parameters<typeof t>[0])}
            </Link>
          ))}
          <div className="my-3 border-t border-line" />
          <Link
            onClick={() => setOpen(false)}
            href="/dashboard"
            className="rounded-xl px-3 py-3 text-sm hover:bg-mint"
          >
            {t("nav.dashboard")}
          </Link>
          <Link
            onClick={() => setOpen(false)}
            href="/documents"
            className="rounded-xl px-3 py-3 text-sm hover:bg-mint"
          >
            {t("nav.documents")}
          </Link>
          <Link
            onClick={() => setOpen(false)}
            href="/settings"
            className="rounded-xl px-3 py-3 text-sm hover:bg-mint"
          >
            {t("nav.accountSettings")}
          </Link>
          <div className="flex items-center justify-between gap-3 px-3 py-2">
            <span className="text-xs text-muted">
              {t("language.currentLanguage")}
            </span>
            <LanguageSelector />
          </div>
          <div className="flex items-center gap-3 px-3 py-2">
            <AccountMenu />
            <ButtonLink href="/#ask" onClick={() => setOpen(false)}>
              {t("nav.askAdmitics")}
            </ButtonLink>
          </div>
        </nav>
      </Modal>
    </header>
  );
}
