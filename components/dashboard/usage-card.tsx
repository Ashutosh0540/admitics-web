import type { Usage } from "@/types";
import { Badge, Card } from "@/components/ui/primitives";
import { formatBytes, formatDate } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n";

export function UsageCard({ usage }: { usage: Usage }) {
  const t = useTranslation();
  const rows = [
    {
      label:
        usage.plan === "Preview"
          ? t("usage.advisorResponses")
          : t("usage.questionsSent"),
      used: usage.messages.used,
      limit: usage.messages.limit,
      display: `${usage.messages.used} / ${usage.messages.limit}`,
    },
    {
      label: t("usage.documents"),
      used: usage.documents.used,
      limit: usage.documents.limit,
      display: `${usage.documents.used} / ${usage.documents.limit}`,
    },
    {
      label: t("usage.storage"),
      used: usage.storage.used,
      limit: usage.storage.limit,
      display: `${formatBytes(usage.storage.used)} / ${formatBytes(usage.storage.limit)}`,
    },
  ];
  return (
    <Card>
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold">{t("usage.title")}</h2>
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
        {t("usage.periodEnds", { date: formatDate(usage.periodEnd) })}{" "}
        {usage.plan === "Preview"
          ? t("usage.previewLimits")
          : t("usage.provided")}
      </p>
    </Card>
  );
}
