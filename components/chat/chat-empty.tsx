import {
  ArrowUpRight,
  BookOpen,
  Compass,
  FileCheck2,
  Wallet,
} from "lucide-react";
import { BrandMark } from "@/components/navigation/logo";

const starters = [
  {
    icon: Compass,
    title: "Find my direction",
    question: "What are my options after Class 12?",
  },
  {
    icon: BookOpen,
    title: "Understand an exam",
    question: "How do I choose between JEE Main and CUET?",
  },
  {
    icon: Wallet,
    title: "Explore scholarships",
    question: "What scholarships can I apply for?",
  },
  {
    icon: FileCheck2,
    title: "Get application-ready",
    question: "What documents do I need for college applications?",
  },
];
export function ChatEmpty({
  onSelect,
}: {
  onSelect: (question: string) => void;
}) {
  return (
    <div className="mx-auto flex min-h-full max-w-2xl flex-col justify-center py-10 sm:py-14">
      <BrandMark className="mb-6 size-12 text-brand" />
      <p className="eyebrow mb-4">YOUR NEXT CHAPTER STARTS HERE</p>
      <h1 className="editorial text-4xl sm:text-5xl">
        What’s on your mind
        <br />
        <span className="text-brand">about your future?</span>
      </h1>
      <p className="mt-5 max-w-lg text-sm leading-7 text-muted">
        A big decision, a small doubt, or a plan you’re still figuring out.
        Let’s take it one question at a time.
      </p>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {starters.map(({ icon: Icon, title, question }) => (
          <button
            key={title}
            onClick={() => onSelect(question)}
            className="group rounded-2xl border border-line bg-white p-5 text-left transition-colors hover:border-brand/30 hover:bg-mint/40"
          >
            <div className="mb-3 flex items-center justify-between">
              <Icon size={19} className="text-brand" />
              <ArrowUpRight size={15} className="text-muted" />
            </div>
            <h2 className="text-xs font-semibold">{title}</h2>
            <p className="mt-2 text-xs leading-6 text-muted">{question}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
