"use client";
import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  FileText,
  LoaderCircle,
  Sparkles,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import type { Document } from "@/types";
import { documentsApi } from "@/lib/api/documents";
import { usageApi } from "@/lib/api/usage";
import { errorMessage, isAbort } from "@/lib/api/errors";
import { isPreview } from "@/lib/config";
import { useResource } from "@/lib/use-resource";
import { formatBytes, formatDate } from "@/lib/utils";
import { AccountGate } from "@/components/auth/account-gate";
import { useAuth } from "@/components/auth/auth-provider";
import { WorkspaceNav } from "@/components/navigation/workspace-nav";
import { Button, ButtonLink } from "@/components/ui/button";
import {
  Badge,
  Card,
  EmptyState,
  ErrorState,
  LoadingState,
} from "@/components/ui/primitives";
import { Modal } from "@/components/ui/modal";
import { UsageCard } from "@/components/dashboard/usage-card";
import { useTranslation } from "@/lib/i18n";

async function loadDocuments(signal: AbortSignal) {
  const [documents, usage] = await Promise.all([
    documentsApi.list(signal),
    usageApi.get(signal),
  ]);
  return { documents, usage };
}
export function DocumentsView() {
  const { user } = useAuth();
  return (
    <AccountGate>
      <WorkspaceNav />
      <DocumentsInner key={user?.id ?? "guest"} />
    </AccountGate>
  );
}
function DocumentsInner() {
  const { data, error, loading, refresh } = useResource(loadDocuments);
  const [uploading, setUploading] = useState(false);
  const [uploadName, setUploadName] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [notice, setNotice] = useState("");
  const [deleting, setDeleting] = useState<Document | null>(null);
  const [deleteBusy, setDeleteBusy] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [retrying, setRetrying] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const uploadController = useRef<AbortController | null>(null);
  const t = useTranslation();
  useEffect(() => {
    return () => uploadController.current?.abort();
  }, []);
  useEffect(() => {
    if (
      !data?.documents.some(
        (doc) =>
          doc.status === "uploading" ||
          doc.status === "uploaded" ||
          doc.status === "processing" ||
          doc.status === "deleting",
      )
    )
      return;
    const timer = setInterval(() => {
      if (document.visibilityState === "visible") refresh(true);
    }, 1800);
    return () => clearInterval(timer);
  }, [data, refresh]);
  async function upload(file: File) {
    if (uploading || !data) return;
    setUploadError("");
    setNotice("");
    const limits = data.usage.uploadLimits;
    const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (
      !limits.allowedExtensions.includes(extension) ||
      (file.type && !limits.allowedMimeTypes.includes(file.type))
    ) {
      setUploadError(
        t("documents.chooseTypes", {
          types: limits.allowedExtensions.join(", "),
        }),
      );
      return;
    }
    if (file.size === 0 || file.size > limits.maxFileBytes) {
      setUploadError(
        t("documents.chooseSize", { size: formatBytes(limits.maxFileBytes) }),
      );
      return;
    }
    if (
      data.usage.documents.used >= data.usage.documents.limit ||
      data.usage.storage.used + file.size > data.usage.storage.limit
    ) {
      setUploadError(t("documents.limit"));
      return;
    }
    const controller = new AbortController();
    uploadController.current = controller;
    setUploading(true);
    setUploadName(file.name);
    try {
      const uploaded = await documentsApi.upload(file, controller.signal);
      try {
        await documentsApi.process(uploaded.id, controller.signal);
      } catch (reason) {
        if (isAbort(reason)) throw reason;
        setNotice(
          isPreview
            ? t("documents.previewAdded")
            : t("documents.receivedProcessing"),
        );
        return;
      }
      setNotice(
        isPreview ? t("documents.previewAdded") : t("documents.uploadReceived"),
      );
    } catch (reason) {
      if (!isAbort(reason)) setUploadError(errorMessage(reason));
      else setNotice(t("documents.uploadCancelled"));
    } finally {
      setUploading(false);
      uploadController.current = null;
      refresh(true);
      if (fileInput.current) fileInput.current.value = "";
    }
  }
  async function retryDocument(document: Document) {
    if (retrying) return;
    setRetrying(document.id);
    setUploadError("");
    setNotice("");
    try {
      await documentsApi.retry(document.id);
      setNotice(t("documents.processingCopy"));
      refresh(true);
    } catch (reason) {
      setUploadError(errorMessage(reason));
    } finally {
      setRetrying(null);
    }
  }
  return (
    <div className="container-page py-10 sm:py-14">
      <div className="mb-9">
        <p className="eyebrow mb-3">{t("documents.eyebrow")}</p>
        <h1 className="editorial text-4xl sm:text-5xl">
          {t("documents.title")}
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-muted">
          {isPreview ? t("documents.previewIntro") : t("documents.realIntro")}
        </p>
      </div>
      {loading ? (
        <LoadingState label={t("documents.opening")} />
      ) : error ? (
        <ErrorState message={error} retry={refresh} />
      ) : (
        data && (
          <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
            <div className="space-y-6">
              <div
                onDragOver={(event) => {
                  event.preventDefault();
                  setDragging(true);
                }}
                onDragLeave={() => setDragging(false)}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragging(false);
                  const file = event.dataTransfer.files[0];
                  if (event.dataTransfer.files.length > 1)
                    setUploadError(t("documents.multipleFiles"));
                  else if (file) void upload(file);
                }}
                className={`rounded-2xl border-2 border-dashed p-7 text-center transition-colors sm:p-10 ${dragging ? "border-brand bg-mint" : "border-brand/20 bg-white"}`}
              >
                <UploadCloud size={32} className="mx-auto mb-4 text-brand" />
                <h2 className="text-base font-semibold">
                  {uploading
                    ? t("documents.adding")
                    : t("documents.makePersonal")}
                </h2>
                <p className="mt-3 text-xs leading-6 text-muted">
                  {uploading ? uploadName : t("documents.dragOrChoose")}
                </p>
                <input
                  ref={fileInput}
                  id="document-upload"
                  type="file"
                  accept={data.usage.uploadLimits.allowedExtensions.join(",")}
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (file) void upload(file);
                  }}
                  disabled={uploading}
                  className="sr-only"
                  aria-label={t("documents.chooseUpload")}
                  tabIndex={-1}
                />
                {uploading ? (
                  <div className="mt-5 flex items-center justify-center gap-4">
                    <span
                      role="status"
                      className="flex items-center gap-2 text-xs text-muted"
                    >
                      <LoaderCircle size={16} className="animate-spin" />
                      {t("documents.uploading")}
                    </span>
                    <Button
                      variant="ghost"
                      onClick={() => uploadController.current?.abort()}
                    >
                      <X size={15} />
                      {t("documents.cancel")}
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={() => fileInput.current?.click()}
                    className="mt-5"
                  >
                    {t("documents.chooseFile")} <UploadCloud size={15} />
                  </Button>
                )}
                <p className="mt-4 text-[10px] leading-5 text-muted">
                  {data.usage.uploadLimits.allowedExtensions
                    .map((ext) => ext.replace(".", "").toUpperCase())
                    .join(" · ")}{" "}
                  · Up to {formatBytes(data.usage.uploadLimits.maxFileBytes)}{" "}
                  per file · {t("documents.oneAtTime")}
                </p>
              </div>
              {uploadError && <ErrorState message={uploadError} />}
              {notice && (
                <p
                  role="status"
                  className="flex items-start gap-2 rounded-xl bg-mint p-4 text-xs leading-6 text-brand"
                >
                  <CheckCircle2 size={16} className="mt-1 shrink-0" />
                  {notice}
                </p>
              )}
              <Card>
                <div className="mb-5 flex items-center justify-between">
                  <h2 className="text-sm font-semibold">
                    {t("documents.library")}
                  </h2>
                  <span className="text-xs text-muted">
                    {data.documents.length}{" "}
                    {data.documents.length !== 1
                      ? t("documents.files")
                      : t("documents.file")}
                  </span>
                </div>
                {data.documents.length === 0 ? (
                  <EmptyState
                    title={t("documents.libraryEmpty")}
                    description={
                      isPreview
                        ? t("documents.previewEmpty")
                        : t("documents.realEmpty")
                    }
                  />
                ) : (
                  <ul className="divide-y divide-line">
                    {data.documents.map((doc) => (
                      <li key={doc.id} className="py-5 first:pt-0 last:pb-0">
                        <div className="flex items-start gap-3">
                          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-paper text-brand">
                            <FileText size={21} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-medium break-words">
                              {doc.name}
                            </h3>
                            <p className="mt-1 text-[10px] leading-5 text-muted">
                              {formatBytes(doc.size)} ·{" "}
                              {doc.name.split(".").pop()?.toUpperCase()} ·{" "}
                              {t("documents.added")} {formatDate(doc.createdAt)}
                              {doc.pageCount
                                ? ` · ${doc.pageCount} ${t("documents.pages")}`
                                : ""}
                            </p>
                            <Badge
                              className="mt-2"
                              tone={
                                doc.status === "ready"
                                  ? "green"
                                  : doc.status === "failed"
                                    ? "red"
                                    : "amber"
                              }
                            >
                              {(doc.status === "uploading" ||
                                (isPreview && doc.status === "uploaded") ||
                                doc.status === "processing" ||
                                (doc.status === "deleting" &&
                                  !doc.failureCode)) && (
                                <LoaderCircle
                                  size={11}
                                  className="animate-spin"
                                />
                              )}
                              {doc.status === "ready" && (
                                <CheckCircle2 size={11} />
                              )}
                              {doc.statusDescription ??
                                doc.status.charAt(0).toUpperCase() +
                                  doc.status.slice(1)}
                            </Badge>
                          </div>
                          <button
                            onClick={() => {
                              setDeleting(doc);
                              setDeleteError("");
                            }}
                            aria-label={t("documents.deleteDocument", {
                              name: doc.name,
                            })}
                            className="flex size-11 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-red-50 hover:text-danger"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        {doc.status === "failed" && (
                          <div className="mt-3 rounded-lg bg-red-50 p-3 text-xs leading-6 text-danger">
                            {doc.failureMessage ??
                              doc.error ??
                              t("documents.failedDefault")}{" "}
                            {doc.canRetry
                              ? t("documents.retryHint")
                              : t("documents.deleteHint")}
                            {doc.canRetry && (
                              <Button
                                variant="ghost"
                                loading={retrying === doc.id}
                                disabled={retrying !== null}
                                onClick={() => void retryDocument(doc)}
                                className="mt-2 min-h-8 px-0 py-1 text-danger hover:bg-transparent hover:underline"
                              >
                                {t("documents.retryProcessing")}
                              </Button>
                            )}
                          </div>
                        )}
                        {doc.status === "deleting" && doc.failureCode && (
                          <p
                            className="mt-3 rounded-lg bg-amber-50 p-3 text-xs leading-6 text-amber"
                            role="status"
                          >
                            {t("documents.deletionFailed")}
                          </p>
                        )}
                        {doc.status === "ready" && !isPreview && (
                          <p className="mt-3 text-xs leading-6 text-muted">
                            {t("documents.processedUnavailable")}
                          </p>
                        )}
                        {doc.status === "ready" && isPreview && (
                          <ButtonLink
                            href={`/chat?document=${encodeURIComponent(doc.id)}`}
                            variant="ghost"
                            className="mt-2 min-h-9 px-0 py-1 text-xs"
                          >
                            <Sparkles size={13} />
                            {t("documents.askAbout")}
                          </ButtonLink>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </div>
            <div className="space-y-6">
              <UsageCard usage={data.usage} />
              <Card>
                <h2 className="text-sm font-semibold">
                  {t("documents.afterUpload")}
                </h2>
                <ol className="mt-5 space-y-5">
                  {[
                    [
                      "01",
                      t("documents.received"),
                      t("documents.receivedCopy"),
                    ],
                    [
                      "02",
                      t("documents.processing"),
                      t("documents.processingCopy"),
                    ],
                    [
                      "03",
                      t("documents.ready"),
                      isPreview
                        ? t("documents.readyPreviewCopy")
                        : t("documents.readyRealCopy"),
                    ],
                  ].map(([number, title, copy]) => (
                    <li key={number} className="flex items-start gap-3">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-mint text-[10px] font-semibold text-brand">
                        {number}
                      </span>
                      <div>
                        <p className="text-xs font-semibold">{title}</p>
                        <p className="mt-1 text-xs leading-6 text-muted">
                          {copy}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
                {isPreview && (
                  <p className="mt-5 border-t border-line pt-4 text-[11px] leading-6 text-amber">
                    {t("documents.previewStates")}
                  </p>
                )}
              </Card>
            </div>
          </div>
        )
      )}
      <Modal
        open={!!deleting}
        onClose={() => {
          if (!deleteBusy) setDeleting(null);
        }}
        title={t("documents.removeDocument")}
      >
        <p className="text-sm leading-7 text-muted">
          {t("documents.removeDocumentCopy", { name: deleting?.name ?? "" })}
        </p>
        {deleteError && (
          <div className="mt-4">
            <ErrorState message={deleteError} />
          </div>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <Button
            variant="secondary"
            disabled={deleteBusy}
            onClick={() => setDeleting(null)}
          >
            {t("documents.keepDocument")}
          </Button>
          <Button
            variant="danger"
            loading={deleteBusy}
            onClick={async () => {
              if (!deleting) return;
              setDeleteBusy(true);
              setDeleteError("");
              try {
                await documentsApi.remove(deleting.id);
                setDeleting(null);
                refresh(true);
                setNotice(t("documents.removed"));
              } catch (reason) {
                setDeleteError(errorMessage(reason));
              } finally {
                setDeleteBusy(false);
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
