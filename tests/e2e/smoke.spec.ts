import { test, expect } from "@playwright/test";

test("Bangla is the default language at /", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "bn");
  await expect(page.getByRole("link", { name: "ল্যান্ডডক্টর" })).toBeVisible();
});

test("English lives at /en", async ({ page }) => {
  await page.goto("/en");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("link", { name: "LandDoctor" })).toBeVisible();
});

test("language toggle switches both ways", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Switch to English" }).click();
  await expect(page).toHaveURL(/\/en$/);
  await page.getByRole("link", { name: "বাংলায় দেখুন" }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "bn");
});

test("no horizontal scroll", async ({ page }) => {
  await page.goto("/");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});
