import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const CATEGORIES = ["pre_purchase_check", "mutation", "survey", "inheritance", "record_correction", "dispute"];

test.describe("Home (Bangla)", () => {
  test("leads with the promise and lists six categories", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: /জমির ঝামেলায় দালাল নয়,\s*পাশে আছেন অভিজ্ঞ সার্ভেয়ার/ })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "কোন কাজে সাহায্য লাগবে?" })).toBeVisible();
    for (const c of CATEGORIES) {
      await expect(page.locator(`#services a[href="/help?category=${c}"]`)).toHaveCount(1);
    }
    await page.locator('#services a[href="/help?category=mutation"]').click();
    await expect(page).toHaveURL(/\/help\?category=mutation$/);
  });

  test("shows call and WhatsApp with the number as text", async ({ page }) => {
    await page.goto("/");
    const call = page.locator("#services").getByRole("link", { name: /কল করুন/ });
    await expect(call).toHaveAttribute("href", "tel:+8801711000001");
    await expect(page.getByText("01711-000001").first()).toBeVisible();
    const wa = page.locator("#services").getByRole("link", { name: "WhatsApp", exact: true });
    await expect(wa).toHaveAttribute("href", /^https:\/\/wa\.me\/8801711000002\?text=/);
  });

  test("says where field work is available and that first call is free", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("সাভার ও গাজীপুরে এখন সেবা চালু").first()).toBeVisible();
    await expect(page.getByText(/প্রথম ১০ মিনিটের কথা ফ্রি/).first()).toBeVisible();
    await expect(page.getByText(/হাতে হাতে টাকা নয়/).first()).toBeVisible();
  });

  test("shows prices up front with government fees separate", async ({ page }) => {
    await page.goto("/");
    const pricing = page.locator("#pricing");
    await expect(pricing.getByText("৳1,000").first()).toBeVisible();
    await expect(pricing.getByText("৳6,000").first()).toBeVisible();
    await expect(pricing.getByText("৳8,000").first()).toBeVisible();
    await expect(pricing.getByText(/সরকারি ফি আলাদা/).first()).toBeVisible();
  });

  test("answers common questions and publishes them for search engines", async ({ page }) => {
    await page.goto("/");
    const q = page.locator("#faq summary").filter({ hasText: "ল্যান্ডডক্টর কি সরকারি অফিস?" });
    await q.click();
    await expect(page.getByText(/বেসরকারি সেবা/)).toBeVisible();
    const ld = await page.locator('script[type="application/ld+json"]').textContent();
    expect(JSON.parse(ld ?? "{}")["@type"]).toBe("FAQPage");
  });

  test("has no serious accessibility problems and no sideways scroll", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page }).analyze();
    const serious = results.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
    expect(serious.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
    // Compare with the configured viewport: phone emulation widens innerWidth to fit wide content.
    const overflow = (await page.evaluate(() => document.documentElement.scrollWidth)) - page.viewportSize()!.width;
    expect(overflow).toBeLessThanOrEqual(0);
  });
});

test.describe("Home (English)", () => {
  test("mirrors the Bangla page", async ({ page }) => {
    await page.goto("/en");
    await expect(page.getByRole("heading", { level: 1, name: /Verified land experts\.\s*Not middlemen\./ })).toBeVisible();
    for (const c of CATEGORIES) {
      await expect(page.locator(`#services a[href="/en/help?category=${c}"]`)).toHaveCount(1);
    }
    await expect(page.getByText("Now serving Savar and Gazipur").first()).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
  });
});
