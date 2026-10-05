import Link from "next/link";
import type { ButtonHTMLAttributes, ComponentProps } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "inverse";
export function buttonStyles(variant: Variant = "primary", className?: string) {
  return cn(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50",
    variant === "primary" && "bg-brand text-white hover:bg-brand-dark",
    variant === "inverse" && "bg-white text-brand hover:bg-mint",
    variant === "secondary" &&
      "border border-line bg-white text-ink hover:bg-mint",
    variant === "ghost" && "text-muted hover:bg-mint hover:text-brand",
    variant === "danger" && "bg-danger text-white hover:bg-red-900",
    className,
  );
}
export function Button({
  variant,
  loading,
  className,
  children,
  disabled,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  loading?: boolean;
}) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={buttonStyles(variant, className)}
      aria-busy={loading || undefined}
    >
      {loading && (
        <LoaderCircle size={16} className="animate-spin" aria-hidden="true" />
      )}
      {children}
    </button>
  );
}
export function ButtonLink({
  variant,
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link {...props} className={buttonStyles(variant, className)} />;
}
