import { demoExams, getDemoExam } from "@/lib/exams/mock-data";
import type { ApiAdapter } from "./contracts";
import { request } from "./client";
import { ApiClientError } from "./errors";
import {
  contractMismatch,
  dataEnvelope,
  mapConversation,
  mapDocument,
  mapMessage,
  mapUsage,
  mapUser,
} from "./real-mappers";

// This adapter maps the confirmed admitics-ai response envelopes into the
// frontend domain models. It does not assume streaming or undocumented routes.
const conversationPath = (id: string) =>
  `/api/v1/conversations/${encodeURIComponent(id)}`;
const documentPath = (id: string) =>
  `/api/v1/documents/${encodeURIComponent(id)}`;

function numericCursor(value: unknown): number | null {
  if (value === null) return null;
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 1)
    throw contractMismatch("Expected a pagination cursor.");
  return value;
}

async function allPages<T>(
  path: string,
  key: string,
  map: (value: unknown) => T,
  transport: typeof request,
  signal?: AbortSignal,
) {
  const result: T[] = [];
  let cursor: number | null = null;
  const cursors = new Set<number>();
  do {
    const query = new URLSearchParams({ limit: "100" });
    if (cursor !== null) query.set("cursor", String(cursor));
    const data = dataEnvelope(
      await transport(`${path}?${query.toString()}`, { signal }),
    );
    if (!Array.isArray(data[key])) throw contractMismatch(`Expected ${key}.`);
    result.push(...data[key].map(map));
    cursor = numericCursor(data.nextCursor);
    if (cursor !== null) {
      if (cursors.has(cursor)) throw contractMismatch("Pagination did not advance.");
      cursors.add(cursor);
    }
  } while (cursor !== null);
  return result;
}

function bodyWithTitle(input: { title?: string; documentIds?: string[] }) {
  // documentIds is a preview-only UI concept. The real backend currently
  // accepts only an optional conversation title.
  return JSON.stringify(input.title === undefined ? {} : { title: input.title });
}

export function createRealApi(transport: typeof request = request): ApiAdapter {
  const request = transport;
  return {
  async listExams() {
    // admitics-ai has no public exam route yet. Keep the reviewed demo adapter
    // visible in real mode rather than making an unsupported network request.
    return demoExams;
  },
  async getExam(slug) {
    return getDemoExam(slug);
  },
  async listConversations(signal) {
    return allPages(
      "/api/v1/conversations",
      "conversations",
      mapConversation,
      request,
      signal,
    );
  },
  async createConversation(input, signal) {
    const data = dataEnvelope(
      await request("/api/v1/conversations", {
        method: "POST",
        body: bodyWithTitle(input),
        signal,
      }),
    );
    return mapConversation(data.conversation);
  },
  async getConversation(id, signal) {
    const data = dataEnvelope(await request(conversationPath(id), { signal }));
    return mapConversation(data.conversation);
  },
  async updateConversation(id, input, signal) {
    const data = dataEnvelope(
      await request(conversationPath(id), {
        method: "PATCH",
        body: JSON.stringify({ title: input.title }),
        signal,
      }),
    );
    return mapConversation(data.conversation);
  },
  async deleteConversation(id, signal) {
    await request(conversationPath(id), { method: "DELETE", signal });
  },
  async listMessages(id, signal) {
    return allPages(
      `${conversationPath(id)}/messages`,
      "messages",
      (value) => mapMessage(value),
      request,
      signal,
    );
  },
  async *sendMessage(id, input, signal) {
    if (input.documentIds.length)
      throw new ApiClientError(
        "DOCUMENT_CONTEXT_UNAVAILABLE",
        "Selecting specific documents for a question isn't supported yet. Remove the selected files to send this question.",
      );
    const data = dataEnvelope(
      await request(`${conversationPath(id)}/messages`, {
        method: "POST",
        headers: { "Idempotency-Key": input.requestId },
        body: JSON.stringify({ content: input.content, role: "user" }),
        signal,
      }),
    );
    if (data.message === undefined) throw contractMismatch("Expected message.");
    const userMessage = mapMessage(data.message);
    const assistantMessage = data.assistantMessage
      ? mapMessage(data.assistantMessage, data.knowledge)
      : undefined;
    yield {
      type: "complete",
      userMessage,
      ...(assistantMessage ? { assistantMessage } : {}),
    };
  },
  async getUser(signal) {
    const data = dataEnvelope(await request("/api/v1/auth/me", { signal }));
    return mapUser(data.user);
  },
  async getUsage(signal) {
    const data = dataEnvelope(await request("/api/v1/usage", { signal }));
    return mapUsage(data.usage);
  },
  async listDocuments(signal) {
    return allPages(
      "/api/v1/documents",
      "documents",
      mapDocument,
      request,
      signal,
    );
  },
  async getDocument(id, signal) {
    const data = dataEnvelope(await request(documentPath(id), { signal }));
    return mapDocument(data.document);
  },
  async uploadDocument(file, signal) {
    const body = await file.arrayBuffer();
    const data = dataEnvelope(
      await request("/api/v1/documents/upload", {
        method: "POST",
        headers: {
          "Content-Type": file.type,
          "X-Document-Filename": file.name,
          "X-Document-Display-Name": file.name,
        },
        body,
        signal,
      }),
    );
    return mapDocument(data.document);
  },
  async processDocument(id, signal) {
    const data = dataEnvelope(
      await request(`${documentPath(id)}/process`, {
        method: "POST",
        signal,
      }),
    );
    return mapDocument(data.document);
  },
  async retryDocument(id, signal) {
    const data = dataEnvelope(
      await request(`${documentPath(id)}/retry`, {
        method: "POST",
        signal,
      }),
    );
    return mapDocument(data.document);
  },
  async deleteDocument(id, signal) {
    await request(documentPath(id), { method: "DELETE", signal });
  },
  };
}

export const realApi = createRealApi();
