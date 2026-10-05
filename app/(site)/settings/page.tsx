import { SettingsView } from "@/components/account/settings-view";
import { pageMetadata } from "@/lib/metadata";
export const metadata = pageMetadata(
  "Account settings",
  "Manage your Admitics profile, session and usage.",
  "/settings",
  true,
);
export default function SettingsPage() {
  return <SettingsView />;
}
