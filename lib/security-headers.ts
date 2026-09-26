/** Security headers for every response. Kept in one place so tests can check them. */
export function securityHeaders(supabaseUrl?: string, dev = process.env.NODE_ENV === "development") {
  const supabase = supabaseUrl ? new URL(supabaseUrl).origin : "";
  const csp = [
    "default-src 'self'",
    // Next.js needs inline bootstrap scripts; there is no user-supplied HTML anywhere on the site.
    // 'unsafe-eval' only in `npm run dev`: Next's development tools need it; production never gets it.
    `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""} https://www.googletagmanager.com https://www.clarity.ms https://scripts.clarity.ms`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https://www.google-analytics.com https://*.clarity.ms https://c.bing.com",
    "font-src 'self'",
    `connect-src 'self' ${supabase} https://www.google-analytics.com https://*.google-analytics.com https://*.clarity.ms${dev ? " ws: wss:" : ""}`.replace(/\s+/g, " "),
    // Payment start posts to our server, which redirects to SSLCommerz.
    "form-action 'self' https://sandbox.sslcommerz.com https://securepay.sslcommerz.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "object-src 'none'",
  ].join("; ");

  return [
    { key: "Content-Security-Policy", value: csp },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(self)" },
    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
  ];
}
