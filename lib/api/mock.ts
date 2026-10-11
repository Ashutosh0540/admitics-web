import type { ApiAdapter } from "./contracts";
import type { Conversation, Document, Message, Source, Usage } from "@/types";
import { demoExams, getDemoExam } from "@/lib/exams/mock-data";
import { getAuth } from "@/lib/auth";
import { capabilities } from "@/lib/config";
import { ApiClientError } from "./errors";
import { isConversation, isDocument, isMessage } from "./validation";

interface PreviewState {
  conversations: Conversation[];
  messages: Message[];
  documents: Document[];
  requests: Record<string, string>;
}
const emptyState = (): PreviewState => ({
  conversations: [],
  messages: [],
  documents: [],
  requests: {},
});
async function store() {
  const user = await getAuth().getSession();
  const key = `admitics:preview:v1:${user?.id ?? "guest"}`;
  let state = emptyState();
  try {
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed: unknown = JSON.parse(saved);
      if (
        parsed &&
        typeof parsed === "object" &&
        "conversations" in parsed &&
        "messages" in parsed &&
        "documents" in parsed &&
        "requests" in parsed &&
        Array.isArray(parsed.conversations) &&
        parsed.conversations.every(isConversation) &&
        Array.isArray(parsed.messages) &&
        parsed.messages.every(isMessage) &&
        Array.isArray(parsed.documents) &&
        parsed.documents.every(isDocument) &&
        typeof parsed.requests === "object" &&
        parsed.requests !== null
      )
        state = parsed as PreviewState;
    }
  } catch {
    throw new ApiClientError(
      "PREVIEW_STORAGE",
      "Your browser's preview storage isn't available. Enable site storage and try again.",
    );
  }
  return {
    state,
    save: () => {
      try {
        localStorage.setItem(key, JSON.stringify(state));
      } catch {
        throw new ApiClientError(
          "PREVIEW_STORAGE",
          "Preview storage is full or unavailable. Remove an old conversation and try again.",
        );
      }
    },
  };
}
export function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted)
      return reject(new DOMException("Cancelled", "AbortError"));
    const cancel = () => {
      clearTimeout(timer);
      signal?.removeEventListener("abort", cancel);
      reject(new DOMException("Cancelled", "AbortError"));
    };
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", cancel);
      resolve();
    }, ms);
    signal?.addEventListener("abort", cancel, { once: true });
  });
}
function find<T extends { id: string }>(items: T[], id: string): T {
  const item = items.find((v) => v.id === id);
  if (!item)
    throw new ApiClientError(
      "NOT_FOUND",
      "This item no longer exists. Refresh to see your latest items.",
      404,
    );
  return item;
}
const now = () => new Date().toISOString();
function lifecycle(doc: Document): Document {
  if (doc.status === "ready" || doc.status === "failed") return doc;
  const age = Date.now() - Date.parse(doc.createdAt);
  if (age < 500) return doc;
  if (age < 2300) return { ...doc, status: "processing" };
  return doc.name.toLowerCase().includes("fail")
    ? {
        ...doc,
        status: "failed",
        error:
          "Preview failure example. Delete this file and upload another to try again.",
      }
    : { ...doc, status: "ready" };
}
function sampleAnswer(
  question: string,
  context: Document[],
): { content: string; sources: Source[] } {
  const q = question.toLowerCase();
  const prefix =
    "> **Preview response.** This is example guidance from a local mock, not a live AI answer or verified admissions advice.\n\n";
  if (context.length)
    return {
      content: `${prefix}### Let's use your document as a starting point\n\nYou've added **${context.map((doc) => doc.name).join(", ")}** to this conversation. In the connected product, Admitics will use backend-processed document context to help answer your question.\n\nThis preview stores file metadata only. **It has not read, extracted, or analyzed your document**, so I can't make claims about its contents.\n\nYou can still plan what to check:\n\n1. Identify the course and admission cycle.\n2. Check eligibility, application dates, and required documents.\n3. Compare the information with the institution's current official notice.\n\nWhat would you like to understand about your application?`,
      sources: [],
    };
  if (q.includes("scholarship") || q.includes("financial"))
    return {
      content: `${prefix}### Make a scholarship shortlist\n\nStart with three types of support:\n\n- **Government schemes:** review the National Scholarship Portal and your state's official scholarship site.\n- **Institutional aid:** look for fee assistance and merit or need-based support on your college's website.\n- **Private programs:** check the sponsor's eligibility and application terms directly.\n\nKeep a checklist of income certificates, academic records, identity documents, and any required bank details. Requirements vary by scheme.\n\n**I haven't checked current application windows.** Use the official portal below to confirm details.\n\nWhich state are you from, and what level of study are you planning?`,
      sources: [
        {
          id: "nsp",
          title: "National Scholarship Portal",
          url: "https://scholarships.gov.in/",
          publisher: "Government of India",
          kind: "official",
        },
      ],
    };
  if (q.includes("document") || q.includes("application"))
    return {
      content: `${prefix}### Your application checklist\n\nThe exact list depends on the institution. A useful starting point is:\n\n1. Class 10 and Class 12 academic records.\n2. An accepted identity document.\n3. Entrance exam result, if the program requires one.\n4. Photograph and signature in the specified format.\n5. Category, income, or domicile certificates **only where applicable**.\n\nKeep the original files and a clearly named copy of each. Read the current official admission notice before uploading anything.\n\nThis is a general checklist, not a verified requirement for a particular college. Which course and college are you applying to?`,
      sources: [],
    };
  if (q.includes("jee") || q.includes("cuet") || q.includes("exam"))
    return {
      content: `${prefix}### Start with the course you want to study\n\n**JEE Main** is a pathway associated with engineering and related programs at participating institutions. **CUET (UG)** is used for undergraduate admissions at participating universities across a range of subjects.\n\nThe right choice depends on:\n\n- Your subjects in Class 12.\n- The program and universities on your shortlist.\n- The subject combination and entrance test those universities require.\n\nDon't assume one score covers every course. Check each institution's current eligibility criteria and the official exam information bulletin.\n\n**No current-year dates or eligibility rules have been verified in this preview.**\n\nWhat subjects are you studying, and which programs interest you?`,
      sources: [
        {
          id: "nta",
          title: "National Testing Agency",
          url: "https://www.nta.ac.in/",
          publisher: "National Testing Agency",
          kind: "official",
        },
      ],
    };
  return {
    content: `${prefix}### Let's turn the big question into a practical next step\n\nYou don't need to choose your whole future today. Start with three things:\n\n1. **Your interests:** which subjects or activities do you enjoy enough to keep exploring?\n2. **Your starting point:** your academic stream, current qualifications, and any location or budget preferences.\n3. **Your shortlist:** compare a few courses and the admissions requirements of colleges that offer them.\n\nThen build a simple plan around eligibility, entrance exams, financial support, and official application deadlines.\n\nIf evidence isn't available, Admitics should say so rather than fill the gaps. This preview hasn't checked any specific admissions notice.\n\n**What are you studying now, and what would you like your next chapter to look like?**`,
    sources: [],
  };
}

