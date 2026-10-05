import type { Usage } from "@/types";
import { Badge, Card } from "@/components/ui/primitives";
import { formatBytes, formatDate } from "@/lib/utils";

export function UsageCard({ usage }: { usage: Usage }) {
  const rows = [
    {
      label: usage.plan === "Preview" ? "Advisor responses" : "Questions sent",
      used: usage.messages.used,
      limit: usage.messages.limit,
      display: `${usage.messages.used} / ${usage.messages.limit}`,
    },
    {
      label: "Documents",
      used: usage.documents.used,
      limit: usage.documents.limit,
      display: `${usage.documents.used} / ${usage.documents.limit}`,
    },
    {
      label: "Storage",
      used: usage.storage.used,
      limit: usage.storage.limit,
      display: `${formatBytes(usage.storage.used)} / ${formatBytes(usage.storage.limit)}`,
    },
  ];
  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">Your usage</h2>
        <Badge tone="neutral">{usage.plan}</Badge>
      </div>
      <div className="mt-6 space-y-5">
        {rows.map((row) => (
          <div key={row.label}>
            <div className="mb-2 flex justify-between gap-3 text-xs">
              <span className="text-muted">{row.label}</span>
              <span className="font-medium">{row.display}</span>
            </div>
            <div
              role="meter"
              aria-label={row.label}
              aria-valuemin={0}
              aria-valuemax={row.limit}
              aria-valuenow={Math.min(row.used, row.limit)}
              aria-valuetext={row.display}
              className="h-1.5 overflow-hidden rounded-full bg-line"
            >
              <div
                className="h-full rounded-full bg-brand"
                style={{
                  width: `${row.limit ? Math.min((row.used / row.limit) * 100, 100) : 0}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="mt-6 text-[10px] leading-5 text-muted">
        Current period ends {formatDate(usage.periodEnd)}.{" "}
        {usage.plan === "Preview"
          ? "Example limits; not a live plan or billing record."
          : "Limits and usage are provided by Admitics."}
      </p>
    </Card>
  );
}
