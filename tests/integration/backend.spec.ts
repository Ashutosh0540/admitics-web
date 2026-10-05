import { expect, test } from "@playwright/test";
import { createRealApi } from "@/lib/api/real";
import { createApiClient } from "@/lib/api/client";

test.describe.configure({ mode: "serial" });
const workerUrl = "http://127.0.0.1:8799";

async function adapter(other = false, expired = false) {
  const session = await (await fetch(`http://127.0.0.1:8798/test/session?other=${other}&expired=${expired}`)).json();
  return {
    session,
    api: createRealApi(createApiClient({ baseUrl: workerUrl, accessToken: async () => session.access_token, allowLocalHttp: true })),
  };
}

test("actual Worker: conversation CRUD, pagination, AI JSON, idempotent replay and ownership", async () => {
  const { api } = await adapter();
  const { api: other } = await adapter(true);
  const conversation = await api.createConversation({ title: "Local integration" });
  expect((await api.getConversation(conversation.id)).title).toBe("Local integration");
  expect((await api.listConversations()).some((item) => item.id === conversation.id)).toBe(true);
  expect((await api.updateConversation(conversation.id, { title: "Updated" })).title).toBe("Updated");
  const input = { content: "Help me plan", documentIds: [], requestId: crypto.randomUUID() };
  const first = await Array.fromAsync(api.sendMessage(conversation.id, input));
  expect(first[0].type).toBe("complete");
  const replay = await Array.fromAsync(api.sendMessage(conversation.id, input));
  expect(replay).toEqual(first);
  expect((await api.listMessages(conversation.id)).length).toBe(2);
  await expect(other.getConversation(conversation.id)).rejects.toMatchObject({ status: 404 });
  await expect(other.listMessages(conversation.id)).rejects.toMatchObject({ status: 404 });
  await expect(Array.fromAsync(api.sendMessage(conversation.id, { ...input, content: "Changed body" }))).rejects.toMatchObject({ status: 409 });
  await api.deleteConversation(conversation.id);
  await expect(api.getConversation(conversation.id)).rejects.toMatchObject({ status: 404 });
});

test("actual Worker: binary R2 upload, lifecycle, usage stock and isolation", async () => {
  const { api } = await adapter();
  const { api: other } = await adapter(true);
  const before = await api.getUsage();
  const document = await api.uploadDocument(new File(["Local private document."], "notes.txt", { type: "text/plain" }));
  expect(document.status).toBe("uploaded");
  expect((await api.getDocument(document.id)).name).toBe("notes.txt");
  expect((await api.listDocuments()).some((item) => item.id === document.id)).toBe(true);
  expect((await api.getUsage()).documents.used).toBe(before.documents.used + 1);
  await expect(other.getDocument(document.id)).rejects.toMatchObject({ status: 404 });
  await expect(other.deleteDocument(document.id)).rejects.toMatchObject({ status: 404 });
  // File-only local composition has no queue: never claim READY or invent processing.
  await expect(api.processDocument(document.id)).rejects.toMatchObject({ status: 503, code: "DOCUMENT_UNAVAILABLE" });
  await expect(api.retryDocument(document.id)).rejects.toMatchObject({ status: 409 });
  await api.deleteDocument(document.id);
  await api.deleteDocument(document.id);
  expect((await api.getDocument(document.id)).status).toBe("deleted");
  expect((await api.listDocuments()).some((item) => item.id === document.id)).toBe(false);
});

test("actual Worker: expired identity, partial AI persistence and safe recovery", async () => {
  const { api } = await adapter();
  const { api: expired } = await adapter(false, true);
  await expect(expired.getUser()).rejects.toMatchObject({ status: 401, code: "UNAUTHENTICATED" });
  const conversation = await api.createConversation({});
  const input = { content: "Help me [integration:fail]", documentIds: [], requestId: crypto.randomUUID() };
  await expect(Array.fromAsync(api.sendMessage(conversation.id, input))).rejects.toMatchObject({ status: 503, code: "AI_GENERATION_FAILED" });
  const history = await api.listMessages(conversation.id);
  expect(history).toHaveLength(1);
  expect(history[0].role).toBe("user");
  await expect(Array.fromAsync(api.sendMessage(conversation.id, input))).rejects.toMatchObject({ status: 503 });
  expect(await api.listMessages(conversation.id)).toHaveLength(1);
  await api.deleteConversation(conversation.id);
});

