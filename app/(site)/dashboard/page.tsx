import { DashboardView } from "@/components/dashboard/dashboard-view";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Your dashboard",
  "Your conversations, questions, documents and usage in one place.",
  "/dashboard",
  true,
);
export default function DashboardPage() {
  return <DashboardView />;
}
