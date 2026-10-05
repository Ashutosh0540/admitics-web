import { Suspense } from "react";
import { AuthPanel } from "@/components/auth/auth-panel";
import { LoadingState } from "@/components/ui/primitives";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Log in",
  "Log in to your Admitics account and pick up your education journey.",
  "/login",
  true,
);
export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <AuthPanel mode="login" />
    </Suspense>
  );
}
