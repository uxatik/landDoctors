import { GUIDES_1 } from "./part1";
import { GUIDES_2 } from "./part2";
import type { Guide, GuideDoc } from "./types";

export type { Guide, GuideDoc, GuideSection } from "./types";

export const GUIDES: readonly Guide[] = [...GUIDES_1, ...GUIDES_2];

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find((g) => g.slug === slug);
}

/** The guide's text in this language, or undefined when it has not been written in it. */
export function guideDoc(guide: Guide, locale: string): GuideDoc | undefined {
  return locale === "en" ? guide.en : guide.bn;
}

export function guideLocales(guide: Guide): ("bn" | "en")[] {
  return guide.en ? ["bn", "en"] : ["bn"];
}

/** Reviewed by a named expert: only these are public (search, sitemap, menus). */
export function isPublished(guide: Guide): boolean {
  return guide.review !== null;
}

export const PUBLISHED_GUIDES: readonly Guide[] = GUIDES.filter(isPublished);
