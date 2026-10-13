"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden="true"
      className={cn("size-9 shrink-0", className)}
    >
      <rect width="40" height="40" rx="11" fill="#225ae2" />
      <text
        x="19"
        y="31"
        textAnchor="middle"
        fill="white"
        fontFamily="DM Sans, sans-serif"
        fontSize="31"
        fontWeight="800"
        letterSpacing="-2"
      >
        a
      </text>
      <circle
        cx="32"
        cy="7"
        r="4.5"
        fill="#ffb874"
        stroke="white"
        strokeWidth="2"
      />
    </svg>
  );
}
export function Logo({ light = false }: { light?: boolean }) {
  const t = useTranslation();
  return (
    <Link
      href="/"
      aria-label={`${t("nav.exploreAdmitics")} · Admitics`}
      className={cn(
        "inline-flex items-center gap-2.5",
        light ? "text-white" : "text-brand",
      )}
    >
      <BrandMark />
      <span
        className={cn(
          "text-[25px] font-extrabold tracking-[-1.2px]",
          light ? "text-white" : "text-ink",
        )}
      >
        admit
        <span className={light ? "text-white" : "text-brand"}>ics</span>
        <span className={light ? "text-white/60" : "text-[#92a3b9]"}>.</span>
      </span>
    </Link>
  );
}
