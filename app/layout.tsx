import type { Metadata } from "next";
import "@fontsource-variable/dm-sans";
import { config } from "@/lib/config";
import { AuthProvider } from "@/components/auth/auth-provider";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(config.siteUrl),
  title: {
    default: "Admitics — Your next chapter, with clarity",
    template: "%s | Admitics",
  },
  description:
    "Navigate admissions, exams, colleges, courses and scholarships with a thoughtful AI education advisor.",
  openGraph: { siteName: "Admitics", type: "website", locale: "en_IN" },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full">
        <a className="skip-link" href="#main-content">
          Skip to content
        </a>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
