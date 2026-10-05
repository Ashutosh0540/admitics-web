import { ArrowUpRight, FileText, Link2 } from "lucide-react";
import type { Citation, Source } from "@/types";
import { safeExternalUrl } from "@/lib/utils";

export function SourceCards({
  sources,
  citations,
  preview,
}: {
  sources: Source[];
  citations: Citation[];
  preview?: boolean;
}) {
  if (!sources.length) return null;
  return (
    <section
      aria-label={preview ? "Example reference links" : "Sources"}
      className="mt-5 border-t border-line pt-4"
    >
      <h3 className="mb-3 flex items-center gap-2 text-[11px] font-semibold text-muted">
        <Link2 size={13} />
        {preview
          ? "REFERENCE LINKS · PREVIEW, NOT RETRIEVED EVIDENCE"
          : "SOURCES & CITATIONS"}
      </h3>
      <div className="grid gap-2 sm:grid-cols-2">
        {sources.map((source) => {
          const href = source.url ? safeExternalUrl(source.url) : undefined;
          const citation = citations.find(
            (item) => item.sourceId === source.id,
          );
          const content = (
            <>
              <span className="mt-0.5 text-brand">
                {source.kind === "document" ? (
                  <FileText size={14} />
                ) : (
                  <Link2 size={14} />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold">{source.title}</p>
                <p className="mt-1 text-[10px] text-muted">
                  {source.publisher}
                  {citation ? ` · ${citation.label}` : ""}
                  {source.verificationStatus
                    ? ` · ${source.verificationStatus}`
                    : ""}
                </p>
                {citation?.excerpt && (
                  <p className="mt-2 text-xs leading-5 text-muted">
                    {citation.excerpt}
                  </p>
                )}
              </div>
              {href && (
                <ArrowUpRight size={13} className="shrink-0 text-muted" />
              )}
            </>
          );
          return href ? (
            <a
              key={source.id}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 rounded-xl border border-line bg-paper p-3 transition-colors hover:border-brand/30"
            >
              {content}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          ) : (
            <div
              key={source.id}
              className="flex items-start gap-2 rounded-xl border border-line bg-paper p-3"
            >
              {content}
            </div>
          );
        })}
      </div>
    </section>
  );
}
