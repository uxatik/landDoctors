import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { securityHeaders } from "./lib/security-headers";
import { assertProductionEnv, publicAliases } from "./lib/env-check";

// Accept settings with or without the NEXT_PUBLIC_ prefix (HOTLINE, SITE_URL, SUPABASE_URL …).
const publicSettings = publicAliases();
Object.assign(process.env, publicSettings);
assertProductionEnv();

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Built into the pages, so server code, middleware and the browser all see the same values.
  env: publicSettings,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders(process.env.NEXT_PUBLIC_SUPABASE_URL || undefined) }];
  },
};

export default withNextIntl(nextConfig);
