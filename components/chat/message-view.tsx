"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { Check, Copy, ThumbsDown, ThumbsUp } from "lucide-react";
import type { Message } from "@/types";
import { BrandMark } from "@/components/navigation/logo";
import { SourceCards } from "@/components/sources/source-cards";
import { cn } from "@/lib/utils";

const Markdown = dynamic(() => import("./safe-markdown"), {
  loading: () => (
    <p className="text-sm leading-7 whitespace-pre-wrap">Loading response…</p>
  ),
});

export function MessageView({
  message,
  streaming = false,
}: {
  message: Message;
  streaming?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<"helpful" | "unhelpful" | null>(
    null,
  );
  const [copyError, setCopyError] = useState("");
  if (message.role === "user")
    return (
      <article aria-label="Your question" className="mb-7 flex justify-end">
        <div className="max-w-[90%] rounded-2xl rounded-br-md bg-mint px-5 py-3.5 sm:max-w-[80%]">
          <p className="text-sm leading-7 whitespace-pre-wrap">
            {message.content}
          </p>
          {message.documentIds.length > 0 && (
            <p className="mt-2 text-[10px] text-brand">
              With {message.documentIds.length} document
              {message.documentIds.length > 1 ? "s" : ""} in context
            </p>
          )}
        </div>
      </article>
    );
  return (
    <article aria-label="Admitics response" className="mb-9">
      <div className="mb-3 flex items-center gap-2.5">
        <BrandMark className="size-7 text-brand" />
        <h2 className="text-xs font-semibold">Admitics</h2>
        <span className="text-[10px] text-muted">Your admissions advisor</span>
      </div>
      <div className="pl-0 sm:pl-[38px]">
        <Markdown content={message.content} />
        <SourceCards
          sources={message.sources}
          citations={message.citations}
          preview={message.preview}
        />
        {message.answerVerification && (
          <p className="mt-3 text-xs leading-6 text-muted">
            {message.answerVerification === "abstained"
              ? "Admitics could not find enough trusted evidence to answer this question."
              : "Source metadata is provided by Admitics. This answer has not been independently verified."}
          </p>
        )}
        {!streaming && (
          <div className="mt-3 flex items-center gap-1">
            <button
              type="button"
              aria-label={copied ? "Response copied" : "Copy response"}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(message.content);
                  setCopied(true);
                  setCopyError("");
                } catch {
                  setCopyError(
                    "Copy isn't available here. Select the text to copy it.",
                  );
                }
              }}
              className="flex size-10 items-center justify-center rounded-lg text-muted hover:bg-mint hover:text-brand"
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
            </button>
            <button
              type="button"
              aria-label="Helpful response"
              aria-pressed={feedback === "helpful"}
              onClick={() =>
                setFeedback(feedback === "helpful" ? null : "helpful")
              }
              className={cn(
                "flex size-10 items-center justify-center rounded-lg text-muted hover:bg-mint",
                feedback === "helpful" && "bg-mint text-brand",
              )}
            >
              <ThumbsUp size={15} />
            </button>
            <button
              type="button"
              aria-label="Unhelpful response"
              aria-pressed={feedback === "unhelpful"}
              onClick={() =>
                setFeedback(feedback === "unhelpful" ? null : "unhelpful")
              }
              className={cn(
                "flex size-10 items-center justify-center rounded-lg text-muted hover:bg-mint",
                feedback === "unhelpful" && "bg-mint text-brand",
              )}
            >
              <ThumbsDown size={15} />
            </button>
            {feedback && (
              <span role="status" className="ml-2 text-[10px] text-muted">
                Feedback noted for this session.
              </span>
            )}
          </div>
        )}
        {copyError && (
          <p role="status" className="text-xs text-muted">
            {copyError}
          </p>
        )}
      </div>
    </article>
  );
}
