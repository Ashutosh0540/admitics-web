import { Suspense } from "react";
import { AuthPanel } from "@/components/auth/auth-panel";
import { LoadingState } from "@/components/ui/primitives";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Choose a new password",
  "Set a new password with your Supabase recovery session.",
  "/reset-password",
  true,
);
export default function ResetPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <AuthPanel mode="reset" />
    </Suspense>
  );
}
