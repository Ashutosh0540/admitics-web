import { expect, test } from "@playwright/test";
import { createRealApi } from "@/lib/api/real";
import { createApiClient } from "@/lib/api/client";
import { createServer } from "node:http";
import { loadDashboardData } from "@/lib/dashboard/load-dashboard";
import { ApiClientError } from "@/lib/api/errors";
import type { Conversation } from "@/types";
import { loadSettingsUsage } from "@/lib/account/load-settings-usage";
import { processUploadedDocument } from "@/lib/documents/process-upload";

const unix = (value: number) => value;
const conversation = (id: number) => ({
  id,
  userId: "11111111-1111-4111-8111-111111111111",
  title: `Conversation ${id}`,
  createdAt: unix(1790985600),
  updatedAt: unix(1790985660),
});

test("HTTP client sanitizes errors, preserves correlation, times out and cancels", async () => {
  const server = createServer((request, response) => {
    if (request.url === "/slow") return;
    const status = Number(request.url?.slice(1));
    response.writeHead(status, {
      "Content-Type": "application/json",
      "X-Request-ID": "safe-correlation",
    });
    response.end(JSON.stringify({
      success: false,
      error: { code: "UNKNOWN_PRIVATE_ERROR", message: "SQL provider stack trace SECRET" },
    }));
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("Missing local fixture address");
  const client = createApiClient({
    baseUrl: `http://127.0.0.1:${address.port}`,
    accessToken: async () => "fixture-only-token",
    allowLocalHttp: true,
    timeoutMs: 100,
  });
  try {
    for (const status of [401, 403, 404, 409, 429, 500, 503]) {
      try {
        await client(`/${status}`);
        throw new Error("Expected an HTTP error");
      } catch (error) {
        expect(error).toMatchObject({ status, requestId: "safe-correlation" });
        expect((error as Error).message).not.toMatch(/SQL|provider|stack|SECRET/);
      }
    }
    await expect(client("/slow")).rejects.toMatchObject({ code: "TIMEOUT" });
    const controller = new AbortController();
    const pending = client("/slow", { signal: controller.signal });
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: "AbortError" });
    await expect(createApiClient({
      baseUrl: "http://127.0.0.1:1", accessToken: async () => "fixture-only-token", allowLocalHttp: true,
    })("/offline")).rejects.toMatchObject({ code: "NETWORK_ERROR" });
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
  }
});

test("real mapping handles every backend document lifecycle and permanent parse failures", async () => {
  for (const status of ["UPLOADING", "UPLOADED", "PROCESSING", "READY", "FAILED", "DELETING", "DELETED"]) {
    const api = createRealApi(async () => ({
      success: true,
      data: { document: { ...documentProjection, status, failureCode: status === "FAILED" ? "PARSE_FAILED" : null, failureMessage: status === "FAILED" ? "The file could not be processed within supported format or size limits." : null, canRetry: false } },
    }));
    const document = await api.getDocument("7");
    expect(document.status).toBe(status.toLowerCase());
    if (status === "FAILED") {
      expect(document.failureCode).toBe("PARSE_FAILED");
      expect(document.canRetry).toBe(false);
    }
  }
});
const message = (id: number, role: "user" | "assistant", content: string) => ({
  id,
  conversationId: 1,
  role,
  content,
  createdAt: unix(1790985600),
});
const documentProjection = {
  id: 7,
  filename: "notes.txt",
  displayName: "notes.txt",
  mimeType: "text/plain",
  sizeBytes: 5,
  status: "READY",
  statusDescription: "Your file is ready.",
  canRetry: false,
  failureMessage: null,
  pageCount: 1,
  characterCount: 5,
  chunkCount: 1,
  failureCode: null,
  createdAt: unix(1790985600),
  updatedAt: unix(1790985660),
  processedAt: unix(1790985660),
  deletedAt: null,
};

test("real adapter maps backend envelopes, pagination, numeric IDs, and chat knowledge", async () => {
  const calls: { path: string; options: RequestInit }[] = [];
  const api = createRealApi(async (path, options = {}) => {
    calls.push({ path, options });
    if (path === "/api/v1/conversations?limit=100")
      return {
        success: true,
        data: { conversations: [conversation(1)], nextCursor: 1 },
      };
    if (path === "/api/v1/conversations?limit=100&cursor=1")
      return {
        success: true,
        data: { conversations: [conversation(2)], nextCursor: null },
      };
    if (path === "/api/v1/conversations/1/messages")
      return {
        success: true,
        data: {
          message: message(2, "user", "What should I check?"),
          assistantMessage: message(3, "assistant", "Check the current notice."),
          knowledge: {
            status: "evidence_cited",
            answerVerification: "not_evaluated",
            citations: [
              {
                id: "citation-1",
                sourceId: "source-1",
                sourceTitle: "Reviewed notice",
                sourceType: "web",
                publisher: "Example publisher",
                canonicalUrl: "https://example.com/notice",
                trust: "official",
                verification: {
                  status: "verified",
                  verifiedAt: unix(1790985600),
                  reviewAfter: null,
                },
              },
            ],
          },
        },
      };
    if (path === "/api/v1/conversations/1/messages?limit=100")
      return {
        success: true,
        data: { messages: [message(2, "user", "History")], nextCursor: null },
      };
    if (path === "/api/v1/conversations/1")
      return { success: true, data: { conversation: conversation(1) } };
    throw new Error(`Unexpected transport path: ${path}`);
  });

  const conversations = await api.listConversations();
  expect(conversations.map((item) => item.id)).toEqual(["1", "2"]);
  expect(conversations[0].createdAt).toBe("2026-10-03T00:00:00.000Z");

  const history = await api.listMessages("1");
  expect(history[0].id).toBe("2");

  const event = (await Array.fromAsync(
    api.sendMessage("1", {
      content: "What should I check?",
      documentIds: [],
      requestId: "request_1",
    }),
  ))[0];
  expect(event.type).toBe("complete");
  if (event.type === "complete") {
    expect(event.assistantMessage?.sources[0]).toMatchObject({
      title: "Reviewed notice",
      verificationStatus: "verified",
    });
    expect(event.conversation).toBeUndefined();
  }
  const sendCall = calls.find((call) => call.path === "/api/v1/conversations/1/messages");
  expect(JSON.parse(String(sendCall?.options.body))).toEqual({
    content: "What should I check?",
    role: "user",
  });
  expect(new Headers(sendCall?.options.headers).get("Idempotency-Key")).toBe("request_1");
});

