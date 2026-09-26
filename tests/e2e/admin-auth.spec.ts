import { test, expect } from "@playwright/test";
import { totp } from "./helpers/totp";

const HAS_DB = process.env.E2E_DB === "1";

test.describe("Staff area without a database connection", () => {
  test.skip(HAS_DB, "only when Supabase is not configured");

  test("staff pages send people to the login page with a clear message", async ({ page }) => {
    await page.goto("/admin/cases");
    await expect(page).toHaveURL(/\/admin\/login\?error=not_configured$/);
    await expect(page.locator("#login-error")).toContainText("Database not connected");
  });

  test("staff pages are never indexed or cached", async ({ request }) => {
    const res = await request.get("/admin/login");
    expect(res.headers()["x-robots-tag"]).toContain("noindex");
    expect(res.headers()["cache-control"]).toContain("no-store");
  });
});

test.describe("Staff sign-in with Supabase", () => {
  test.skip(!HAS_DB || !process.env.E2E_OPS_EMAIL, "set E2E_DB=1 and E2E_OPS_* in .env.local");

  test("anonymous visitors are sent to login", async ({ page }) => {
    await page.goto("/admin/cases");
    await expect(page).toHaveURL(/\/admin\/login$/);
  });

  test("password alone is not enough; the code unlocks the case list", async ({ page }) => {
    await page.goto("/admin/login");
    await page.fill('input[name="email"]', process.env.E2E_OPS_EMAIL!);
    await page.fill('input[name="password"]', process.env.E2E_OPS_PASSWORD!);
    await page.getByRole("button", { name: /Sign in/ }).click();
    await expect(page).toHaveURL(/\/admin\/mfa$/);
    await page.goto("/admin/cases");
    await expect(page).toHaveURL(/\/admin\/mfa$/);
    await page.goto("/admin/mfa");
    await page.fill('input[name="code"]', totp(process.env.E2E_OPS_TOTP_SECRET!));
    await page.getByRole("button", { name: /Verify/ }).click();
    await expect(page).toHaveURL(/\/admin\/cases$/);
    await expect(page.getByRole("link", { name: /Packages/ })).toHaveCount(0);
  });
});
