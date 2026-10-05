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
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Explore admissions",
  "Build a practical admissions plan: explore courses, exams, colleges, scholarships and deadlines.",
  "/admissions",
);
export default function AdmissionsPage() {
  return (
    <div className="container-page py-14 sm:py-20">
      <p className="eyebrow mb-4">FROM POSSIBILITY TO A PLAN</p>
      <h1 className="editorial max-w-3xl text-5xl sm:text-6xl">
        You don’t need every answer.
        <br />
        <span className="text-brand">Just a good next step.</span>
      </h1>
      <p className="mt-6 max-w-2xl text-sm leading-8 text-muted">
        Admissions can feel like a lot of moving parts. Give each one a place:
        what you want to study, where you could go, how to apply, and how to
        make it work.
      </p>
      <div className="mt-12 grid gap-5 sm:grid-cols-2">
        {[
          [
            Compass,
            "01",
            "Find your direction",
            "Explore courses that connect your interests to meaningful learning.",
            "/courses",
          ],
          [
            BookOpen,
            "02",
            "Understand the pathway",
            "Check required subjects, entrance exams, and current eligibility.",
            "/exams",
          ],
          [
            Landmark,
            "03",
            "Build a thoughtful shortlist",
            "Compare programs, locations, student support, and the practical details.",
            "/colleges",
          ],
          [
            Wallet,
            "04",
            "Plan for the investment",
            "Explore financial support and check the criteria for specific schemes.",
            "/scholarships",
          ],
        ].map(([Icon, number, title, copy, href]) => {
          const ItemIcon = Icon as typeof Compass;
          return (
            <Link
              key={number as string}
              href={href as string}
              className="group rounded-2xl border border-line bg-white p-7"
            >
              <div className="mb-6 flex items-center justify-between">
                <ItemIcon size={26} className="text-brand" />
                <span className="text-xs text-muted">{number as string}</span>
              </div>
              <h2 className="text-lg font-semibold">{title as string}</h2>
              <p className="mt-3 text-sm leading-7 text-muted">
                {copy as string}
              </p>
              <ArrowUpRight size={18} className="mt-5 text-brand" />
            </Link>
          );
        })}
      </div>
      <section id="deadlines" className="mt-12 scroll-mt-8">
        <Card className="bg-mint p-7 sm:p-10">
          <div className="flex items-center gap-3">
            <CalendarDays size={25} className="text-brand" />
            <h2 className="editorial text-3xl sm:text-4xl">
              Make space for the important dates.
            </h2>
          </div>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-muted">
            We aren’t publishing unverified deadlines. Use the current official
            admissions notice to build a checklist for each application.
          </p>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {[
              "Application opening and closing date",
              "Entrance exam registration and exam date",
              "Counseling or choice-filling windows",
              "Document verification and fee-payment deadlines",
            ].map((item) => (
              <li
                key={item}
                className="flex items-start gap-2 text-xs leading-6"
              >
                <Check size={15} className="mt-1 shrink-0 text-brand" />
                {item}
              </li>
            ))}
          </ul>
          <ButtonLink
            href={`/chat?q=${encodeURIComponent("Help me build an admissions application checklist.")}`}
            className="mt-7"
          >
            Build a plan with Admitics <ArrowUpRight size={15} />
          </ButtonLink>
        </Card>
      </section>
    </div>
  );
}
