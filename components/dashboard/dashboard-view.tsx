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

async function loadDashboard(signal: AbortSignal) {
  const [user, conversations, documents, usage] = await Promise.all([
    userApi.me(signal),
    chatApi.list(signal),
    documentsApi.list(signal),
    usageApi.get(signal),
  ]);
  return { user, conversations, documents, usage };
}
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
  return (
    <div className="container-page py-10 sm:py-14">
      {loading ? (
        <LoadingState label="Gathering your next steps…" />
      ) : error ? (
        <ErrorState message={error} retry={refresh} />
      ) : (
        data && (
          <>
            <div className="mb-9 flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="eyebrow mb-3">YOUR EDUCATION, TOGETHER</p>
                <h1 className="editorial text-4xl sm:text-5xl">
                  Hello, {data.user.name.split(" ")[0]}.
                </h1>
                <p className="mt-3 text-sm text-muted">
                  A fresh question or a familiar conversation. Where shall we
                  begin?
                </p>
              </div>
              <ButtonLink href="/chat">
                Ask Admitics <ArrowUpRight size={16} />
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
                  <p className="text-xs font-medium text-white/70">
                    ONE QUESTION CAN OPEN A NEW DOOR
                  </p>
                  <h2 className="editorial mt-4 text-3xl">
                    Let’s make your next step clearer.
                  </h2>
                  <p className="mt-3 max-w-md text-xs leading-6 text-white/80">
                    Explore a course, compare an exam, or turn an application
                    into a plan.
                  </p>
                  <ButtonLink
                    href="/chat"
                    variant="inverse"
                    className="relative mt-5"
                  >
                    Start a conversation <Plus size={15} />
                  </ButtonLink>
                </div>
                <Card>
                  <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-sm font-semibold">
                      Recent conversations
                    </h2>
                    <Link href="/chat" className="text-xs text-brand">
                      View all
                    </Link>
                  </div>
                  {data.conversations.length === 0 ? (
                    <EmptyState
                      title="A conversation waiting to happen"
                      description="Ask your first question. You can return to the conversation whenever you're ready."
                      action={
                        <ButtonLink href="/chat" variant="secondary">
                          Start with a question
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
                                {c.lastMessage ??
                                  "Ready for your next question"}
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
                    Recent questions
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
                      Your questions will appear here as you explore with
                      Admitics.
                    </p>
                  )}
                </Card>
              </div>
              <div className="space-y-6">
                <UsageCard usage={data.usage} />
                <Card>
                  <div className="mb-5 flex items-center justify-between">
                    <h2 className="text-sm font-semibold">Your documents</h2>
                    <Link href="/documents" className="text-xs text-brand">
                      Manage
                    </Link>
                  </div>
                  {data.documents.length === 0 ? (
                    <div className="text-center">
                      <FileText size={26} className="mx-auto mb-3 text-brand" />
                      <p className="text-xs leading-6 text-muted">
                        Bring an admissions notice or academic document into
                        your journey.
                      </p>
                      <ButtonLink
                        href="/documents"
                        variant="secondary"
                        className="mt-4 w-full"
                      >
                        Add a document <Plus size={14} />
                      </ButtonLink>
                    </div>
                  ) : (
                    <ul className="space-y-4">
                      {data.documents.slice(0, 3).map((doc) => (
                        <li key={doc.id} className="flex items-center gap-3">
                          <FileText size={19} className="shrink-0 text-brand" />
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
                        {data.user.email || "Exploring as a guest"}
                      </p>
                    </div>
                  </div>
                  <Link
                    href="/settings"
                    className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-brand"
                  >
                    Manage your account <ArrowUpRight size={14} />
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
