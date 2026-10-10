/**
 * Removes private parts of a page address before it is sent to analytics.
 * - Offer links carry a secret token: /offer/abc123 → /offer/[token]
 * - Query strings and hashes can carry payment or case details, so they are dropped.
 */
export function redactUrl(url: string): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return (url.split(/[?#]/)[0] ?? "").replace(/\/offer\/[^/]+/, "/offer/[token]");
  }
  const path = parsed.pathname.replace(/\/offer\/[^/]+/, "/offer/[token]");
  return `${parsed.origin}${path}`;
}
