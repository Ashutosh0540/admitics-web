"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ArrowUpRight, Menu } from "lucide-react";
import { Logo } from "./logo";
import { AccountMenu } from "@/components/auth/account-menu";
import { ButtonLink } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { cn } from "@/lib/utils";

const links = [
  ["Explore", "/admissions"],
  ["Exams", "/exams"],
  ["Colleges", "/colleges"],
  ["Courses", "/courses"],
  ["Scholarships", "/scholarships"],
  ["Ask Admitics", "/chat"],
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className="relative z-20 border-b border-line bg-paper">
      <div className="container-page flex h-20 items-center justify-between gap-6">
        <Logo />
        <nav
          aria-label="Main navigation"
          className="hidden items-center gap-5 xl:flex"
        >
          {links.map(([label, href]) => (
            <Link
              key={href}
              href={href}
              aria-current={pathname === href ? "page" : undefined}
              className={cn(
                "py-3 text-[13px] font-medium transition-colors hover:text-brand",
                pathname === href ? "text-brand" : "text-muted",
              )}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 xl:flex">
          <AccountMenu />
          <ButtonLink
            href="/signup"
            className="min-h-10 rounded-lg px-4 py-2 text-xs"
          >
            Get started <ArrowUpRight size={15} />
          </ButtonLink>
        </div>
        <button
          aria-label="Open navigation"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          className="flex size-11 items-center justify-center rounded-lg border border-line xl:hidden"
        >
          <Menu size={21} />
        </button>
      </div>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Explore Admitics"
      >
        <nav aria-label="Mobile navigation" className="grid gap-1">
          {links.map(([label, href]) => (
            <Link
              onClick={() => setOpen(false)}
              key={href}
              href={href}
              className="rounded-lg px-3 py-3 text-sm hover:bg-mint"
            >
              {label}
            </Link>
          ))}
          <div className="my-3 border-t border-line" />
          <Link
            onClick={() => setOpen(false)}
            href="/dashboard"
            className="rounded-lg px-3 py-3 text-sm hover:bg-mint"
          >
            Dashboard
          </Link>
          <Link
            onClick={() => setOpen(false)}
            href="/documents"
            className="rounded-lg px-3 py-3 text-sm hover:bg-mint"
          >
            Documents
          </Link>
          <Link
            onClick={() => setOpen(false)}
            href="/settings"
            className="rounded-lg px-3 py-3 text-sm hover:bg-mint"
          >
            Account settings
          </Link>
          <div className="flex items-center gap-3 px-3 py-2">
            <AccountMenu />
            <ButtonLink href="/signup" onClick={() => setOpen(false)}>
              Get started
            </ButtonLink>
          </div>
        </nav>
      </Modal>
    </header>
  );
}
