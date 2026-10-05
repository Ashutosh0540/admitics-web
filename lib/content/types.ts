export type ContentCategory = "exams" | "colleges" | "courses" | "scholarships";
export interface ContentEntry {
  slug: string;
  category: ContentCategory;
  title: string;
  subtitle: string;
  summary: string;
  tag: string;
  facts: { label: string; value: string }[];
  overview: string;
  checkpoints: string[];
  source: { title: string; url: string };
}
export const categoryDetails = {
  exams: {
    label: "Exams",
    eyebrow: "UNDERSTAND YOUR WAY IN",
    title: "The right exam. A clearer plan.",
    description:
      "Explore entrance pathways, understand what each exam is for, and know which details to check before applying.",
  },
  colleges: {
    label: "Colleges",
    eyebrow: "FIND YOUR PLACE",
    title: "A campus for your next chapter.",
    description:
      "Look beyond the name. Explore institutions, consider what matters to you, and build a thoughtful shortlist.",
  },
  courses: {
    label: "Courses",
    eyebrow: "FOLLOW YOUR CURIOSITY",
    title: "Turn an interest into a direction.",
    description:
      "Explore what you could study, how it connects to your interests, and what to ask before choosing a program.",
  },
  scholarships: {
    label: "Scholarships",
    eyebrow: "MAKE ROOM FOR AMBITION",
    title: "More possibility. More support.",
    description:
      "Start exploring financial support, understand different schemes, and confirm the criteria that matter for your application.",
  },
} satisfies Record<
  ContentCategory,
  { label: string; eyebrow: string; title: string; description: string }
>;
export function isCategory(value: string): value is ContentCategory {
  return Object.hasOwn(categoryDetails, value);
}
