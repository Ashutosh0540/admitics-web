import type { HTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { AlertCircle, ArrowRight, LoaderCircle, Sprout } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-2xl border border-line bg-white p-6", className)}
      {...props}
    />
  );
}
export function Badge({
  children,
  tone = "green",
  className,
}: {
  children: ReactNode;
  tone?: "green" | "neutral" | "amber" | "red";
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium",
        tone === "green" && "bg-mint text-brand",
        tone === "neutral" && "bg-stone-100 text-muted",
        tone === "amber" && "bg-amber-50 text-amber",
        tone === "red" && "bg-red-50 text-danger",
        className,
      )}
    >
      {children}
    </span>
  );
}
export const inputStyles =
  "w-full min-h-12 rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink placeholder:text-muted/70 disabled:opacity-50";
export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputStyles, className)} />;
}
export function LoadingState({
  label = "Getting things ready…",
}: {
  label?: string;
}) {
  return (
    <div
      role="status"
      className="flex min-h-48 flex-col items-center justify-center gap-4 text-sm text-muted"
    >
      <LoaderCircle
        className="animate-spin text-brand"
        size={24}
        aria-hidden="true"
      />
      <span>{label}</span>
    </div>
  );
}
export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line px-6 py-12 text-center">
      <Sprout
        className="mx-auto mb-4 text-brand"
        size={30}
        aria-hidden="true"
      />
      <h3 className="font-semibold">{title}</h3>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-muted">
        {description}
      </p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
export function ErrorState({
  message,
  retry,
}: {
  message: string;
  retry?: () => void;
}) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 p-4"
    >
      <div className="flex items-start gap-3">
        <AlertCircle
          size={19}
          className="mt-0.5 shrink-0 text-danger"
          aria-hidden="true"
        />
        <p className="text-sm leading-6 text-danger">{message}</p>
      </div>
      {retry && (
        <Button
          variant="secondary"
          onClick={retry}
          className="mt-3 min-h-9 py-1.5"
        >
          Try again <ArrowRight size={14} />
        </Button>
      )}
    </div>
  );
}
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn("animate-pulse rounded-xl bg-line/70", className)}
    />
  );
}
