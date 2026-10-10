import type { MetadataRoute } from "next";
import { config } from "@/lib/config";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/chat",
          "/dashboard",
          "/documents",
          "/settings",
          "/login",
          "/signup",
          "/forgot-password",
          "/reset-password",
          "/auth/",
        ],
      },
    ],
    sitemap: `${config.siteUrl}/sitemap.xml`,
  };
}
