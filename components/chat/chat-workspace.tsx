"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  FileText,
  LoaderCircle,
  Menu,
  PanelLeftClose,
  RotateCcw,
} from "lucide-react";
import type {
  Conversation,
  Document,
  Message,
  SendMessageInput,
} from "@/types";
import { chatApi } from "@/lib/api/chat";
import { documentsApi } from "@/lib/api/documents";
import { errorMessage, isAbort } from "@/lib/api/errors";
import { isPreview } from "@/lib/config";
import { AccountGate } from "@/components/auth/account-gate";
import { useAuth } from "@/components/auth/auth-provider";
import { Button, ButtonLink } from "@/components/ui/button";
import {
  Badge,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
} from "@/components/ui/primitives";
import { Modal } from "@/components/ui/modal";
import { ChatEmpty } from "./chat-empty";
import { Composer } from "./composer";
import { ConversationSidebar } from "./conversation-sidebar";
import { MessageView } from "./message-view";
import { useI18n } from "@/lib/i18n";
import { LanguageSelector } from "@/components/navigation/language-selector";

export function ChatWorkspace() {
  const { user } = useAuth();
  return (
    <AccountGate>
      <ChatInner key={user?.id ?? "guest"} />
    </AccountGate>
  );
}
function ChatInner() {
  const { locale, t } = useI18n();
  const translateRef = useRef(t);
  useEffect(() => {
    translateRef.current = t;
  }, [t]);
  const params = useSearchParams();
  const [initial] = useState(() => ({
    id: params.get("id"),
    doc: params.get("document"),
  }));
  const [activeId, setActiveId] = useState<string | null>(initial.id);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageLoading, setMessageLoading] = useState(
    !!initial.id || !!initial.doc,
  );
  const [question, setQuestion] = useState(
    params.get("q")?.slice(0, 8000) ?? "",
  );
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [documentsOpen, setDocumentsOpen] = useState(false);
  const [documentOptions, setDocumentOptions] = useState<Document[]>([]);
  const [selectedDocuments, setSelectedDocuments] = useState<Document[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState("");
  const [renaming, setRenaming] = useState<Conversation | null>(null);
  const [name, setName] = useState("");
  const [deleting, setDeleting] = useState<Conversation | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [pending, setPending] = useState<SendMessageInput | null>(null);
  const sendController = useRef<AbortController | null>(null);
  const loadController = useRef<AbortController | null>(null);
  const busy = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const followScroll = useRef(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const refreshHistory = useCallback(async (signal?: AbortSignal) => {
    setHistoryLoading(true);
    setHistoryError("");
    try {
      setConversations(await chatApi.list(signal));
    } catch (reason) {
      if (!isAbort(reason)) setHistoryError(errorMessage(reason));
    } finally {
      if (!signal?.aborted) setHistoryLoading(false);
    }
  }, []);
  const updateUrl = useCallback((id: string | null) => {
    window.history.replaceState(
      null,
      "",
      id ? `/chat?id=${encodeURIComponent(id)}` : "/chat",
    );
  }, []);
  const loadConversation = useCallback(
    async (id: string) => {
      sendController.current?.abort();
      loadController.current?.abort();
      const controller = new AbortController();
      loadController.current = controller;
      setMessageLoading(true);
      setActiveId(id);
      setError("");
      setNotice("");
      setSidebarOpen(false);
      setPending(null);
      updateUrl(id);
      try {
        const [conversation, result, docs] = await Promise.all([
          chatApi.get(id, controller.signal),
          chatApi.messages(id, controller.signal),
          isPreview
            ? documentsApi.list(controller.signal)
            : Promise.resolve([]),
        ]);
        if (controller.signal.aborted) return;
        setMessages(result);
        setSelectedDocuments(
          docs.filter(
            (d) =>
              conversation.documentIds.includes(d.id) && d.status === "ready",
          ),
        );
        followScroll.current = true;
      } catch (reason) {
        if (!isAbort(reason)) {
          setMessages([]);
          setError(errorMessage(reason));
        }
      } finally {
        if (!controller.signal.aborted) setMessageLoading(false);
      }
    },
    [updateUrl],
  );
  useEffect(() => {
    const controller = new AbortController();
    void chatApi
      .list(controller.signal)
      .then(setConversations)
      .catch((reason) => {
        if (!isAbort(reason)) setHistoryError(errorMessage(reason));
      })
      .finally(() => {
        if (!controller.signal.aborted) setHistoryLoading(false);
      });
    if (initial.id) {
      loadController.current = controller;
      void Promise.all([
        chatApi.get(initial.id, controller.signal),
        chatApi.messages(initial.id, controller.signal),
        isPreview ? documentsApi.list(controller.signal) : Promise.resolve([]),
      ])
        .then(([conversation, result, docs]) => {
          if (controller.signal.aborted) return;
          setMessages(result);
          setSelectedDocuments(
            docs.filter(
              (d) =>
                conversation.documentIds.includes(d.id) && d.status === "ready",
            ),
          );
        })
        .catch((reason) => {
          if (!isAbort(reason)) setError(errorMessage(reason));
        })
        .finally(() => {
          if (!controller.signal.aborted) setMessageLoading(false);
        });
    }
    if (initial.doc)
      void documentsApi
        .list(controller.signal)
        .then((docs) => {
          if (controller.signal.aborted) return;
          if (!docs.some((d) => d.id === initial.doc && d.status === "ready")) {
            setError(translateRef.current("chat.individualFilesUnavailable"));
          }
          setSelectedDocuments(
            docs.filter((d) => d.id === initial.doc && d.status === "ready"),
          );
        })
        .catch((reason) => {
          if (!isAbort(reason)) setError(errorMessage(reason));
        })
        .finally(() => {
          if (!controller.signal.aborted) setMessageLoading(false);
        });
    return () => {
      controller.abort();
      sendController.current?.abort();
      loadController.current?.abort();
    };
  }, [initial]);
  useEffect(() => {
    if (followScroll.current)
      bottomRef.current?.scrollIntoView({ behavior: "instant", block: "end" });
  }, [messages, sending, messageLoading]);

  function newConversation() {
    sendController.current?.abort();
    loadController.current?.abort();
    setPending(null);
    setActiveId(null);
    setMessages([]);
    setSelectedDocuments([]);
    setError("");
    setNotice("");
    setQuestion("");
    setSidebarOpen(false);
    setMessageLoading(false);
    updateUrl(null);
  }
  async function send(retry = false) {
    if (busy.current || messageLoading) return;
    const input = retry
      ? pending
      : {
          content: question.trim(),
          documentIds: selectedDocuments.map((d) => d.id),
          requestId: crypto.randomUUID(),
          locale,
        };
    if (!input?.content) return;
    busy.current = true;
    setPending(input);
    const controller = new AbortController();
    sendController.current = controller;
    const userId = `pending-user-${input.requestId}`,
      assistantId = `pending-assistant-${input.requestId}`;
    setSending(true);
    setError("");
    setNotice("");
    setQuestion("");
    followScroll.current = true;
    let id = activeId;
    const optimistic: Message = {
      id: userId,
      conversationId: id ?? "",
      role: "user",
      content: input.content,
      createdAt: new Date().toISOString(),
      sources: [],
      citations: [],
      documentIds: input.documentIds,
    };
    setMessages((current) =>
      current.some(
        (m) =>
          m.id === userId ||
          (retry &&
            m.role === "user" &&
            m.content === input.content &&
            m === current.at(-1)),
      )
        ? current
        : [...current, optimistic],
    );
    try {
      if (!id) {
        const conversation = await chatApi.create(
          { documentIds: input.documentIds },
          controller.signal,
        );
        if (controller.signal.aborted) return;
        id = conversation.id;
        setActiveId(id);
        setConversations((current) => [conversation, ...current]);
        updateUrl(id);
      }
      let content = "";
      for await (const event of chatApi.send(id, input, controller.signal)) {
        if (controller.signal.aborted) return;
        if (event.type === "delta") {
          content += event.text;
          const partial: Message = {
            ...optimistic,
            id: assistantId,
            conversationId: id,
            role: "assistant",
            content,
            preview: isPreview,
          };
          setMessages((current) => [
            ...current.filter((m) => m.id !== assistantId),
            partial,
          ]);
        } else {
          setMessages((current) => [
            ...current.filter(
              (m) =>
                m.id !== userId &&
                m.id !== assistantId &&
                m.id !== event.userMessage.id &&
                m.id !== event.assistantMessage?.id,
            ),
            event.userMessage,
            ...(event.assistantMessage ? [event.assistantMessage] : []),
          ]);
          if (event.conversation)
            setConversations((current) => [
              event.conversation!,
              ...current.filter((c) => c.id !== event.conversation!.id),
            ]);
          setPending(null);
          setNotice(
            event.assistantMessage
              ? t("chat.responseReady")
              : t("chat.questionSaved"),
          );
        }
      }
    } catch (reason) {
      if (!controller.signal.aborted) {
        setError(errorMessage(reason));
        setMessages((current) => current.filter((m) => m.id !== assistantId));
        if (!isPreview) {
          // A failed/lost acknowledgement may have committed the user turn.
          // Reload canonical history; never automatically repeat a real POST.
          setPending(null);
          if (id) {
            try {
              const history = await chatApi.messages(id, controller.signal);
              if (!controller.signal.aborted) setMessages(history);
            } catch {
              // Keep the original useful error and offer a history reload.
            }
          }
        }
      }
    } finally {
      if (sendController.current === controller) {
        busy.current = false;
        setSending(false);
        sendController.current = null;
      }
    }
  }
  function stop() {
    sendController.current?.abort();
    setMessages((current) =>
      current.filter((m) => !m.id.startsWith("pending-assistant-")),
    );
    if (!isPreview) {
      setPending(null);
      setError(t("chat.stopWaiting"));
    } else setNotice(t("chat.responseStopped"));
  }
  async function loadDocuments() {
    setDocumentsOpen(true);
    setDocumentsLoading(true);
    setDocumentsError("");
    try {
      setDocumentOptions(await documentsApi.list());
    } catch (reason) {
      setDocumentsError(errorMessage(reason));
    } finally {
      setDocumentsLoading(false);
    }
  }
  const sidebar = (
    <ConversationSidebar
      conversations={conversations}
      activeId={activeId}
      loading={historyLoading}
      error={historyError}
      onReload={() => void refreshHistory()}
      onNew={newConversation}
      onSelect={(id) => void loadConversation(id)}
      onRename={(conversation) => {
        setRenaming(conversation);
        setName(conversation.title);
        setActionError("");
      }}
      onDelete={(conversation) => {
        setDeleting(conversation);
        setActionError("");
      }}
    />
  );
  const title =
    conversations.find((c) => c.id === activeId)?.title ?? t("chat.title");
  return (
    <div className="flex h-dvh overflow-hidden bg-paper">
      <aside
        aria-label={t("chat.history")}
        className="hidden w-[275px] shrink-0 border-r border-line bg-[#f0f3ec] p-5 lg:block"
      >
        {sidebar}
      </aside>
      <main id="main-content" className="flex min-w-0 flex-1 flex-col">
        <header className="flex min-h-[72px] shrink-0 items-center justify-between gap-4 border-b border-line px-4 sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <button
              aria-label={t("chat.openHistory")}
              aria-expanded={sidebarOpen}
              onClick={() => setSidebarOpen(true)}
              className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-line lg:hidden"
            >
              <Menu size={19} />
            </button>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {t("chat.askAdmitics")}
              </p>
              <p className="mt-1 max-w-[45vw] truncate text-[11px] text-muted">
                {title}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-4">
            <LanguageSelector />
            {isPreview && (
              <Badge tone="amber" className="hidden sm:inline-flex">
                {t("chat.previewWorkspace")}
              </Badge>
            )}
            <Link
              href="/"
              aria-label={t("chat.backToExplore")}
              className="flex min-h-11 items-center gap-2 text-xs text-muted"
            >
              <ArrowLeft size={14} />
              <span className="hidden sm:block">{t("chat.backToExplore")}</span>
            </Link>
          </div>
        </header>
        {isPreview && (
          <div className="shrink-0 border-b border-line bg-[#f4f1e6] px-4 py-2 text-center text-[10px] leading-5 text-muted">
            {t("chat.previewNotice")}
          </div>
        )}
        <div
          ref={scrollRef}
          onScroll={() => {
            const element = scrollRef.current;
            if (element)
              followScroll.current =
                element.scrollHeight -
                  element.scrollTop -
                  element.clientHeight <
                160;
          }}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 sm:px-8"
        >
          <div className="mx-auto min-h-full max-w-3xl">
            {messageLoading ? (
              <LoadingState label={t("chat.opening")} />
            ) : messages.length === 0 && !error ? (
              <ChatEmpty
                onSelect={(value) => {
                  setQuestion(value);
                  document.getElementById("chat-question")?.focus();
                }}
              />
            ) : (
              <div className="pt-8 pb-4">
                {messages.map((message) => (
                  <MessageView
                    key={message.id}
                    message={message}
                    streaming={
                      message.id.startsWith("pending-assistant-") && sending
                    }
                  />
                ))}
                {sending &&
                  !messages.some((m) =>
                    m.id.startsWith("pending-assistant-"),
                  ) && (
                    <div
                      role="status"
                      className="mb-6 flex items-center gap-3 text-xs text-muted"
                    >
                      <LoaderCircle
                        size={16}
                        className="animate-spin text-brand"
                      />
                      {t("chat.thinking")}
                    </div>
                  )}
                {error && (
                  <div className="mb-5">
                    <ErrorState
                      message={error}
                      retry={
                        pending
                          ? () => void send(true)
                          : activeId
                            ? () => void loadConversation(activeId)
                            : undefined
                      }
                    />
                  </div>
                )}
                {notice && pending && !sending && (
                  <div className="mb-5 flex flex-wrap items-center gap-3 text-xs text-muted">
                    <p>{notice}</p>
                    <Button variant="secondary" onClick={() => void send(true)}>
                      <RotateCcw size={14} />
                      {t("chat.retryResponse")}
                    </Button>
                  </div>
                )}
                {notice && !pending && !sending && !isPreview && (
                  <p
                    role="status"
                    className="mb-5 text-xs leading-6 text-muted"
                  >
                    {notice}
                  </p>
                )}
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>
        <div className="shrink-0 bg-paper px-4 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-8">
          <Composer
            value={question}
            onChange={setQuestion}
            onSend={() => void send()}
            sending={sending}
            disabled={messageLoading}
            onStop={stop}
            onDocuments={() => void loadDocuments()}
            documents={selectedDocuments}
            onRemove={(id) =>
              setSelectedDocuments((current) =>
                current.filter((d) => d.id !== id),
              )
            }
          />
        </div>
        <p role="status" aria-live="polite" className="sr-only">
          {sending ? t("chat.responding") : notice}
        </p>
      </main>
      <Modal
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        title={t("chat.workspace")}
      >
        <div className="h-[min(68dvh,650px)]">{sidebar}</div>
        <button
          onClick={() => setSidebarOpen(false)}
          className="mt-3 flex items-center gap-2 text-xs text-muted"
        >
          <PanelLeftClose size={15} />
          {t("chat.closeHistory")}
        </button>
      </Modal>
      <Modal
        open={documentsOpen}
        onClose={() => setDocumentsOpen(false)}
        title={t("chat.bringDocuments")}
      >
        <p className="mb-4 text-sm leading-6 text-muted">
          {isPreview
            ? t("chat.chooseReadyDocuments")
            : t("chat.individualFilesUnavailable")}
        </p>
        {documentsLoading ? (
          <LoadingState label={t("chat.loadingDocuments")} />
        ) : documentsError ? (
          <ErrorState
            message={documentsError}
            retry={() => void loadDocuments()}
          />
        ) : documentOptions.length === 0 ? (
          <EmptyState
            title={t("chat.noDocuments")}
            description={t("chat.noDocumentsCopy")}
            action={
              <ButtonLink href="/documents">
                {t("chat.manageDocuments")}
              </ButtonLink>
            }
          />
        ) : (
          <div className="max-h-72 space-y-2 overflow-y-auto">
            {documentOptions.map((doc) => (
              <label
                key={doc.id}
                className="flex items-center gap-3 rounded-xl border border-line p-3"
              >
                <input
                  type="checkbox"
                  disabled={!isPreview || doc.status !== "ready"}
                  checked={selectedDocuments.some((d) => d.id === doc.id)}
                  onChange={(event) =>
                    setSelectedDocuments((current) =>
                      event.target.checked
                        ? [...current, doc]
                        : current.filter((d) => d.id !== doc.id),
                    )
                  }
                  className="size-4 accent-brand"
                />
                <FileText size={18} className="shrink-0 text-brand" />
                <span className="min-w-0">
                  <span className="block truncate text-xs font-medium">
                    {doc.name}
                  </span>
                  <span className="mt-1 block text-[10px] text-muted">
                    {doc.status}
                  </span>
                </span>
              </label>
            ))}
          </div>
        )}
        <div className="mt-5 flex items-center justify-between">
          <Link
            href="/documents"
            className="text-xs text-brand underline underline-offset-4"
          >
            {t("chat.manageDocuments")}
          </Link>
          <Button onClick={() => setDocumentsOpen(false)}>
            <Check size={15} />
            Done
          </Button>
        </div>
      </Modal>
      <Modal
        open={!!renaming}
        onClose={() => {
          if (!actionBusy) setRenaming(null);
        }}
        title={t("chat.nameConversation")}
      >
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            if (!renaming || !name.trim()) return;
            setActionBusy(true);
            setActionError("");
            try {
              const updated = await chatApi.rename(renaming.id, {
                title: name.trim(),
              });
              setConversations((current) =>
                current.map((c) => (c.id === updated.id ? updated : c)),
              );
              setRenaming(null);
            } catch (reason) {
              setActionError(errorMessage(reason));
            } finally {
              setActionBusy(false);
            }
          }}
        >
          <label htmlFor="conversation-name" className="mb-2 block text-sm">
            {t("chat.conversationName")}
          </label>
          <Input
            id="conversation-name"
            autoFocus
            required
            maxLength={100}
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
          {actionError && (
            <div className="mt-4">
              <ErrorState message={actionError} />
            </div>
          )}
          <Button type="submit" loading={actionBusy} className="mt-5">
            {t("chat.saveName")}
          </Button>
        </form>
      </Modal>
      <Modal
        open={!!deleting}
        onClose={() => {
          if (!actionBusy) setDeleting(null);
        }}
        title={t("chat.deleteConversation")}
      >
        <p className="text-sm leading-7 text-muted">
          {t("chat.deleteConversationCopy", { title: deleting?.title ?? "" })}
        </p>
        {actionError && (
          <div className="mt-4">
            <ErrorState message={actionError} />
          </div>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="secondary"
            disabled={actionBusy}
            onClick={() => setDeleting(null)}
          >
            {t("chat.keepConversation")}
          </Button>
          <Button
            variant="danger"
            loading={actionBusy}
            onClick={async () => {
              if (!deleting) return;
              setActionBusy(true);
              setActionError("");
              try {
                if (deleting.id === activeId) sendController.current?.abort();
                await chatApi.remove(deleting.id);
                setConversations((current) =>
                  current.filter((c) => c.id !== deleting.id),
                );
                if (activeId === deleting.id) newConversation();
                setDeleting(null);
              } catch (reason) {
                setActionError(errorMessage(reason));
              } finally {
                setActionBusy(false);
              }
            }}
          >
            {t("common.delete")}
          </Button>
        </div>
      </Modal>
    </div>
  );
}
