/**
 * Stops a production deploy (Vercel VERCEL_ENV=production) that is missing real settings,
 * so the live site can never show the placeholder hotline or run without a database.
 * Phone numbers are built into the pages at build time, so this must run at build.
 */
export function assertProductionEnv(env: NodeJS.ProcessEnv = process.env): void {
  if (env.VERCEL_ENV !== "production") return;
  const missing: string[] = [];
  const phone = /^\+8801[3-9]\d{8}$/;
  // The hotline is shown only when incoming calls are switched on, so it is required only then.
  const phones = env.NEXT_PUBLIC_CALLS_ENABLED === "true" ? ["NEXT_PUBLIC_HOTLINE", "NEXT_PUBLIC_WHATSAPP"] : ["NEXT_PUBLIC_WHATSAPP"];
  for (const k of phones) {
    const v = env[k] ?? "";
    if (!phone.test(v) || v === "+8801700000000") missing.push(k);
  }
  for (const k of ["NEXT_PUBLIC_SITE_URL", "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "IP_HASH_SALT"]) {
    if (!env[k]) missing.push(k);
  }
  if (missing.length) throw new Error(`Production build is missing real values for: ${missing.map((k) => k.replace(/^NEXT_PUBLIC_/, "")).join(", ")} (with or without the NEXT_PUBLIC_ prefix)`);
}

/**
 * Settings can be given without the NEXT_PUBLIC_ prefix (HOTLINE, SITE_URL, SUPABASE_URL …).
 * Vercel warns about NEXT_PUBLIC_ names, and its Supabase integration uses SUPABASE_URL and
 * SUPABASE_ANON_KEY, so accept those names and map them onto the NEXT_PUBLIC_ names the code uses.
 * Only values that are public by nature are mapped (phone numbers, site address, the Supabase URL,
 * the anon key and analytics IDs). The service-role key and the salt are never given a public name.
 */
const PUBLIC_ALIASES: Record<string, string[]> = {
  NEXT_PUBLIC_SITE_URL: ["NEXT_PUBLIC_SITE_URL", "SITE_URL"],
  NEXT_PUBLIC_HOTLINE: ["NEXT_PUBLIC_HOTLINE", "HOTLINE"],
  NEXT_PUBLIC_WHATSAPP: ["NEXT_PUBLIC_WHATSAPP", "WHATSAPP"],
  NEXT_PUBLIC_CALLS_ENABLED: ["NEXT_PUBLIC_CALLS_ENABLED", "CALLS_ENABLED"],
  NEXT_PUBLIC_SUPABASE_URL: ["NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL"],
  NEXT_PUBLIC_SUPABASE_ANON_KEY: ["NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_ANON_KEY", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "SUPABASE_PUBLISHABLE_KEY"],
  NEXT_PUBLIC_GA_ID: ["NEXT_PUBLIC_GA_ID", "GA_ID"],
  NEXT_PUBLIC_CLARITY_ID: ["NEXT_PUBLIC_CLARITY_ID", "CLARITY_ID"],
};

export function publicAliases(env: NodeJS.ProcessEnv = process.env): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [target, names] of Object.entries(PUBLIC_ALIASES)) {
    const v = names.map((k) => env[k]).find((x) => typeof x === "string" && x !== "");
    if (v) out[target] = v;
  }
  return out;
}

/** @deprecated kept for older imports; use publicAliases. */
export const supabasePublicAliases = publicAliases;
