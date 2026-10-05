"use client";
import { useRef, type FormEvent } from "react";
import { ArrowUp, Paperclip, Square, X } from "lucide-react";
import type { Document } from "@/types";

export function Composer({
  value,
  onChange,
  onSend,
  sending,
  disabled,
  onStop,
  onDocuments,
  documents,
  onRemove,
}: {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  sending: boolean;
  disabled: boolean;
  onStop: () => void;
  onDocuments: () => void;
  documents: Document[];
  onRemove: (id: string) => void;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  function submit(event: FormEvent) {
    event.preventDefault();
    if (value.trim() && !sending) onSend();
  }
  return (
    <form onSubmit={submit} className="mx-auto w-full max-w-3xl">
      <div className="rounded-2xl border border-brand/20 bg-white p-3 shadow-[0_3px_14px_-8px_#1f554435]">
        {documents.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {documents.map((doc) => (
              <span
                key={doc.id}
                className="flex max-w-full items-center gap-1 rounded-lg bg-mint px-2 py-1 text-[11px] text-brand"
              >
                <Paperclip size={12} />
                <span className="max-w-[180px] truncate">{doc.name}</span>
                <button
                  type="button"
                  disabled={sending}
                  onClick={() => onRemove(doc.id)}
                  aria-label={`Remove ${doc.name} from context`}
                  className="flex size-7 items-center justify-center"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}
        <label htmlFor="chat-question" className="sr-only">
          Your question for Admitics
        </label>
        <textarea
          ref={ref}
          id="chat-question"
          value={value}
          disabled={disabled}
          onChange={(event) => {
            onChange(event.target.value);
            event.target.style.height = "auto";
            event.target.style.height = `${Math.min(event.target.scrollHeight, 160)}px`;
          }}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault();
              if (value.trim() && !sending) onSend();
            }
          }}
          placeholder="Ask about exams, colleges, or your next step…"
          rows={2}
          maxLength={8000}
          className="block max-h-40 min-h-14 w-full resize-none rounded-lg px-2 py-2 text-sm leading-6 placeholder:text-muted/70"
        />
        <div className="mt-1 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onDocuments}
            disabled={sending || disabled}
            className="flex min-h-10 items-center gap-2 rounded-lg px-2 text-xs text-muted hover:bg-mint disabled:opacity-50"
          >
            <Paperclip size={16} />
            <span>Add context</span>
          </button>
          <div className="flex items-center gap-3">
            <span className="hidden text-[10px] text-muted sm:block">
              Shift + Enter for a new line
            </span>
            {sending ? (
              <button
                key="stop"
                type="button"
                disabled={false}
                onClick={onStop}
                aria-label="Stop response"
                className="flex size-11 items-center justify-center rounded-xl bg-brand text-white"
              >
                <Square size={15} fill="currentColor" />
              </button>
            ) : (
              <button
                key="send"
                type="submit"
                disabled={disabled || !value.trim()}
                aria-label="Send question"
                className="flex size-11 items-center justify-center rounded-xl bg-brand text-white hover:bg-brand-dark disabled:opacity-40"
              >
                <ArrowUp size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
      <p className="mt-2.5 px-2 text-center text-[10px] leading-5 text-muted">
        Admitics can make mistakes. Confirm eligibility and deadlines with
        official sources.
      </p>
    </form>
  );
}
