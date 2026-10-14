"use client";
import Link from "next/link";
import {
  ArrowUpRight,
  FileText,
  MessageSquare,
  Plus,
  UserRound,
} from "lucide-react";
import { chatApi } from "@/lib/api/chat";
import { documentsApi } from "@/lib/api/documents";
import { userApi } from "@/lib/api/user";
import { usageApi } from "@/lib/api/usage";
import { capabilities } from "@/lib/config";
import { loadDashboardData } from "@/lib/dashboard/load-dashboard";
import { useResource } from "@/lib/use-resource";
import { useAuth } from "@/components/auth/auth-provider";
import { AccountGate } from "@/components/auth/account-gate";
import { WorkspaceNav } from "@/components/navigation/workspace-nav";
import { ButtonLink } from "@/components/ui/button";
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/ui/primitives";
import { formatDate } from "@/lib/utils";
import { UsageCard } from "./usage-card";
import { useTranslation } from "@/lib/i18n";

const loadDashboard = (signal: AbortSignal) =>
  loadDashboardData(signal, capabilities, {
    getUser: userApi.me,
    listConversations: chatApi.list,
    listDocuments: documentsApi.list,
    getUsage: usageApi.get,
  });
export function DashboardView() {
  const { user } = useAuth();
  return (
    <AccountGate>
      <WorkspaceNav />
      <DashboardInner key={user?.id ?? "guest"} />
    </AccountGate>
  );
}
function DashboardInner() {
  const { data, loading, error, refresh } = useResource(loadDashboard);
  const t = useTranslation();
  return (
    <div className="container-page py-10 sm:py-14">
      {loading ? (
        <LoadingState label={t("dashboard.loading")} />
      ) : error ? (
        <ErrorState message={error} retry={refresh} />
      ) : (
        data && (
          <>
            <div className="mb-9 flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="eyebrow mb-3">{t("dashboard.eyebrow")}</p>
                <h1 className="editorial text-4xl sm:text-5xl">
                  {t("dashboard.hello", { name: data.user.name.split(" ")[0] })}
                </h1>
                <p className="mt-3 text-sm text-muted">
                  {t("dashboard.intro")}
                </p>
              </div>
              <ButtonLink href="/chat">
                {t("nav.askAdmitics")} <ArrowUpRight size={16} />
              </ButtonLink>
            </div>
            <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
              <div className="space-y-6">
                <div className="relative overflow-hidden rounded-2xl bg-brand p-7 text-white">
                  <MessageSquare
                    aria-hidden="true"
                    className="absolute -right-3 -bottom-3 size-32 text-white/10"
                    strokeWidth={1}
                  />
                  <p className="text-xs font-medium text-white">
                    {t("dashboard.oneQuestion")}
                  </p>
                  <h2 className="editorial mt-4 text-3xl">
                    {t("dashboard.nextStep")}
                  </h2>
                  <p className="mt-3 max-w-md text-xs leading-6 text-white">
                    {t("dashboard.nextStepCopy")}
                  </p>
                  <ButtonLink
                    href="/chat"
                    variant="inverse"
                    className="relative mt-5"
                  >
                    {t("home.startConversation")} <Plus size={15} />
                  </ButtonLink>
                </div>
                <Card>
                  <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-sm font-semibold">
                      {t("dashboard.recentConversations")}
                    </h2>
                    <Link href="/chat" className="text-xs text-brand">
                      {t("dashboard.viewAll")}
                    </Link>
                  </div>
                  {data.conversations.length === 0 ? (
                    <EmptyState
                      title={t("dashboard.waiting")}
                      description={t("dashboard.waitingCopy")}
                      action={
                        <ButtonLink href="/chat" variant="secondary">
                          {t("dashboard.startQuestion")}
                        </ButtonLink>
                      }
                    />
                  ) : (
                    <ul className="divide-y divide-line">
                      {data.conversations.slice(0, 5).map((c) => (
                        <li key={c.id}>
                          <Link
                            href={`/chat?id=${encodeURIComponent(c.id)}`}
                            className="flex items-start gap-3 rounded-lg py-4 hover:bg-paper"
                          >
                            <MessageSquare
                              size={18}
                              className="mt-0.5 shrink-0 text-brand"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium">
                                {c.title}
                              </p>
                              <p className="mt-1 truncate text-xs text-muted">
                                {c.lastMessage ?? t("dashboard.readyQuestion")}
                              </p>
                            </div>
                            <span className="shrink-0 text-[10px] text-muted">
                              {formatDate(c.updatedAt)}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
                <Card>
                  <h2 className="mb-4 text-sm font-semibold">
                    {t("dashboard.recentQuestions")}
                  </h2>
                  {data.conversations.some((c) => c.lastMessage) ? (
                    <ul className="space-y-3">
                      {data.conversations
                        .filter((c) => c.lastMessage)
                        .slice(0, 3)
                        .map((c) => (
                          <li key={c.id}>
                            <Link
                              href={`/chat?id=${c.id}`}
                              className="flex items-start justify-between gap-4 text-xs leading-6 text-muted hover:text-brand"
                            >
                              <span>{c.lastMessage}</span>
                              <ArrowUpRight
                                size={15}
                                className="mt-1 shrink-0"
                              />
                            </Link>
                          </li>
                        ))}
                    </ul>
                  ) : (
                    <p className="text-xs leading-6 text-muted">
                      {t("dashboard.questionsAppear")}
                    </p>
                  )}
                </Card>
              </div>
              <div className="space-y-6">
                {capabilities.productControls &&
                  (data.usage ? (
                    <UsageCard usage={data.usage} />
                  ) : data.usageError ? (
                    <Card>
                      <h2 className="mb-3 text-sm font-semibold">
                        {t("usage.title")}
                      </h2>
                      <ErrorState message={data.usageError} retry={refresh} />
                    </Card>
                  ) : null)}
                {capabilities.documents && (
                  <Card>
                    <div className="mb-5 flex items-center justify-between">
                      <h2 className="text-sm font-semibold">
                        {t("dashboard.yourDocuments")}
                      </h2>
                      <Link href="/documents" className="text-xs text-brand">
                        {t("common.manage")}
                      </Link>
                    </div>
                    {data.documentsError ? (
                      <ErrorState
                        message={data.documentsError}
                        retry={refresh}
                      />
                    ) : data.documents?.length === 0 ? (
                      <div className="text-center">
                        <FileText
                          size={26}
                          className="mx-auto mb-3 text-brand"
                        />
                        <p className="text-xs leading-6 text-muted">
                          {t("dashboard.documentCopy")}
                        </p>
                        <ButtonLink
                          href="/documents"
                          variant="secondary"
                          className="mt-4 w-full"
                        >
                          {t("dashboard.addDocument")} <Plus size={14} />
                        </ButtonLink>
                      </div>
                    ) : (
                      <ul className="space-y-4">
                        {data.documents?.slice(0, 3).map((doc) => (
                          <li key={doc.id} className="flex items-center gap-3">
                            <FileText
                              size={19}
                              className="shrink-0 text-brand"
                            />
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-medium">
                                {doc.name}
                              </p>
                              <Badge
                                tone={
                                  doc.status === "failed"
                                    ? "red"
                                    : doc.status === "ready"
                                      ? "green"
                                      : "amber"
                                }
                                className="mt-1 text-[10px]"
                              >
                                {doc.status}
                              </Badge>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </Card>
                )}
                <Card>
                  <div className="flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-full bg-mint text-brand">
                      <UserRound size={19} />
                    </span>
                    <div className="min-w-0">
                      <h2 className="truncate text-sm font-semibold">
                        {data.user.name}
                      </h2>
                      <p className="mt-1 truncate text-[11px] text-muted">
                        {data.user.email || t("dashboard.guest")}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/settings"
                    className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-brand"
                  >
                    {t("dashboard.manageAccount")} <ArrowUpRight size={14} />
                  </Link>
                </Card>
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
}
