export interface User {
  id: string;
  email: string;
  name: string;
  createdAt?: string;
}
export interface Conversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
  documentIds: string[];
}
export interface Source {
  id: string;
  title: string;
  url?: string;
  publisher: string;
  kind: "official" | "secondary" | "document" | "unverified";
  trust?: "official" | "trusted_secondary" | "unverified" | "disallowed";
  verificationStatus?: "pending" | "verified" | "expired" | "rejected";
  reviewAfter?: string | null;
}
export interface Citation {
  id: string;
  sourceId: string;
  label: string;
  excerpt?: string;
}
export interface Message {
  id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  sources: Source[];
  citations: Citation[];
  documentIds: string[];
  preview?: boolean;
  answerVerification?: "not_evaluated" | "abstained";
}
export interface Document {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  status:
    | "uploading"
    | "uploaded"
    | "processing"
    | "ready"
    | "failed"
    | "deleting"
    | "deleted";
  createdAt: string;
  updatedAt?: string;
  statusDescription?: string;
  canRetry?: boolean;
  failureCode?: string | null;
  failureMessage?: string | null;
  error?: string;
  pageCount?: number;
}
export interface Usage {
  plan: string;
  periodEnd: string;
  messages: { used: number; limit: number };
  documents: { used: number; limit: number };
  storage: { used: number; limit: number };
  uploadLimits: {
    maxFileBytes: number;
    allowedMimeTypes: string[];
    allowedExtensions: string[];
  };
}
export type {
  EligibilityField,
  EligibilityFieldKey,
  EligibilityFieldOption,
  EligibilityFieldType,
  EligibilityProfile,
  EligibilityResult,
  EligibilityResultStatus,
  EligibilityRule,
  Exam,
  ExamApplicationCode,
  ExamApplicationStatus,
  ExamCategory,
  ExamDate,
  ExamDateKind,
  ExamDateStatus,
  ExamLevel,
  ExamSource,
  ExamSourceKind,
  ExamSourceVerification,
} from "./exams";
export interface ApiError {
  code: string;
  message: string;
  status: number;
  requestId?: string;
}
export interface SendMessageInput {
  content: string;
  documentIds: string[];
  requestId: string;
}
export type ChatEvent =
  | { type: "delta"; text: string }
  | {
      type: "complete";
      userMessage: Message;
      assistantMessage?: Message;
      conversation?: Conversation;
    };
