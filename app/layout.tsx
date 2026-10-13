import type { Metadata } from "next";
import "@fontsource-variable/dm-sans";
import { config } from "@/lib/config";
import { AuthProvider } from "@/components/auth/auth-provider";
import { LocaleProvider } from "@/lib/i18n";
import { SkipLink } from "@/components/navigation/skip-link";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(config.siteUrl),
  title: {
    default: "Admitics — Every education opportunity starts with a question",
    template: "%s | Admitics",
  },
  description:
    "Explore education pathways, admissions, scholarships and practical next steps with Admitics.",
  openGraph: { siteName: "Admitics", type: "website", locale: "en_IN" },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <LocaleProvider>
          <SkipLink />
          <AuthProvider>{children}</AuthProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
