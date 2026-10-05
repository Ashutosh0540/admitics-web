import { Suspense } from "react";
import { AuthPanel } from "@/components/auth/auth-panel";
import { LoadingState } from "@/components/ui/primitives";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Create your account",
  "Keep your education questions, conversations and documents together with Admitics.",
  "/signup",
  true,
);
export default function SignupPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <AuthPanel mode="signup" />
    </Suspense>
  );
}
