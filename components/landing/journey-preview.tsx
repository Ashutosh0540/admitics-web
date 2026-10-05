import Link from "next/link";
import {
  ArrowUpRight,
  Check,
  Compass,
  FileCheck2,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { BrandMark } from "@/components/navigation/logo";

export function JourneyPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[480px] py-5 lg:py-12">
      <div
        aria-hidden="true"
        className="subtle-grid absolute inset-0 rounded-[2rem] bg-[#edf1e8]"
      />
      <div className="relative mx-5 rounded-2xl border border-white bg-white p-5 shadow-[0_12px_45px_-20px_#283d3350] sm:mx-8 sm:p-7">
        <div className="flex items-center gap-3 border-b border-line pb-5">
          <BrandMark className="size-10 text-brand" />
          <div>
            <p className="text-sm font-semibold">Your next chapter</p>
            <p className="mt-0.5 text-xs text-muted">
              Big possibilities. Clear next steps.
            </p>
          </div>
          <span className="ml-auto size-2 rounded-full bg-brand" />
        </div>
        <div className="mt-5 flex items-start gap-3">
          <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-peach text-xs font-semibold">
            You
          </span>
          <p className="rounded-xl rounded-tl-sm bg-paper px-4 py-3 text-sm leading-6">
            I love solving problems. Where could that take me after Class 12?
          </p>
        </div>
        <div className="mt-5">
          <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-brand">
            <Sparkles size={14} /> A world of possibilities
          </div>
          <p className="text-sm leading-6 text-muted">
            Let’s find a path that fits your interests, strengths, and
            ambitions.
          </p>
          <div className="mt-4 grid gap-2">
            {[
              [
                GraduationCap,
                "Explore your options",
                "Engineering, sciences & beyond",
              ],
              [Compass, "Find your right fit", "Compare courses and colleges"],
              [
                FileCheck2,
                "Make a confident plan",
                "Exams, eligibility & applications",
              ],
            ].map(([Icon, title, subtitle]) => {
              const ItemIcon = Icon as typeof Compass;
              return (
                <div
                  key={title as string}
                  className="flex items-center gap-3 rounded-xl border border-line p-3"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-mint text-brand">
                    <ItemIcon size={17} />
                  </span>
                  <div>
                    <p className="text-xs font-semibold">{title as string}</p>
                    <p className="mt-1 text-[11px] text-muted">
                      {subtitle as string}
                    </p>
                  </div>
                  <ArrowUpRight size={14} className="ml-auto text-muted" />
                </div>
              );
            })}
          </div>
        </div>
        <Link
          href="/chat"
          className="mt-5 flex items-center justify-between rounded-xl bg-brand px-4 py-3 text-xs font-semibold text-white"
        >
          Let’s figure it out together <ArrowUpRight size={16} />
        </Link>
      </div>
      <div className="relative mx-auto -mt-1 flex w-fit items-center gap-2 rounded-full border border-line bg-paper px-4 py-2.5 text-xs font-medium shadow-sm">
        <span className="flex size-5 items-center justify-center rounded-full bg-mint text-brand">
          <Check size={12} />
        </span>
        A clearer path starts with a question.
      </div>
    </div>
  );
}
