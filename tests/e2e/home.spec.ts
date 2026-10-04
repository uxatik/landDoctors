import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const CATEGORIES = ["pre_purchase_check", "mutation", "survey", "inheritance", "record_correction", "dispute"];

test.describe("Home (Bangla)", () => {
  test("leads with the promise and lists six categories", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1, name: /জমির সমস্যায়\s*যাচাইকৃত ভূমি বিশেষজ্ঞ/ })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "কোন সেবাটি প্রয়োজন?" })).toBeVisible();
    for (const c of CATEGORIES) {
      await expect(page.locator(`#services a[href="/help?category=${c}"]`)).toHaveCount(1);
    }
    await page.locator('#services a[href="/help?category=mutation"]').click();
    await expect(page).toHaveURL(/\/help\?category=mutation$/);
  });

  test("offers WhatsApp, and no phone number while incoming calls are off", async ({ page }) => {
    await page.goto("/");
    // Nobody answers the phone yet (CALLS_ENABLED is off), so the site must not invite calls.
    await expect(page.locator('a[href^="tel:"]')).toHaveCount(0);
    await expect(page.getByText("01711-000001")).toHaveCount(0);
    await expect(page.getByText(/কল করুন|হটলাইন/)).toHaveCount(0);
    const wa = page.locator("#services").getByRole("link", { name: "WhatsApp", exact: true });
    await expect(wa).toHaveAttribute("href", /^https:\/\/wa\.me\/8801711000002\?text=/);
  });

  test("says where field work is available and that first call is free", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("বর্তমানে সাভার ও গাজীপুরে সেবা চালু").first()).toBeVisible();
    await expect(page.getByText(/প্রথম ১০ মিনিটের পরামর্শ বিনামূল্যে/).first()).toBeVisible();
    await expect(page.getByText(/নগদ লেনদেন নেই/).first()).toBeVisible();
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
    await expect(page.getByText(/বেসরকারি পরামর্শ সেবা/)).toBeVisible();
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    expect(blocks.map((b) => JSON.parse(b)["@type"])).toContain("FAQPage");
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
    await expect(page.getByRole("heading", { level: 1, name: /Verified land experts\s*for every land matter/ })).toBeVisible();
    for (const c of CATEGORIES) {
      await expect(page.locator(`#services a[href="/en/help?category=${c}"]`)).toHaveCount(1);
    }
    await expect(page.getByText("Now serving Savar and Gazipur").first()).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
  });
});

test.describe("Thank-you page", () => {
  test("WhatsApp button carries the case number", async ({ page }) => {
    await page.goto("/help/thanks?ref=LD-0042");
    const wa = page.getByRole("link", { name: "WhatsApp", exact: true });
    const href = (await wa.getAttribute("href")) ?? "";
    expect(decodeURIComponent(href)).toContain("আমার কেস নম্বর LD-0042");
  });
  test("ignores a made-up case number", async ({ page }) => {
    await page.goto("/help/thanks?ref=<script>");
    const href = (await page.locator("main").getByRole("link", { name: "WhatsApp", exact: true }).getAttribute("href")) ?? "";
    expect(decodeURIComponent(href)).not.toContain("script");
  });
});

test.describe("Floating WhatsApp button", () => {
  const float = "[data-wa-float]";

  test("stays in the corner and never covers the phone action bar or the footer text", async ({ page }) => {
    await page.goto("/");
    const wa = page.locator(float);
    await expect(wa).toBeVisible();
    await expect(wa).toHaveAttribute("href", /^https:\/\/wa\.me\/8801711000002\?text=/);
    await expect(wa).toBeInViewport({ ratio: 1 });

    const bar = page.locator("[data-mobile-bar]");
    if (await bar.isVisible()) {
      const [f, b] = [await wa.boundingBox(), await bar.boundingBox()];
      expect(f!.y + f!.height).toBeLessThanOrEqual(b!.y);
    }

    // At the very end of the page the button sits in empty footer space.
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const overlap = await page.evaluate((sel) => {
      const f = document.querySelector(sel)!.getBoundingClientRect();
      const range = document.createRange();
      range.selectNodeContents(document.querySelector("[data-footer-end]")!);
      const t = range.getBoundingClientRect();
      return !(f.right <= t.left || f.left >= t.right || f.bottom <= t.top || f.top >= t.bottom);
    }, float);
    expect(overlap).toBe(false);
  });

  test("stays off the form on phones, where it would cover the fields", async ({ page }) => {
    await page.goto("/help");
    const phone = page.viewportSize()!.width < 640;
    await expect(page.locator(float)).toBeVisible({ visible: !phone });
  });

  test("greets in English on the English site", async ({ page }) => {
    await page.goto("/en");
    const href = (await page.locator(float).getAttribute("href")) ?? "";
    expect(decodeURIComponent(href)).toMatch(/\?text=[A-Za-z]/);
  });

  test("hides where the page has its own case-number WhatsApp button", async ({ page }) => {
    await page.goto("/help/thanks?ref=LD-0042");
    await expect(page.locator(float)).toBeHidden();
    await expect(page.getByRole("link", { name: "WhatsApp", exact: true })).toHaveCount(1);
  });
});
