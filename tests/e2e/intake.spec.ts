import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const HAS_DB = process.env.E2E_DB === "1";

async function fillValid(page: Page, overrides: { area?: string; category?: string } = {}) {
  await page.locator(`#category-${overrides.category ?? "mutation"}`).check();
  await page.locator(`#area-${overrides.area ?? "savar"}`).check();
  await page.fill("#upazila", "সাভার");
  await page.locator("#doc-deed").check();
  await page.fill("#name", "নাসরিন আক্তার");
  await page.fill("#phone", "০১৭১২-৩৪৫৬৭৮");
}

test.describe("Intake form", () => {
  test("empty submit lists every missing field in Bangla and moves focus to the list", async ({ page }) => {
    await page.goto("/help");
    await page.getByRole("button", { name: "পাঠান" }).click();
    const summary = page.locator("#form-errors");
    await expect(summary).toBeVisible();
    await expect(summary).toBeFocused();
    await expect(summary).toContainText("সমস্যার ধরন বেছে নিন");
    await expect(summary).toContainText("জমিটা কোথায়, বেছে নিন");
    await expect(summary).toContainText("মোবাইল নম্বর লিখুন");
    await expect(page.locator("#phone")).toHaveAttribute("aria-invalid", "true");
  });

  test("keeps what was typed after an error", async ({ page }) => {
    await page.goto("/help");
    await page.fill("#name", "Nasrin Akter");
    await page.fill("#phone", "029876543");
    await page.getByRole("button", { name: "পাঠান" }).click();
    await expect(page.locator("#form-errors")).toContainText("সঠিক মোবাইল নম্বর লিখুন");
    await expect(page.locator("#name")).toHaveValue("Nasrin Akter");
    await expect(page.locator("#phone")).toHaveValue("029876543");
  });

  test("pre-selects the category from the home page link", async ({ page }) => {
    await page.goto("/help?category=survey");
    await expect(page.locator("#category-survey")).toBeChecked();
  });

  test("explains field work limits when the land is outside the pilot", async ({ page }) => {
    await page.goto("/help?category=survey");
    await expect(page.locator("#district")).toBeHidden();
    await page.locator("#area-other").check();
    await expect(page.locator("#district")).toBeVisible();
    await expect(page.getByRole("note")).toContainText("শুধু সাভার ও গাজীপুরে");
    await page.locator("#category-mutation").check();
    await expect(page.getByRole("note")).toBeHidden();
  });

  test("has no serious accessibility problems (also with errors showing)", async ({ page }) => {
    await page.goto("/help");
    let results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? ""))).toEqual([]);
    await page.getByRole("button", { name: "পাঠান" }).click();
    await expect(page.locator("#form-errors")).toBeVisible();
    results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((v) => ["serious", "critical"].includes(v.impact ?? ""))).toEqual([]);
  });

  test("English form works the same way", async ({ page }) => {
    await page.goto("/en/help");
    await page.getByRole("button", { name: "Send" }).click();
    await expect(page.locator("#form-errors")).toContainText("Enter your mobile number");
  });

  test("points people to WhatsApp when the service is not connected", async ({ page }) => {
    test.skip(HAS_DB, "only meaningful without a database");
    await page.goto("/help");
    await fillValid(page);
    await page.getByRole("button", { name: "পাঠান" }).click();
    await expect(page.locator("#form-errors")).toContainText("WhatsApp-এ লিখুন");
  });
});

test.describe("Intake form without JavaScript", () => {
  test.use({ javaScriptEnabled: false });

  test("shows server-side errors", async ({ page }) => {
    await page.goto("/help");
    await page.getByRole("button", { name: "পাঠান" }).click();
    await expect(page.locator("#form-errors")).toContainText("মোবাইল নম্বর লিখুন");
  });

  test("still reveals the district field for other areas", async ({ page }) => {
    await page.goto("/help");
    await page.locator("#area-other").check();
    await expect(page.locator("#district")).toBeVisible();
  });
});

test.describe("Intake form with the database", () => {
  test.skip(!HAS_DB, "set E2E_DB=1 with Supabase keys in .env.local");

  test("creates a case and shows its number", async ({ page }) => {
    await page.goto("/help");
    await fillValid(page);
    await page.getByRole("button", { name: "পাঠান" }).dblclick();
    await expect(page).toHaveURL(/\/help\/thanks\?ref=LD-\d{4,}$/);
    await expect(page.getByText(/^LD-\d{4,}$/)).toBeVisible();
  });

  test("sends field work outside the pilot to the waiting list", async ({ page }) => {
    await page.goto("/help");
    await fillValid(page, { category: "survey", area: "other" });
    await page.fill("#district", "কুমিল্লা");
    await page.getByRole("button", { name: "পাঠান" }).click();
    await expect(page).toHaveURL(/\/help\/thanks\?waitlist=1$/);
  });
});
