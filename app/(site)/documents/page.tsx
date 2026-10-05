import { DocumentsView } from "@/components/documents/documents-view";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Your documents",
  "Upload, manage and use documents as context for admissions guidance.",
  "/documents",
  true,
);
export default function DocumentsPage() {
  return <DocumentsView />;
}
