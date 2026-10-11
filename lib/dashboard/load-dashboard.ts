import type { ApiAdapter } from "@/lib/api/contracts";
import { errorMessage, isAbort } from "@/lib/api/errors";
import type { Conversation, Document, Usage, User } from "@/types";

export type DashboardCapabilities = {
  documents: boolean;
  productControls: boolean;
};

export type DashboardServices = Pick<
  ApiAdapter,
  "getUser" | "listConversations" | "listDocuments" | "getUsage"
>;

export type DashboardData = {
  user: User;
  conversations: Conversation[];
  documents: Document[] | null;
  documentsError: string | null;
  usage: Usage | null;
  usageError: string | null;
};

async function optional<T>(load: () => Promise<T>) {
  try {
    return { value: await load(), error: null };
  } catch (reason) {
    if (isAbort(reason)) throw reason;
    return { value: null, error: errorMessage(reason) };
  }
}

export async function loadDashboardData(
  signal: AbortSignal,
  capability: DashboardCapabilities,
  services: DashboardServices,
): Promise<DashboardData> {
  const [user, conversations] = await Promise.all([
    services.getUser(signal),
    services.listConversations(signal),
  ]);
  const [documents, usage] = await Promise.all([
    capability.documents
      ? optional(() => services.listDocuments(signal))
      : Promise.resolve({ value: null, error: null }),
    capability.productControls
      ? optional(() => services.getUsage(signal))
      : Promise.resolve({ value: null, error: null }),
  ]);
  return {
    user,
    conversations,
    documents: documents.value,
    documentsError: documents.error,
    usage: usage.value,
    usageError: usage.error,
  };
}
