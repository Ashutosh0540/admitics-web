import type {
  Citation,
  Conversation,
  Document,
  Message,
  Source,
  Usage,
  User,
} from "@/types";
import { ApiClientError } from "./errors";

type RecordValue = Record<string, unknown>;

function record(value: unknown): value is RecordValue {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function stringValue(value: unknown, field: string): string {
  if (typeof value !== "string") throw contractMismatch(`Expected ${field}.`);
  return value;
}

function integerValue(value: unknown, field: string): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 0)
    throw contractMismatch(`Expected ${field}.`);
  return value;
}

function nullableString(value: unknown, field: string) {
  if (value !== null && typeof value !== "string")
    throw contractMismatch(`Expected ${field}.`);
  return value;
}

function dateFromUnix(value: unknown, field: string) {
  const date = new Date(integerValue(value, field) * 1000);
  if (!Number.isFinite(date.getTime())) throw contractMismatch();
  return date.toISOString();
}

export function contractMismatch(message = "The API response does not match the frontend contract.") {
  return new ApiClientError(
    "CONTRACT_MISMATCH",
    `${message} Please try again after integration is configured.`,
  );
}

export function dataEnvelope(value: unknown): RecordValue {
  if (!record(value) || value.success !== true || !record(value.data))
    throw contractMismatch();
  return value.data;
}

export function mapUser(value: unknown): User {
  if (!record(value)) throw contractMismatch();
  const email = nullableString(value.email, "user.email") ?? "";
  return {
    id: stringValue(value.id, "user.id"),
    email,
    name: email.split("@")[0] || "Student",
  };
}

export function mapConversation(value: unknown): Conversation {
  if (!record(value)) throw contractMismatch();
  return {
    id: String(integerValue(value.id, "conversation.id")),
    title: stringValue(value.title, "conversation.title"),
    createdAt: dateFromUnix(value.createdAt, "conversation.createdAt"),
    updatedAt: dateFromUnix(value.updatedAt, "conversation.updatedAt"),
    documentIds: [],
  };
}

type KnowledgeCitation = {
  id: string;
  sourceId: string;
  sourceTitle: string;
  sourceType: string;
  publisher: string;
  canonicalUrl: string | null;
  trust: Source["trust"];
  verificationStatus: Source["verificationStatus"];
  reviewAfter: string | null;
};

function mapKnowledge(value: unknown): {
  sources: Source[];
  citations: Citation[];
} {
  if (!record(value) || !Array.isArray(value.citations))
    throw contractMismatch("Expected source metadata.");
  const citations = value.citations.flatMap((item): KnowledgeCitation[] => {
    if (!record(item)) throw contractMismatch("Expected citation metadata.");
    const sourceType = stringValue(item.sourceType, "knowledge.citation.sourceType");
    const trust = stringValue(item.trust, "knowledge.citation.trust") as Source["trust"];
    const verification = record(item.verification) ? item.verification : null;
    const status = verification
      ? (stringValue(verification.status, "knowledge.citation.verification.status") as Source["verificationStatus"])
      : undefined;
    if (
      !["web", "document", "dataset", "manual"].includes(sourceType) ||
      !["official", "trusted_secondary", "unverified", "disallowed"].includes(String(trust)) ||
      !["pending", "verified", "expired", "rejected"].includes(String(status))
    ) throw contractMismatch("Expected source trust and verification metadata.");
    const reviewAfter = verification?.reviewAfter;
    return [
      {
        id: stringValue(item.id, "knowledge.citation.id"),
        sourceId: stringValue(item.sourceId, "knowledge.citation.sourceId"),
        sourceTitle: stringValue(item.sourceTitle, "knowledge.citation.sourceTitle"),
        sourceType,
        publisher: stringValue(item.publisher, "knowledge.citation.publisher"),
        canonicalUrl: nullableString(item.canonicalUrl, "knowledge.citation.canonicalUrl"),
        trust,
        verificationStatus: status,
        reviewAfter: reviewAfter === null || reviewAfter === undefined
          ? null
          : dateFromUnix(reviewAfter, "knowledge.citation.verification.reviewAfter"),
      },
    ];
  });
  const sources = citations
    .filter((citation, index, all) => all.findIndex((item) => item.sourceId === citation.sourceId) === index)
    .map((citation) => ({
      id: citation.sourceId,
      title: citation.sourceTitle,
      url: citation.canonicalUrl ?? undefined,
      publisher: citation.publisher,
      kind: citation.sourceType === "document" ? "document" : citation.trust === "trusted_secondary" ? "secondary" : citation.trust === "official" ? "official" : "unverified",
      trust: citation.trust,
      verificationStatus: citation.verificationStatus,
      reviewAfter: citation.reviewAfter,
    } satisfies Source));
  return {
    sources,
    citations: citations.map((citation) => ({
      id: citation.id,
      sourceId: citation.sourceId,
      label: citation.sourceTitle,
    })),
  };
}

