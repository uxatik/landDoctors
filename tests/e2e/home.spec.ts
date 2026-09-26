import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const CATEGORIES = ["pre_purchase_check", "mutation", "survey", "inheritance", "record_correction", "dispute"];

test.describe("Home (Bangla)", () => {
  test("asks about the land problem and lists six categories", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: "আপনার জমির সমস্যা কী?" })).toBeVisible();
    for (const c of CATEGORIES) {
      await expect(page.locator(`a[href="/help?category=${c}"]`)).toHaveCount(1);
    }
    await page.locator('a[href="/help?category=mutation"]').click();
    await expect(page).toHaveURL(/\/help\?category=mutation$/);
  });

  test("shows call and WhatsApp with the number as text", async ({ page }) => {
    await page.goto("/");
    const call = page.getByRole("link", { name: /কল করুন/ });
    await expect(call).toHaveAttribute("href", "tel:+8801711000001");
    await expect(page.getByText("01711-000001").first()).toBeVisible();
    const wa = page.getByRole("link", { name: "WhatsApp" });
    await expect(wa).toHaveAttribute("href", /^https:\/\/wa\.me\/8801711000002\?text=/);
  });

  test("says where field work is available and that first call is free", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("এখন সেবা দিচ্ছি: সাভার ও গাজীপুর")).toBeVisible();
    await expect(page.getByText(/প্রথম ১০ মিনিটের কল ফ্রি/)).toBeVisible();
    await expect(page.getByText(/নগদ টাকা/)).toBeVisible();
  });

  test("has no serious accessibility problems and no sideways scroll", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("Home (English)", () => {
  test("mirrors the Bangla page", async ({ page }) => {
    await page.goto("/en");
    await expect(page.getByRole("heading", { level: 1, name: "What is your land problem?" })).toBeVisible();
    for (const c of CATEGORIES) {
      await expect(page.locator(`a[href="/en/help?category=${c}"]`)).toHaveCount(1);
    }
    await expect(page.getByText("Now serving Savar and Gazipur")).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
  });
});
