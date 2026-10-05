import type { Metadata } from "next";
import { config } from "@/lib/config";

export function pageMetadata(
  title: string,
  description: string,
  path: string,
  privatePage = false,
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} | Admitics`,
      description,
      url: `${config.siteUrl}${path}`,
      siteName: "Admitics",
      type: "website",
    },
    ...(privatePage ? { robots: { index: false, follow: false } } : {}),
  };
}
