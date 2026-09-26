import { test, expect } from "@playwright/test";

test("every page sends security headers", async ({ request }) => {
  for (const path of ["/", "/en/help", "/admin/login"]) {
    const h = (await request.get(path)).headers();
    expect(h["content-security-policy"], path).toContain("frame-ancestors 'none'");
    expect(h["content-security-policy"], path).toContain("form-action 'self' https://sandbox.sslcommerz.com");
    expect(h["x-content-type-options"], path).toBe("nosniff");
    expect(h["referrer-policy"], path).toBe("strict-origin-when-cross-origin");
    expect(h["permissions-policy"], path).toContain("camera=()");
    expect(h["x-powered-by"], path).toBeUndefined();
  }
});

test("no analytics scripts load when IDs are not set", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('script[src*="googletagmanager"]')).toHaveCount(0);
  await expect(page.locator("script#clarity")).toHaveCount(0);
});

test("the page loads without CSP errors", async ({ page }) => {
  const errors: string[] = [];
  page.on("console", (m) => { if (m.type() === "error" && /Content Security Policy/i.test(m.text())) errors.push(m.text()); });
  await page.goto("/help");
  await page.locator("#area-other").check();
  expect(errors).toEqual([]);
});
