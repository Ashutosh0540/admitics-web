import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  Compass,
  GraduationCap,
  Landmark,
  LibraryBig,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { Badge } from "@/components/ui/primitives";
import { JourneyPreview } from "@/components/landing/journey-preview";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Your next chapter, with clarity",
  "Make smarter decisions about your education. Explore exams, colleges, courses and scholarships with Admitics, your AI admissions advisor.",
  "/",
);

const areas = [
  {
    icon: BookOpen,
    title: "Exams",
    copy: "Understand the test. Know your next step.",
    href: "/exams",
    detail: "Eligibility · Preparation · Applications",
    tone: "bg-[#edf0e7]",
  },
  {
    icon: Landmark,
    title: "Colleges",
    copy: "Find a place where you can grow.",
    href: "/colleges",
    detail: "Programs · Campuses · Admissions",
    tone: "bg-[#eeeaf2]",
  },
  {
    icon: LibraryBig,
    title: "Courses",
    copy: "Turn your interests into a direction.",
    href: "/courses",
    detail: "Streams · Careers · Pathways",
    tone: "bg-[#f3eae0]",
  },
  {
    icon: Wallet,
    title: "Scholarships",
    copy: "Discover support for your ambitions.",
    href: "/scholarships",
    detail: "Opportunities · Criteria · Applications",
    tone: "bg-[#e8eff3]",
  },
];
const questions = [
  "Which exams can I take after Class 12?",
  "Am I eligible for this course?",
  "Which colleges offer this program?",
  "What scholarships can I apply for?",
  "What documents do I need?",
];

