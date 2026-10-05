import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { safeExternalUrl } from "@/lib/utils";

export default function SafeMarkdown({ content }: { content: string }) {
  return (
    <div className="markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        skipHtml
        components={{
          a: ({ href, children }) => {
            const safe = href ? safeExternalUrl(href) : undefined;
            return safe ? (
              <a href={safe} target="_blank" rel="noopener noreferrer">
                {children}
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            ) : (
              <span>{children}</span>
            );
          },
          img: ({ alt }) => (
            <span className="text-muted">
              {alt ? `[Image: ${alt}]` : "[Image]"}
            </span>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
