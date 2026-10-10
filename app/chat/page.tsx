import { Suspense } from "react";
import { ChatWorkspace } from "@/components/chat/chat-workspace";
import { LoadingState } from "@/components/ui/primitives";
import { pageMetadata } from "@/lib/metadata";

export const metadata = pageMetadata(
  "Ask Admitics",
  "Your dedicated AI admissions advisor. Explore your next step in education, one question at a time.",
  "/chat",
  true,
);
export default function ChatPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ChatWorkspace />
    </Suspense>
  );
}