export const mockApi: ApiAdapter = {
  async listExams() {
    return demoExams;
  },
  async getExam(slug) {
    return getDemoExam(slug);
  },
  async listConversations(signal) {
    await delay(180, signal);
    const { state } = await store();
    return state.conversations.toSorted((a, b) =>
      b.updatedAt.localeCompare(a.updatedAt),
    );
  },
  async createConversation(input, signal) {
    await delay(100, signal);
    const { state, save } = await store();
    const conversation: Conversation = {
      id: crypto.randomUUID(),
      title: input.title || "A new chapter",
      createdAt: now(),
      updatedAt: now(),
      documentIds: input.documentIds ?? [],
    };
    state.conversations.push(conversation);
    save();
    return conversation;
  },
  async getConversation(id, signal) {
    await delay(100, signal);
    return find((await store()).state.conversations, id);
  },
  async updateConversation(id, input, signal) {
    await delay(120, signal);
    const { state, save } = await store();
    const conversation = find(state.conversations, id);
    conversation.title = input.title;
    save();
    return conversation;
  },
  async deleteConversation(id, signal) {
    await delay(120, signal);
    const { state, save } = await store();
    state.conversations = state.conversations.filter((c) => c.id !== id);
    state.messages = state.messages.filter((m) => m.conversationId !== id);
    save();
  },
  async listMessages(id, signal) {
    await delay(120, signal);
    const { state } = await store();
    find(state.conversations, id);
    return state.messages.filter((m) => m.conversationId === id);
  },
  async *sendMessage(id, input, signal) {
    const { state, save } = await store();
    find(state.conversations, id);
    const docs = input.documentIds.map((docId) =>
      lifecycle(find(state.documents, docId)),
    );
    if (docs.some((doc) => doc.status !== "ready"))
      throw new ApiClientError(
        "DOCUMENT_NOT_READY",
        "A selected document isn't ready. Remove it or wait for processing.",
      );
    if (state.messages.filter((m) => m.role === "assistant").length >= 50)
      throw new ApiClientError(
        "USAGE_LIMIT",
        "You've reached the preview's 50-response limit. Remove an old conversation to continue.",
        429,
      );
    const priorId = state.requests[input.requestId];
    const userMessage: Message = priorId
      ? find(state.messages, priorId)
      : {
          id: crypto.randomUUID(),
          conversationId: id,
          role: "user",
          content: input.content,
          createdAt: now(),
          sources: [],
          citations: [],
          documentIds: input.documentIds,
        };
    if (!priorId) {
      state.messages.push(userMessage);
      state.requests[input.requestId] = userMessage.id;
      save();
    }
    await delay(350, signal);
    if (!capabilities.ai) {
      if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
      const current = await store();
      const latest = find(current.state.conversations, id);
      if (!current.state.messages.some((m) => m.id === userMessage.id))
        throw new ApiClientError("NOT_FOUND", "This conversation was removed.");
      latest.title =
        latest.title === "A new chapter"
          ? input.content.slice(0, 64)
          : latest.title;
      latest.lastMessage = input.content;
      latest.updatedAt = now();
      latest.documentIds = input.documentIds;
      current.save();
      yield { type: "complete", userMessage, conversation: latest };
      return;
    }
    if (
      input.content.includes("[demo:error]") &&
      !sessionStorage.getItem(`admitics:retry:${input.requestId}`)
    ) {
      sessionStorage.setItem(`admitics:retry:${input.requestId}`, "1");
      throw new ApiClientError(
        "DEMO_FAILURE",
        "Example connection failure. Your question is saved; use Retry to continue.",
      );
    }
    const result = sampleAnswer(input.content, docs);
    const chunks = result.content.match(/[\s\S]{1,32}/g) ?? [];
    for (const text of chunks) {
      await delay(24, signal);
      yield { type: "delta", text };
    }
    if (signal?.aborted) throw new DOMException("Cancelled", "AbortError");
    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      conversationId: id,
      role: "assistant",
      content: result.content,
      createdAt: now(),
      sources: result.sources,
      citations: [],
      documentIds: input.documentIds,
      preview: true,
    };
    // Re-read before committing so an aborted/deleted item cannot be resurrected.
    const current = await store();
    const latest = find(current.state.conversations, id);
    if (!current.state.messages.some((m) => m.id === userMessage.id))
      throw new ApiClientError("NOT_FOUND", "This conversation was removed.");
    current.state.messages.push(assistantMessage);
    latest.title =
      latest.title === "A new chapter"
        ? input.content.slice(0, 64)
        : latest.title;
    latest.lastMessage = input.content;
    latest.updatedAt = now();
    latest.documentIds = input.documentIds;
    current.save();
    yield {
      type: "complete",
      userMessage,
      assistantMessage,
      conversation: latest,
    };
  },
  async getUser(signal) {
    await delay(120, signal);
    return (
      (await getAuth().getSession()) ?? {
        id: "guest",
        name: "Explorer",
        email: "",
        createdAt: now(),
      }
    );
  },
  async getUsage(signal) {
    await delay(100, signal);
    const { state } = await store();
    const end = new Date();
    end.setUTCMonth(end.getUTCMonth() + 1, 1);
    end.setUTCHours(0, 0, 0, 0);
    return {
      plan: "Preview",
      periodEnd: end.toISOString(),
      messages: {
        used: state.messages.filter((m) => m.role === "assistant").length,
        limit: 50,
      },
      documents: { used: state.documents.length, limit: 10 },
      storage: {
        used: state.documents.reduce((sum, doc) => sum + doc.size, 0),
        limit: 50 * 1024 * 1024,
      },
      uploadLimits: {
        maxFileBytes: 10 * 1024 * 1024,
        allowedMimeTypes: [
          "application/pdf",
          "text/plain",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        allowedExtensions: [".pdf", ".txt", ".docx"],
      },
    } satisfies Usage;
  },
  async listDocuments(signal) {
    await delay(140, signal);
    const { state, save } = await store();
    state.documents = state.documents.map(lifecycle);
    save();
    return state.documents.toSorted((a, b) =>
      b.createdAt.localeCompare(a.createdAt),
    );
  },
  async getDocument(id, signal) {
    await delay(100, signal);
    return lifecycle(find((await store()).state.documents, id));
  },
  async uploadDocument(file, signal) {
    const usage = await this.getUsage(signal);
    const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
    if (
      !usage.uploadLimits.allowedExtensions.includes(extension) ||
      (file.type && !usage.uploadLimits.allowedMimeTypes.includes(file.type))
    )
      throw new ApiClientError("FILE_TYPE", "Choose a PDF, DOCX, or TXT file.");
    if (file.size === 0 || file.size > usage.uploadLimits.maxFileBytes)
      throw new ApiClientError(
        "FILE_SIZE",
        "Choose a non-empty file smaller than the displayed upload limit.",
      );
    if (
      usage.documents.used >= usage.documents.limit ||
      usage.storage.used + file.size > usage.storage.limit
    )
      throw new ApiClientError(
        "LIMIT",
        "Your document or storage limit has been reached. Delete a file to make space.",
      );
    await delay(400, signal);
    const { state, save } = await store();
    const doc: Document = {
      id: crypto.randomUUID(),
      name: file.name,
      mimeType: file.type || "application/octet-stream",
      size: file.size,
      status: "uploaded",
      createdAt: now(),
    };
    state.documents.push(doc);
    save();
    return doc;
  },
  async processDocument(id, signal) {
    await delay(120, signal);
    return lifecycle(find((await store()).state.documents, id));
  },
  async retryDocument(id, signal) {
    await delay(120, signal);
    return lifecycle(find((await store()).state.documents, id));
  },
  async deleteDocument(id, signal) {
    await delay(120, signal);
    const { state, save } = await store();
    state.documents = state.documents.filter((doc) => doc.id !== id);
    state.conversations.forEach((c) => {
      c.documentIds = c.documentIds.filter((docId) => docId !== id);
    });
    save();
  },
};
