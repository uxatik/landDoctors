import { describe, expect, it } from "vitest";
import { securityHeaders } from "@/lib/security-headers";

const csp = (dev: boolean) => securityHeaders("https://x.supabase.co", dev).find((h) => h.key === "Content-Security-Policy")!.value;

describe("CSP", () => {
  it("lets `npm run dev` run its development scripts", () => {
    expect(csp(true)).toContain("'unsafe-eval'");
  });
  it("never allows eval in production", () => {
    expect(csp(false)).not.toContain("unsafe-eval");
    expect(csp(false)).not.toContain("ws:");
  });
  it("allows the Supabase project", () => {
    expect(csp(false)).toContain("connect-src 'self' https://x.supabase.co");
  });
});
