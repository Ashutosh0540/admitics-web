import { Suspense } from "react";
import { AuthPanel } from "@/components/auth/auth-panel";
import { LoadingState } from "@/components/ui/primitives";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Reset your password",
  "Recover access to your Admitics account.",
  "/forgot-password",
  true,
);
export default function ForgotPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <AuthPanel mode="forgot" />
    </Suspense>
  );
}
