/**
 * The site used to live at land-doctors.vercel.app. Visitors and search engines that still use
 * that address are sent to the same page on the current address (SITE_URL), so search engines
 * see one site instead of two copies.
 */
export const OLD_HOSTS: readonly string[] = ["land-doctors.vercel.app"];

/** Returns the address to redirect to, or null when no redirect applies. */
export function oldHostRedirect(host: string | null, pathAndQuery: string, siteUrl: string | undefined): string | null {
  const from = (host ?? "").toLowerCase();
  if (!OLD_HOSTS.includes(from)) return null;
  let target: URL;
  try {
    target = new URL(siteUrl ?? "");
  } catch {
    return null;
  }
  // Only once SITE_URL points at the new, real address.
  if (target.protocol !== "https:" || target.host === from || OLD_HOSTS.includes(target.host)) return null;
  return new URL(pathAndQuery.startsWith("/") ? pathAndQuery : `/${pathAndQuery}`, target.origin).toString();
}
