import { AdmissionsView } from "@/components/landing/admissions-view";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Explore admissions",
  "Build a practical admissions plan: explore courses, exams, colleges, scholarships and deadlines.",
  "/admissions",
);

export default function AdmissionsPage() {
  return <AdmissionsView />;
}
