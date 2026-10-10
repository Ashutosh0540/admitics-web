"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, LayoutDashboard, Settings, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { isPreview } from "@/lib/config";
import { useTranslation } from "@/lib/i18n";

export function WorkspaceNav() {
  const pathname = usePathname();
  const t = useTranslation();
  return (
    <div className="border-b border-line bg-white">
      <div className="container-page flex flex-wrap items-center justify-between gap-2 py-3">
        <nav aria-label={t("nav.account")} className="flex flex-wrap gap-1">
          {[
            [LayoutDashboard, t("nav.overview"), "/dashboard"],
            [FileText, t("nav.documents"), "/documents"],
            [Settings, t("nav.account"), "/settings"],
          ].map(([Icon, label, href]) => {
            const ItemIcon = Icon as typeof Settings;
            return (
              <Link
                key={href as string}
                href={href as string}
                aria-current={pathname === href ? "page" : undefined}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium",
                  pathname === href
                    ? "bg-mint text-brand"
                    : "text-muted hover:bg-paper",
                )}
              >
                <ItemIcon size={15} />
                {label as string}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-4">
          {isPreview && (
            <span className="text-[10px] text-amber">
              {t("nav.localPreview")}
            </span>
          )}
          <Link
            href="/chat"
            className="flex items-center gap-2 py-2 text-xs font-semibold text-brand"
          >
            <Sparkles size={15} />
            {t("nav.askAdmitics")}
          </Link>
        </div>
      </div>
    </div>
  );
}
