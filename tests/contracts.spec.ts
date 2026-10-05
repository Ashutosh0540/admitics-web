import { expect, test } from "@playwright/test";
import {
  isMessage,
  isUsage,
  list,
  isConversation,
  validate,
} from "@/lib/api/validation";
import { safeExternalUrl } from "@/lib/utils";
import { safeNext } from "@/lib/config";
import type { Message } from "@/types";

test("response validation rejects orphan citations and incomplete payloads", () => {
  const message: Message = {
    id: "message",
    conversationId: "conversation",
    role: "assistant",
    content: "Reference example",
    createdAt: "2026-10-05T00:00:00Z",
    documentIds: [],
    sources: [
      {
        id: "source",
        title: "Official portal",
        publisher: "Authority",
        kind: "official",
        url: "https://www.nta.ac.in/",
      },
    ],
    citations: [{ id: "citation", sourceId: "source", label: "Reference" }],
  };
  expect(isMessage(message)).toBe(true);
  expect(
    isMessage({
      ...message,
      citations: [{ id: "citation", sourceId: "missing", label: "Reference" }],
    }),
  ).toBe(false);
  expect(isMessage({ ...message, sources: undefined })).toBe(false);
  expect(() => validate({ data: [] }, list(isConversation))).toThrow(
    "response doesn't match",
  );
});

test("usage rejects invalid limits instead of displaying misleading meters", () => {
  expect(
    isUsage({
      plan: "Free",
      periodEnd: "bad-date",
      messages: { used: 1, limit: Number.NaN },
    }),
  ).toBe(false);
});

test("source links only permit safe HTTPS destinations", () => {
  expect(safeExternalUrl("https://www.nta.ac.in/")).toBe(
    "https://www.nta.ac.in/",
  );
  for (const value of [
    "javascript:alert(1)",
    "data:text/html,test",
    "http://example.com",
    "/relative",
    "not a URL",
  ])
    expect(safeExternalUrl(value)).toBeUndefined();
});

test("post-login navigation stays within the frontend", () => {
  expect(safeNext("/chat?id=123")).toBe("/chat?id=123");
  for (const value of [
    "https://example.com",
    "//example.com",
    "/\\example.com",
    null,
  ])
    expect(safeNext(value)).toBe("/dashboard");
});
