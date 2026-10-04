import type { CategorySlug } from "../categories";

/** Shown in this order: paragraphs, steps, bullets, then `after` (closing remarks under a list). */
export type GuideSection = { heading: string; paragraphs?: string[]; steps?: string[]; bullets?: string[]; after?: string[] };
export type GuideDoc = { title: string; description: string; intro: string; sections: GuideSection[] };

export type Guide = {
  slug: string;
  /** The service this guide leads to. */
  service: CategorySlug;
  /** Date the facts were last checked against the sources (YYYY-MM-DD). */
  updated: string;
  /**
   * Who checked the guide. While this is null the guide is a DRAFT: it shows a draft banner,
   * is kept out of search results and the sitemap, and is not linked from the menus.
   * Fill it in only after a named land expert has read and corrected the guide.
   */
  review: { by: string; role: string; on: string } | null;
  /** Points the reviewer must confirm; shown on the draft page only. */
  reviewNotes: string[];
  sources: { label: string; url: string }[];
  bn: GuideDoc;
  /** English version, where one exists. */
  en?: GuideDoc;
};
