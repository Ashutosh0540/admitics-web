import Link from "next/link";
import {
  FileText,
  LayoutDashboard,
  MessageSquare,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import type { Conversation } from "@/types";
import { Logo } from "@/components/navigation/logo";
import { Button } from "@/components/ui/button";
import { ErrorState, Skeleton } from "@/components/ui/primitives";
import { AccountMenu } from "@/components/auth/account-menu";
import { cn, formatDate } from "@/lib/utils";

export function ConversationSidebar({
  conversations,
  activeId,
  loading,
  error,
  onReload,
  onNew,
  onSelect,
  onRename,
  onDelete,
}: {
  conversations: Conversation[];
  activeId: string | null;
  loading: boolean;
  error: string;
  onReload: () => void;
  onNew: () => void;
  onSelect: (id: string) => void;
  onRename: (conversation: Conversation) => void;
  onDelete: (conversation: Conversation) => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="pb-6">
        <Logo />
      </div>
      <Button onClick={onNew} className="w-full justify-between">
        New conversation <Plus size={17} />
      </Button>
      <div className="mt-8 flex-1 overflow-y-auto">
        <h2 className="mb-4 px-2 text-[10px] font-semibold tracking-[.14em] text-muted">
          YOUR CONVERSATIONS
        </h2>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        ) : error ? (
          <ErrorState message={error} retry={onReload} />
        ) : conversations.length === 0 ? (
          <div className="px-2 py-6">
            <MessageSquare size={20} className="mb-3 text-muted/60" />
            <p className="text-xs leading-6 text-muted">
              A fresh page.
              <br />
              Your conversations will live here.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {conversations.map((conversation) => (
              <li
                key={conversation.id}
                className={cn(
                  "rounded-xl border",
                  activeId === conversation.id
                    ? "border-brand/15 bg-mint"
                    : "border-transparent hover:bg-white",
                )}
              >
                <button
                  onClick={() => onSelect(conversation.id)}
                  aria-current={
                    activeId === conversation.id ? "true" : undefined
                  }
                  className="w-full px-3 pt-3 pb-1 text-left"
                >
                  <span className="line-clamp-2 text-xs leading-5 font-medium">
                    {conversation.title}
                  </span>
                </button>
                <div className="flex items-center justify-between px-3 pb-2">
                  <span className="text-[10px] text-muted">
                    {formatDate(conversation.updatedAt)}
                  </span>
                  <div className="flex">
                    <button
                      onClick={() => onRename(conversation)}
                      aria-label={`Rename ${conversation.title}`}
                      className="flex size-8 items-center justify-center rounded-md text-muted hover:bg-white"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => onDelete(conversation)}
                      aria-label={`Delete ${conversation.title}`}
                      className="flex size-8 items-center justify-center rounded-md text-muted hover:bg-white hover:text-danger"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className="mt-5 space-y-1 border-t border-line pt-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 rounded-lg px-2 py-3 text-xs text-muted hover:bg-white"
        >
          <LayoutDashboard size={16} />
          My dashboard
        </Link>
        <Link
          href="/documents"
          className="flex items-center gap-2.5 rounded-lg px-2 py-3 text-xs text-muted hover:bg-white"
        >
          <FileText size={16} />
          My documents
        </Link>
        <div className="mt-2">
          <AccountMenu />
        </div>
      </div>
    </div>
  );
}
