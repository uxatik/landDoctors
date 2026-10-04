import type { MetadataRoute } from "next";
import { guideLocales, PUBLISHED_GUIDES } from "@/lib/content/guides";
import { SERVICE_SLUGS } from "@/lib/content/services";
import { absoluteUrl, SITE_LOCALES, type SiteLocale } from "@/lib/seo";

/**
 * Public, finished pages only. Left out on purpose: draft legal pages, guides that no expert has
 * reviewed yet, and everything private (offers, payment results, thank-you, admin).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const pages: { path: string; locales: readonly SiteLocale[]; priority: number }[] = [
    { path: "/", locales: SITE_LOCALES, priority: 1 },
    { path: "/help", locales: SITE_LOCALES, priority: 0.8 },
    { path: "/abroad", locales: SITE_LOCALES, priority: 0.7 },
    ...SERVICE_SLUGS.map((slug) => ({ path: `/services/${slug}`, locales: SITE_LOCALES, priority: 0.9 })),
    ...(PUBLISHED_GUIDES.length > 0 ? [{ path: "/guides", locales: SITE_LOCALES, priority: 0.6 }] : []),
    ...PUBLISHED_GUIDES.map((g) => ({ path: `/guides/${g.slug}`, locales: guideLocales(g), priority: 0.6 })),
  ];

  return pages.flatMap(({ path, locales, priority }) =>
    locales.map((locale) => ({
      url: absoluteUrl(locale, path),
      changeFrequency: "weekly" as const,
      priority,
      alternates: { languages: Object.fromEntries(locales.map((l) => [l, absoluteUrl(l, path)])) },
    })),
  );
}
