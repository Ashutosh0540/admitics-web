import type { Document } from "@/types";

export async function processUploadedDocument(
  enabled: boolean,
  id: string,
  signal: AbortSignal,
  processDocument: (id: string, signal: AbortSignal) => Promise<Document>,
): Promise<boolean> {
  if (!enabled) return false;
  await processDocument(id, signal);
  return true;
}
