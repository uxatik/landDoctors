import type { Metadata } from "next";
import { publicEnv } from "@/lib/env";

/** The one public address of the site, without a trailing slash (set by SITE_URL). */
export const SITE_URL = publicEnv.NEXT_PUBLIC_SITE_URL;

export type SiteLocale = "bn" | "en";
export const SITE_LOCALES: readonly SiteLocale[] = ["bn", "en"];

/** Path as visitors see it: Bangla has no prefix, English lives under /en. */
export function localePath(locale: string, path: string): string {
  const p = path === "/" ? "" : path;
  return locale === "en" ? `/en${p}` : p || "/";
}

export function absoluteUrl(locale: string, path: string, site: string = SITE_URL): string {
  const p = localePath(locale, path);
  return p === "/" ? site : `${site}${p}`;
}

type PageMeta = {
  locale: string;
  /** Path without the language prefix, e.g. "/help". */
  path: string;
  title: string;
  description: string;
  /** Use the title as it is, without " · LandDoctor" added. */
  absoluteTitle?: boolean;
  /** false keeps the page out of search results (drafts). */
  index?: boolean;
  /** Languages this page exists in. Defaults to both. */
  locales?: readonly SiteLocale[];
  siteName: string;
};

/**
 * Search and sharing tags for one public page: canonical address, the other language's address,
 * and the preview shown when the link is shared on Facebook or WhatsApp.
 */
export function pageMeta({ locale, path, title, description, absoluteTitle, index = true, locales = SITE_LOCALES, siteName }: PageMeta): Metadata {
  const url = absoluteUrl(locale, path);
  const languages: Record<string, string> = Object.fromEntries(locales.map((l) => [l, absoluteUrl(l, path)]));
  if (locales.includes("bn")) languages["x-default"] = absoluteUrl("bn", path);
  const image = { url: `/og-${locale === "en" ? "en" : "bn"}.png`, width: 1200, height: 630, alt: siteName };
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url, languages },
    openGraph: { type: "website", siteName, title, description, url, locale: locale === "en" ? "en_US" : "bn_BD", images: [image] },
    twitter: { card: "summary_large_image", title, description, images: [image.url] },
    ...(index ? {} : { robots: { index: false, follow: true } }),
  };
}
