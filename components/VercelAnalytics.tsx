"use client";

import { Analytics } from "@vercel/analytics/next";
import { redactUrl } from "@/lib/analytics-redact";

/** Vercel Web Analytics: cookie-free page views, served from our own domain. Private tokens are removed first. */
export function VercelAnalytics() {
  return <Analytics beforeSend={(event) => ({ ...event, url: redactUrl(event.url) })} />;
}
