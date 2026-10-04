import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";

// Public pages are open to every crawler, including AI assistants' crawlers (a founder decision,
// see docs/decisions.md D18). Private and per-customer pages are kept out.
const PRIVATE = ["/admin", "/api/", "/offer/", "/pay/", "/help/thanks", "/en/offer/", "/en/pay/", "/en/help/thanks"];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: PRIVATE }],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
