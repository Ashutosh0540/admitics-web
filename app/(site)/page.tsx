import { HomeView } from "@/components/landing/home-view";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Your next chapter, with clarity",
  "Make smarter decisions about your education. Explore exams, colleges, courses and scholarships with Admitics, your AI admissions advisor.",
  "/",
);

export default function Home() {
  return <HomeView />;
}