export function mapMessage(value: unknown, knowledge?: unknown): Message {
  if (!record(value)) throw contractMismatch();
  const mappedKnowledge = knowledge ? mapKnowledge(knowledge) : { sources: [], citations: [] };
  return {
    id: String(integerValue(value.id, "message.id")),
    conversationId: String(integerValue(value.conversationId, "message.conversationId")),
    role: value.role === "assistant" ? "assistant" : value.role === "user" ? "user" : (() => { throw contractMismatch(); })(),
    // The backend's grounded-response text includes its citation snapshot. Only
    // remove it when the POST also supplies corresponding structured metadata;
    // history text alone is never promoted into verified source information.
    content: knowledge && mappedKnowledge.citations.length
      ? stringValue(value.content, "message.content").split("\n\nSources (evidence metadata; answer not independently verified):\n")[0]
      : stringValue(value.content, "message.content"),
    createdAt: dateFromUnix(value.createdAt, "message.createdAt"),
    sources: mappedKnowledge.sources,
    citations: mappedKnowledge.citations,
    ...(record(knowledge) && ["not_evaluated", "abstained"].includes(String(knowledge.answerVerification))
      ? { answerVerification: knowledge.answerVerification as "not_evaluated" | "abstained" }
      : {}),
    documentIds: [],
  };
}

const documentStatus: Record<string, Document["status"]> = {
  UPLOADING: "uploading",
  UPLOADED: "uploaded",
  PROCESSING: "processing",
  READY: "ready",
  FAILED: "failed",
  DELETING: "deleting",
  DELETED: "deleted",
};

export function mapDocument(value: unknown): Document {
  if (!record(value)) throw contractMismatch();
  const rawStatus = stringValue(value.status, "document.status");
  const status = documentStatus[rawStatus];
  if (!status) throw contractMismatch("Expected a supported document status.");
  const failureMessage = value.failureMessage === null
    ? null
    : nullableString(value.failureMessage, "document.failureMessage");
  return {
    id: String(integerValue(value.id, "document.id")),
    name: stringValue(value.displayName ?? value.filename, "document.displayName"),
    mimeType: stringValue(value.mimeType, "document.mimeType"),
    size: integerValue(value.sizeBytes, "document.sizeBytes"),
    status,
    createdAt: dateFromUnix(value.createdAt, "document.createdAt"),
    updatedAt: dateFromUnix(value.updatedAt, "document.updatedAt"),
    statusDescription: nullableString(value.statusDescription, "document.statusDescription") ?? undefined,
    canRetry: value.canRetry === true,
    failureCode: nullableString(value.failureCode, "document.failureCode"),
    failureMessage,
    pageCount: integerValue(value.pageCount, "document.pageCount"),
  };
}

export function mapUsage(value: unknown): Usage {
  if (!record(value) || !record(value.limits) || !record(value.used))
    throw contractMismatch();
  const numberAt = (group: RecordValue, key: string) => integerValue(group[key], `usage.${key}`);
  const maxFileBytes = numberAt(value.limits, "file_bytes");
  return {
    plan: "Current limits",
    periodEnd: dateFromUnix(value.periodEnd, "usage.periodEnd"),
    messages: { used: numberAt(value.used, "messages"), limit: numberAt(value.limits, "messages") },
    documents: { used: numberAt(value.used, "documents"), limit: numberAt(value.limits, "documents") },
    storage: { used: numberAt(value.used, "storage_bytes"), limit: numberAt(value.limits, "storage_bytes") },
    uploadLimits: {
      maxFileBytes,
      allowedMimeTypes: [
        "text/plain",
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
      allowedExtensions: [".txt", ".pdf", ".docx"],
    },
  };
}
