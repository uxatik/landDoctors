/**
 * Stops a production deploy (Vercel VERCEL_ENV=production) that is missing real settings,
 * so the live site can never show the placeholder hotline or run without a database.
 * Phone numbers are built into the pages at build time, so this must run at build.
 */
export function assertProductionEnv(env: NodeJS.ProcessEnv = process.env): void {
  if (env.VERCEL_ENV !== "production") return;
  const missing: string[] = [];
  const phone = /^\+8801[3-9]\d{8}$/;
  for (const k of ["NEXT_PUBLIC_HOTLINE", "NEXT_PUBLIC_WHATSAPP"]) {
    const v = env[k] ?? "";
    if (!phone.test(v) || v === "+8801700000000") missing.push(k);
  }
  for (const k of ["NEXT_PUBLIC_SITE_URL", "NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_SERVICE_ROLE_KEY", "IP_HASH_SALT"]) {
    if (!env[k]) missing.push(k);
  }
  if (missing.length) throw new Error(`Production build is missing real values for: ${missing.join(", ")}`);
}

/**
 * Vercel's Supabase integration adds SUPABASE_URL and SUPABASE_ANON_KEY (no NEXT_PUBLIC_ prefix).
 * Accept those names too, so the founder doesn't have to enter the same values twice.
 * Only the URL and the anon (publishable) key are copied: both are meant to be public.
 * The service-role key is never given a public name.
 */
export function supabasePublicAliases(env: NodeJS.ProcessEnv = process.env): Record<string, string> {
  const pick = (...keys: string[]) => keys.map((k) => env[k]).find((v) => typeof v === "string" && v !== "");
  const out: Record<string, string> = {};
  const url = pick("NEXT_PUBLIC_SUPABASE_URL", "SUPABASE_URL");
  const anon = pick("NEXT_PUBLIC_SUPABASE_ANON_KEY", "SUPABASE_ANON_KEY", "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "SUPABASE_PUBLISHABLE_KEY");
  if (url) out.NEXT_PUBLIC_SUPABASE_URL = url;
  if (anon) out.NEXT_PUBLIC_SUPABASE_ANON_KEY = anon;
  return out;
}
