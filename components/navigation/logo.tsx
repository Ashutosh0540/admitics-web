import Link from "next/link";
import { cn } from "@/lib/utils";

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden="true"
      className={cn("size-9 shrink-0", className)}
    >
      <rect width="40" height="40" rx="12" fill="currentColor" />
      <path
        d="M11 28 20 11l9 17M14.5 22h11"
        fill="none"
        stroke="#fafaf6"
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="29" cy="11" r="2.5" fill="#d2dba5" />
    </svg>
  );
}
export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link
      href="/"
      aria-label="Admitics home"
      className={cn(
        "inline-flex items-center gap-2.5",
        light ? "text-white" : "text-brand",
      )}
    >
      <BrandMark />
      <span
        className={cn(
          "text-[23px] font-bold tracking-[-1px]",
          light ? "text-white" : "text-ink",
        )}
      >
        admitics<span className="text-brand">.</span>
      </span>
    </Link>
  );
}
