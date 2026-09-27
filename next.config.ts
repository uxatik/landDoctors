import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { securityHeaders } from "./lib/security-headers";
import { assertProductionEnv, supabasePublicAliases } from "./lib/env-check";

// Accept the names Vercel's Supabase integration uses (SUPABASE_URL, SUPABASE_ANON_KEY).
const supabasePublic = supabasePublicAliases();
Object.assign(process.env, supabasePublic);
assertProductionEnv();

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Built into the pages, so server code, middleware and the browser all see the same values.
  env: supabasePublic,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders(process.env.NEXT_PUBLIC_SUPABASE_URL || undefined) }];
  },
};

export default withNextIntl(nextConfig);