test("real adapter uses the raw upload contract and document lifecycle endpoints", async () => {
  const calls: { path: string; options: RequestInit }[] = [];
  const api = createRealApi(async (path, options = {}) => {
    calls.push({ path, options });
    if (path === "/api/v1/documents/upload")
      return { success: true, data: { document: documentProjection, deduplicated: false } };
    if (path === "/api/v1/documents/7/process")
      return { success: true, data: { document: documentProjection, queued: true } };
    if (path === "/api/v1/documents/7/retry")
      return { success: true, data: { document: documentProjection, queued: true } };
    throw new Error(`Unexpected transport path: ${path}`);
  });
  const file = new File(["hello"], "notes.txt", { type: "text/plain" });
  const document = await api.uploadDocument(file);
  expect(document.id).toBe("7");
  expect(document.status).toBe("ready");
  await api.processDocument("7");
  await api.retryDocument("7");
  const uploadCall = calls[0];
  expect(uploadCall.path).toBe("/api/v1/documents/upload");
  expect(Object.fromEntries(new Headers(uploadCall.options.headers))).toMatchObject({
    "content-type": "text/plain",
    "x-document-filename": "notes.txt",
    "x-document-display-name": "notes.txt",
  });
  expect(uploadCall.options.body).toBeInstanceOf(ArrayBuffer);
});

test("message-only real chat responses preserve the saved question without an assistant reply", async () => {
  const api = createRealApi(async (path) => {
    if (path === "/api/v1/conversations/1/messages")
      return {
        success: true,
        data: { message: message(11, "user", "A saved staging question") },
      };
    throw new Error(`Unexpected transport path: ${path}`);
  });
  const events = await Array.fromAsync(
    api.sendMessage("1", {
      content: "A saved staging question",
      documentIds: [],
      requestId: "message-only",
    }),
  );
  expect(events).toHaveLength(1);
  expect(events[0]).toMatchObject({
    type: "complete",
    userMessage: { role: "user", content: "A saved staging question" },
  });
  if (events[0].type === "complete")
    expect(events[0].assistantMessage).toBeUndefined();
});

test("dashboard loads identity and history without calling disabled optional endpoints", async () => {
  const calls: string[] = [];
  const user = { id: "u1", email: "student@example.test", name: "Student" };
  const history = [
    {
      id: "c1",
      title: "Saved question",
      createdAt: "2026-10-10T00:00:00.000Z",
      updatedAt: "2026-10-10T00:00:00.000Z",
      documentIds: [],
    },
  ];
  const data = await loadDashboardData(
    new AbortController().signal,
    { documents: false, productControls: false },
    {
      getUser: async () => {
        calls.push("user");
        return user;
      },
      listConversations: async () => {
        calls.push("history");
        return history;
      },
      listDocuments: async () => {
        calls.push("documents");
        return [];
      },
      getUsage: async () => {
        calls.push("usage");
        throw new Error("should not be called");
      },
    },
  );
  expect(calls).toEqual(["user", "history"]);
  expect(data.user).toEqual(user);
  expect(data.conversations).toEqual(history);
  expect(data.documents).toBeNull();
  expect(data.usage).toBeNull();
});

test("dashboard exposes optional endpoint failures without discarding required data", async () => {
  const user = { id: "u1", email: "student@example.test", name: "Student" };
  const history: Conversation[] = [];
  const data = await loadDashboardData(
    new AbortController().signal,
    { documents: true, productControls: true },
    {
      getUser: async () => user,
      listConversations: async () => history,
      listDocuments: async () => {
        throw new ApiClientError("UNAUTHENTICATED", "Session expired", 401);
      },
      getUsage: async () => {
        throw new ApiClientError(
          "SERVER_UNAVAILABLE",
          "Server unavailable",
          503,
        );
      },
    },
  );
  expect(data.user).toEqual(user);
  expect(data.conversations).toEqual(history);
  expect(data.documents).toBeNull();
  expect(data.documentsError).toBe("Session expired");
  expect(data.usage).toBeNull();
  expect(data.usageError).toBe("Server unavailable");
});

test("settings skips the usage request when product controls are disabled", async () => {
  let calls = 0;
  const usage = await loadSettingsUsage(
    false,
    new AbortController().signal,
    async () => {
      calls += 1;
      throw new Error("usage endpoint must not be called");
    },
  );
  expect(calls).toBe(0);
  expect(usage).toBeNull();
});

test("disabled document processing skips processing while preserving upload", async () => {
  let processCalls = 0;
  const started = await processUploadedDocument(
    false,
    "uploaded-1",
    new AbortController().signal,
    async () => {
      processCalls += 1;
      throw new Error("processing endpoint must not be called");
    },
  );
  expect(started).toBe(false);
  expect(processCalls).toBe(0);
});
