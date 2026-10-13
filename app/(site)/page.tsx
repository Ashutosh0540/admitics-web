import { HomeView } from "@/components/landing/home-view";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Every education opportunity starts with a question",
  "Ask an education question and explore pathways, admissions, scholarships and next steps with Admitics.",
  "/",
);

export default function Home() {
  return <HomeView />;
}
