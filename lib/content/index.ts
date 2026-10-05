import { examples } from "./examples";
import type { ContentCategory, ContentEntry } from "./types";

export interface ContentRepository {
  list(category: ContentCategory): Promise<ContentEntry[]>;
  get(category: ContentCategory, slug: string): Promise<ContentEntry | null>;
}
// Replace this repository when a content API contract is supplied. The page and
// card components receive the same domain types; no extra backend is introduced.
export const content: ContentRepository = {
  async list(category) {
    return examples.filter((item) => item.category === category);
  },
  async get(category, slug) {
    return (
      examples.find(
        (item) => item.category === category && item.slug === slug,
      ) ?? null
    );
  },
};
