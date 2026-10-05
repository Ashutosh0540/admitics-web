import { ApiClientError } from "./errors";
import type {
  Conversation,
  Document,
  Exam,
  Message,
  Source,
  Usage,
  User,
} from "@/types";

type RecordValue = Record<string, unknown>;
const object = (value: unknown): value is RecordValue =>
  !!value && typeof value === "object" && !Array.isArray(value);
const text = (v: unknown): v is string => typeof v === "string";
const number = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v) && v >= 0;
const strings = (v: unknown): v is string[] =>
  Array.isArray(v) && v.every(text);
const date = (v: unknown) => text(v) && Number.isFinite(Date.parse(v));
const optionalDate = (v: unknown) => v === null || date(v);
export const isUser = (v: unknown): v is User =>
  object(v) &&
  text(v.id) &&
  text(v.email) &&
  text(v.name) &&
  (v.createdAt === undefined || date(v.createdAt));
export const isConversation = (v: unknown): v is Conversation =>
  object(v) &&
  text(v.id) &&
  text(v.title) &&
  date(v.createdAt) &&
  date(v.updatedAt) &&
  strings(v.documentIds) &&
  (v.lastMessage === undefined || text(v.lastMessage));
const isSource = (v: unknown): v is Source =>
  object(v) &&
  text(v.id) &&
  text(v.title) &&
  text(v.publisher) &&
  ["official", "secondary", "document", "unverified"].includes(String(v.kind)) &&
  (v.url === undefined || text(v.url));
export function isMessage(v: unknown): v is Message {
  if (!(
    object(v) &&
    text(v.id) &&
    text(v.conversationId) &&
    ["user", "assistant"].includes(String(v.role)) &&
    text(v.content) &&
    date(v.createdAt) &&
    strings(v.documentIds) &&
    Array.isArray(v.sources) &&
    v.sources.every(isSource) &&
    Array.isArray(v.citations)
  ))
    return false;
  const sources: Source[] = v.sources;
  return v.citations.every(
    (c) =>
      object(c) &&
      text(c.id) &&
      text(c.sourceId) &&
      text(c.label) &&
      (c.excerpt === undefined || text(c.excerpt)) &&
      sources.some((s) => s.id === c.sourceId),
  );
}
export const isDocument = (v: unknown): v is Document =>
  object(v) &&
  text(v.id) &&
  text(v.name) &&
  text(v.mimeType) &&
  number(v.size) &&
  date(v.createdAt) &&
  [
    "uploading",
    "uploaded",
    "processing",
    "ready",
    "failed",
    "deleting",
    "deleted",
  ].includes(String(v.status)) &&
  (v.error === undefined || text(v.error));
const isExamDate = (v: unknown) =>
  object(v) &&
  text(v.id) &&
  [
    "registration-open",
    "registration-close",
    "admit-card",
    "examination",
    "result",
    "counselling",
    "admission",
  ].includes(String(v.kind)) &&
  text(v.label) &&
  optionalDate(v.date) &&
  (v.endDate === undefined || optionalDate(v.endDate)) &&
  ["upcoming", "past", "not-published"].includes(String(v.status)) &&
  typeof v.isDemo === "boolean" &&
  (v.note === undefined || text(v.note));
const isExamSource = (v: unknown) =>
  object(v) &&
  text(v.id) &&
  text(v.title) &&
  text(v.publisher) &&
  (v.url === null || text(v.url)) &&
  ["official-notice", "application-portal", "counselling-portal"].includes(
    String(v.kind),
  ) &&
  ["verified", "needs-review", "demo"].includes(String(v.verificationStatus)) &&
  typeof v.isDemo === "boolean" &&
  (v.note === undefined || text(v.note));
const isEligibilityRule = (v: unknown) =>
  object(v) &&
  text(v.id) &&
  text(v.field) &&
  ["equals", "one-of", "at-least", "between", "is-true"].includes(
    String(v.operator),
  ) &&
  (["string", "number", "boolean"].includes(typeof v.value) ||
    (Array.isArray(v.value) &&
      v.value.every((item) =>
        ["string", "number", "boolean"].includes(typeof item),
      ))) &&
  text(v.label) &&
  typeof v.required === "boolean" &&
  (v.note === undefined || text(v.note)) &&
  typeof v.isDemo === "boolean";
const isEligibilityField = (v: unknown) =>
  object(v) &&
  text(v.id) &&
  text(v.label) &&
  ["select", "boolean"].includes(String(v.type)) &&
  typeof v.required === "boolean" &&
  (v.options === undefined ||
    (Array.isArray(v.options) &&
      v.options.every(
        (option) => object(option) && text(option.value) && text(option.label),
      ))) &&
  (v.helpText === undefined || text(v.helpText));
export const isExam = (v: unknown): v is Exam =>
  object(v) &&
  text(v.id) &&
  text(v.slug) &&
  text(v.name) &&
  (v.shortName === undefined || text(v.shortName)) &&
  [
    "Engineering",
    "University admissions",
    "Medical & health",
    "Postgraduate study",
  ].includes(String(v.category)) &&
  ["UG", "PG", "UG & PG"].includes(String(v.level)) &&
  text(v.summary) &&
  text(v.description) &&
  text(v.conductingBody) &&
  object(v.applicationStatus) &&
  ["open", "opening-soon", "closed", "not-published"].includes(
    String(v.applicationStatus.code),
  ) &&
  text(v.applicationStatus.label) &&
  (v.applicationStatus.note === undefined || text(v.applicationStatus.note)) &&
  Array.isArray(v.dates) &&
  v.dates.every(isExamDate) &&
  Array.isArray(v.eligibilityRules) &&
  v.eligibilityRules.every(isEligibilityRule) &&
  Array.isArray(v.eligibilityFields) &&
  v.eligibilityFields.every(isEligibilityField) &&
  Array.isArray(v.sources) &&
  v.sources.every(isExamSource) &&
  ["verified", "needs-review", "demo"].includes(
    String(v.verificationStatus),
  ) &&
  text(v.verificationNote) &&
  typeof v.isDemo === "boolean";
const quota = (v: unknown) => object(v) && number(v.used) && number(v.limit);
export const isUsage = (v: unknown): v is Usage =>
  object(v) &&
  text(v.plan) &&
  date(v.periodEnd) &&
  quota(v.messages) &&
  quota(v.documents) &&
  quota(v.storage) &&
  object(v.uploadLimits) &&
  number(v.uploadLimits.maxFileBytes) &&
  strings(v.uploadLimits.allowedMimeTypes) &&
  strings(v.uploadLimits.allowedExtensions);
export function validate<T>(
  value: unknown,
  guard: (value: unknown) => value is T,
): T {
  if (!guard(value))
    throw new ApiClientError(
      "CONTRACT_MISMATCH",
      "The API response doesn't match the connected frontend contract. Please try again after integration is configured.",
    );
  return value;
}
export function list<T>(guard: (value: unknown) => value is T) {
  return (value: unknown): value is T[] =>
    Array.isArray(value) && value.every(guard);
}