test("browser real-mode smoke: SDK session restoration, bearer chat, history, documents and logout", async ({ page }) => {
  const { session } = await adapter();
  await page.addInitScript((value) => {
    if (!sessionStorage.getItem("fixture-installed")) {
      localStorage.setItem("sb-127-auth-token", JSON.stringify(value));
      sessionStorage.setItem("fixture-installed", "true");
    }
  }, session);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const width of [390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto("/chat");
    await expect(page.getByRole("textbox", { name: "Your question for Admitics" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.getByRole("textbox", { name: "Your question for Admitics" }).fill("Help me plan a next step.");
  await page.getByRole("button", { name: "Send question" }).click();
  await expect(page.getByRole("article", { name: "Admitics response" })).toContainText("Local contract fixture response");
  await page.reload();
  await expect(page.getByRole("article", { name: "Your question" })).toHaveCount(1);
  await page.goto("/documents");
  await expect(page.getByRole("button", { name: "Choose a file" })).toBeVisible();
  await page.locator('input[type="file"]').setInputFiles({ name: "browser.txt", mimeType: "text/plain", buffer: Buffer.from("Browser to local R2") });
  await expect(page.getByRole("heading", { name: "browser.txt" })).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: "Your upload was received" })).toBeVisible();
  await page.goto("/settings");
  await page.getByRole("main").getByRole("button", { name: "Log out", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.goto("/chat");
  await expect(page.getByRole("link", { name: "Log in to continue" })).toBeVisible();
  expect(errors).toEqual([]);
});

test("actual Worker: timed-out and cancelled acknowledgements never auto-resend; quotas and forbidden operations", async () => {
  const { session, api } = await adapter();
  const client = createApiClient({ baseUrl: workerUrl, accessToken: async () => session.access_token, allowLocalHttp: true, timeoutMs: 150 });
  await expect(client("/api/v1/admin/health")).rejects.toMatchObject({ status: 403 });
  const first = await api.createConversation({});
  await expect(client(`/api/v1/conversations/${first.id}/messages`, {
    method: "POST", headers: { "Idempotency-Key": crypto.randomUUID() },
    body: JSON.stringify({ content: "A slow question [integration:slow]" }),
  })).rejects.toMatchObject({ code: "TIMEOUT" });
  const second = await api.createConversation({});
  const controller = new AbortController();
  const pending = client(`/api/v1/conversations/${second.id}/messages`, {
    method: "POST", headers: { "Idempotency-Key": crypto.randomUUID() }, signal: controller.signal,
    body: JSON.stringify({ content: "Another slow question [integration:slow]" }),
  });
  setTimeout(() => controller.abort(), 100);
  await expect(pending).rejects.toMatchObject({ name: "AbortError" });
  // The server can still finish after a client stops waiting. Canonical history
  // is the authority; do not assume an HTTP disconnect undoes a committed turn.
  await new Promise((resolve) => setTimeout(resolve, 4500));
  expect((await api.listMessages(first.id)).filter((message) => message.role === "user")).toHaveLength(1);
  expect((await api.listMessages(second.id)).filter((message) => message.role === "user")).toHaveLength(1);
  const quota = await api.getUsage();
  expect(quota.messages).toEqual({ used: 5, limit: 5 });
  await expect(Array.fromAsync(api.sendMessage(first.id, {
    content: "Over quota", requestId: crypto.randomUUID(), documentIds: [],
  }))).rejects.toMatchObject({ code: "QUOTA_EXCEEDED", status: 429 });
  await api.deleteConversation(first.id);
  await api.deleteConversation(second.id);
});

test("composed real backend: READY, PARSE_FAILED, transient retry and server-derived citations", async ({ page }) => {
  const { session } = await adapter();
  const api = createRealApi(createApiClient({
    baseUrl: "http://127.0.0.1:8800", accessToken: async () => session.access_token, allowLocalHttp: true,
  }));
  const conversation = await api.createConversation({});
  const document = await api.uploadDocument(new File(["Local processing fixture."], "ready.txt", { type: "text/plain" }));
  await api.processDocument(document.id);
  expect((await api.getDocument(document.id)).status).toBe("ready");
  const invalid = await api.uploadDocument(new File(["%PDF-1.7\nMalformed fixture."], "invalid.pdf", { type: "application/pdf" }));
  await api.processDocument(invalid.id).catch(() => undefined);
  const failed = await api.getDocument(invalid.id);
  expect(failed).toMatchObject({ status: "failed", failureCode: "PARSE_FAILED", canRetry: false });
  await expect(api.retryDocument(invalid.id)).rejects.toMatchObject({ status: 409 });
  const transient = await api.uploadDocument(new File(["transient-fixture"], "retry.txt", { type: "text/plain" }));
  await api.processDocument(transient.id).catch(() => undefined);
  expect(await api.getDocument(transient.id)).toMatchObject({ status: "failed", canRetry: true });
  await api.retryDocument(transient.id);
  expect((await api.getDocument(transient.id)).status).toBe("ready");
  const [event] = await Array.fromAsync(api.sendMessage(conversation.id, {
    content: "Synthetic local source contract fixture", documentIds: [], requestId: crypto.randomUUID(),
  }));
  expect(event.type).toBe("complete");
  if (event.type === "complete") {
    expect(event.assistantMessage?.sources[0]).toMatchObject({ title: "Local source fixture", verificationStatus: "verified" });
    expect(event.assistantMessage?.citations[0].sourceId).toBe("fixture-source");
  }
  // Browser still runs the shipped real adapter. Only the network destination
  // is forwarded to the backend's test-composed RAG runtime.
  await page.addInitScript(value => localStorage.setItem("sb-127-auth-token", JSON.stringify(value)), session);
  await page.route("http://127.0.0.1:8799/api/v1/**", async route => {
    await route.continue({ url: route.request().url().replace(":8799/", ":8800/") });
  });
  await page.goto("/chat");
  await page.getByRole("textbox", { name: "Your question for Admitics" }).fill("Synthetic local source contract fixture");
  await page.getByRole("button", { name: "Send question" }).click();
  await expect(page.getByRole("link", { name: /Local source fixture/ })).toHaveAttribute("href", "https://example.test/local-fixture");
  await api.deleteDocument(document.id);
  await api.deleteDocument(invalid.id);
  await api.deleteDocument(transient.id);
  await api.deleteConversation(conversation.id);
});
