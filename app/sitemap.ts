import type { MetadataRoute } from "next";
import { config } from "@/lib/config";
import { examples } from "@/lib/content/examples";
import { demoExams } from "@/lib/exams/mock-data";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    "",
    "/admissions",
    "/exams",
    "/colleges",
    "/courses",
    "/scholarships",
    "/about",
    "/contact",
    "/privacy",
    "/terms",
    "/disclaimer",
    ...examples
      .filter((item) => item.category !== "exams")
      .map((item) => `/${item.category}/${item.slug}`),
    ...demoExams.map((exam) => `/exams/${exam.slug}`),
  ].map((path) => ({
    url: `${config.siteUrl}${path}`,
    changeFrequency: "weekly",
    priority: path === "" ? 1 : 0.6,
  }));
}
