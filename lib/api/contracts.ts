import type {
  ChatEvent,
  Conversation,
  Document,
  Message,
  SendMessageInput,
  Usage,
  User,
  Exam,
} from "@/types";

export interface ApiAdapter {
  /**
   * Exam routes are frontend contracts only until the knowledge layer supplies
   * its response envelope and verification semantics.
   */
  listExams(signal?: AbortSignal): Promise<Exam[]>;
  getExam(slug: string, signal?: AbortSignal): Promise<Exam | null>;
  listConversations(signal?: AbortSignal): Promise<Conversation[]>;
  createConversation(
    input: { title?: string; documentIds?: string[] },
    signal?: AbortSignal,
  ): Promise<Conversation>;
  getConversation(id: string, signal?: AbortSignal): Promise<Conversation>;
  updateConversation(
    id: string,
    input: { title: string },
    signal?: AbortSignal,
  ): Promise<Conversation>;
  deleteConversation(id: string, signal?: AbortSignal): Promise<void>;
  listMessages(id: string, signal?: AbortSignal): Promise<Message[]>;
  sendMessage(
    id: string,
    input: SendMessageInput,
    signal?: AbortSignal,
  ): AsyncIterable<ChatEvent>;
  getUser(signal?: AbortSignal): Promise<User>;
  getUsage(signal?: AbortSignal): Promise<Usage>;
  listDocuments(signal?: AbortSignal): Promise<Document[]>;
  getDocument(id: string, signal?: AbortSignal): Promise<Document>;
  uploadDocument(file: File, signal?: AbortSignal): Promise<Document>;
  processDocument(id: string, signal?: AbortSignal): Promise<Document>;
  retryDocument(id: string, signal?: AbortSignal): Promise<Document>;
  deleteDocument(id: string, signal?: AbortSignal): Promise<void>;
}

export interface SendMessageResponse {
  userMessage: Message;
  assistantMessage?: Message;
  conversation?: Conversation;
}