export default function Home() {
  return (
    <>
      <section className="container-page grid items-center gap-10 py-14 lg:grid-cols-[1.1fr_1fr] lg:gap-16 lg:py-20">
        <div>
          <Badge className="mb-6 gap-2 px-3.5 py-2">
            <span className="size-1.5 rounded-full bg-brand" />
            YOUR FUTURE. A LITTLE CLEARER.
          </Badge>
          <h1 className="editorial max-w-2xl text-[clamp(3.2rem,6.2vw,5.4rem)]">
            Big dreams.
            <br />
            Better decisions.
            <br />
            <span className="text-brand">Your next chapter.</span>
          </h1>
          <p className="mt-7 max-w-md text-base leading-8 text-muted">
            From “what’s next?” to a plan you believe in. Navigate admissions,
            exams, colleges, courses, scholarships, and deadlines with Admitics.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/chat">
              Ask Admitics <ArrowUpRight size={17} />
            </ButtonLink>
            <ButtonLink href="/admissions" variant="secondary">
              Explore admissions <ArrowRight size={16} />
            </ButtonLink>
          </div>
          <p className="mt-5 flex items-center gap-2 text-xs text-muted">
            <Compass size={14} className="text-brand" />
            For students, parents, and every possibility ahead.
          </p>
        </div>
        <JourneyPreview />
      </section>
      <div className="container-page flex flex-wrap items-center justify-between gap-4 border-y border-line py-5 text-xs text-muted">
        <p className="font-semibold tracking-wide text-brand">
          ONE PLACE. YOUR WHOLE JOURNEY.
        </p>
        <div className="flex flex-wrap gap-5 sm:gap-8">
          <span>Explore possibilities</span>
          <span>Ask better questions</span>
          <span>Take your next step</span>
        </div>
        <a
          href="#your-advisor"
          aria-label="Discover your AI advisor"
          className="flex size-9 items-center justify-center rounded-full border border-line"
        >
          <ArrowDown size={14} />
        </a>
      </div>
      <section
        id="your-advisor"
        className="container-page grid gap-12 py-20 md:grid-cols-2 md:items-center lg:py-28"
      >
        <div>
          <p className="eyebrow mb-5">A GUIDE, NOT ANOTHER SEARCH RESULT</p>
          <h2 className="editorial text-4xl sm:text-5xl">
            Meet your AI
            <br />
            <span className="text-brand">admissions advisor.</span>
          </h2>
          <p className="mt-6 max-w-md text-sm leading-7 text-muted">
            You don’t need to have it all figured out. Start with a question.
            Admitics helps you connect the dots, understand your options, and
            work towards a practical next step.
          </p>
          <ul className="mt-6 space-y-3 text-sm">
            {[
              "Guidance that starts with your goals",
              "Clear explanations, without the jargon",
              "Source links and honest uncertainty",
            ].map((text) => (
              <li key={text} className="flex items-center gap-3">
                <span className="size-1.5 rounded-full bg-brand" />
                {text}
              </li>
            ))}
          </ul>
          <ButtonLink href="/chat" className="mt-8">
            Start a conversation <ArrowUpRight size={16} />
          </ButtonLink>
        </div>
        <div className="rounded-3xl border border-line bg-white p-6 sm:p-8">
          <div className="mb-6 flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-mint text-brand">
              <Sparkles size={21} />
            </span>
            <div>
              <p className="font-semibold">Every good plan starts somewhere.</p>
              <p className="mt-1 text-xs text-muted">
                Here are a few questions to get you going.
              </p>
            </div>
          </div>
          <div className="grid gap-2">
            {questions.map((q, i) => (
              <Link
                key={q}
                href={`/chat?q=${encodeURIComponent(q)}`}
                className="group flex items-center gap-3 rounded-xl border border-line p-4 text-sm transition-colors hover:border-brand/30 hover:bg-paper"
              >
                <span className="text-[10px] font-semibold text-muted">
                  0{i + 1}
                </span>
                <span>{q}</span>
                <ArrowUpRight
                  size={16}
                  className="ml-auto shrink-0 text-muted group-hover:text-brand"
                />
              </Link>
            ))}
          </div>
          <p className="mt-5 text-center text-[11px] text-muted">
            Big questions welcome. Small ones, too.
          </p>
        </div>
      </section>
      <section className="border-y border-line bg-[#f0f3ec] py-20">
        <div className="container-page">
          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="eyebrow mb-4">FIND YOUR DIRECTION</p>
              <h2 className="editorial text-4xl sm:text-5xl">
                More options. Less overwhelm.
              </h2>
            </div>
            <Link
              href="/admissions"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand"
            >
              Explore admissions <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {areas.map(({ icon: Icon, ...area }) => (
              <Link
                key={area.href}
                href={area.href}
                className="group rounded-2xl border border-line bg-white p-6 transition-transform hover:-translate-y-1"
              >
                <span
                  className={`mb-6 flex size-12 items-center justify-center rounded-2xl text-ink ${area.tone}`}
                >
                  <Icon size={23} />
                </span>
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">{area.title}</h3>
                  <ArrowUpRight
                    size={18}
                    className="text-muted group-hover:text-brand"
                  />
                </div>
                <p className="mt-3 text-sm leading-6 text-muted">{area.copy}</p>
                <p className="mt-6 border-t border-line pt-4 text-[10px] text-muted">
                  {area.detail}
                </p>
              </Link>
            ))}
          </div>
          <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-2xl border border-brand/15 bg-mint p-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <CalendarDays size={23} className="shrink-0 text-brand" />
              <div>
                <p className="text-sm font-semibold">
                  A great opportunity deserves a well-timed plan.
                </p>
                <p className="mt-1 text-xs leading-5 text-muted">
                  Build an application checklist and confirm deadlines at the
                  source.
                </p>
              </div>
            </div>
            <Link
              href="/admissions#deadlines"
              className="inline-flex shrink-0 items-center gap-2 text-xs font-semibold text-brand"
            >
              Plan your next steps <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>
      <section className="container-page grid gap-8 py-20 md:grid-cols-[.85fr_1.15fr] md:gap-20 lg:py-24">
        <div>
          <ShieldCheck size={32} className="mb-5 text-brand" />
          <p className="eyebrow mb-4">CLARITY YOU CAN BUILD ON</p>
          <h2 className="editorial text-4xl">
            Your future deserves
            <br />
            thoughtful guidance.
          </h2>
        </div>
        <div className="grid gap-7 sm:grid-cols-2">
          <div>
            <h3 className="mb-3 font-semibold">Sources, not guesswork.</h3>
            <p className="text-sm leading-7 text-muted">
              When evidence is available, guidance should link back to it.
              Official admissions notices remain your source of truth.
            </p>
          </div>
          <div>
            <h3 className="mb-3 font-semibold">Honest about uncertainty.</h3>
            <p className="text-sm leading-7 text-muted">
              Requirements change. A useful advisor helps you understand what is
              known, what needs checking, and where to look.
            </p>
          </div>
          <div className="sm:col-span-2">
            <Link
              href="/disclaimer"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand underline underline-offset-4"
            >
              How to use Admitics guidance <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </section>
      <section className="container-page mb-20">
        <div className="relative overflow-hidden rounded-3xl bg-brand p-8 text-white sm:p-14">
          <GraduationCap
            size={200}
            strokeWidth={0.6}
            aria-hidden="true"
            className="absolute -right-4 -bottom-8 rotate-[-12deg] text-white/10 sm:right-10"
          />
          <div className="relative">
            <p className="mb-5 text-[10px] font-semibold tracking-[.2em] text-white/70">
              LET’S TAKE THE NEXT STEP
            </p>
            <h2 className="editorial max-w-xl text-4xl sm:text-5xl">
              You bring the ambition.
              <br />
              We’ll help with the direction.
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-white/80">
              Your next chapter doesn’t need to start with all the answers.
              <br className="hidden sm:block" /> It can start with one good
              question.
            </p>
            <ButtonLink href="/chat" variant="inverse" className="mt-7">
              Ask Admitics <ArrowUpRight size={17} />
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
