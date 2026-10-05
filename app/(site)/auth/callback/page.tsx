import { AuthCallback } from "@/components/auth/auth-callback";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Completing sign-in",
  "Securely complete your Admitics sign-in.",
  "/auth/callback",
  true,
);
export default function CallbackPage() {
  return <AuthCallback />;
}
