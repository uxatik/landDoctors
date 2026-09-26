import { test, expect } from "@playwright/test";

const PAGES = [
  ["terms", "সেবার শর্তাবলি", "Terms of service"],
  ["refund", "রিফান্ড নীতি", "Refund policy"],
  ["privacy", "গোপনীয়তা নীতি", "Privacy policy"],
  ["disclaimer", "পরামর্শ ও রিপোর্ট সংক্রান্ত সতর্কতা", "Advice and report disclaimer"],
] as const;

for (const [slug, bn, en] of PAGES) {
  test(`${slug} exists in both languages with the draft banner`, async ({ page }) => {
    await page.goto(`/legal/${slug}`);
    await expect(page.getByRole("heading", { level: 1, name: bn })).toBeVisible();
    await expect(page.getByText("খসড়া – আইনজীবীর পর্যালোচনা প্রয়োজন")).toBeVisible();
    await page.goto(`/en/legal/${slug}`);
    await expect(page.getByRole("heading", { level: 1, name: en })).toBeVisible();
    await expect(page.getByText("DRAFT – needs lawyer review")).toBeVisible();
  });
}

test("footer links to all four pages", async ({ page }) => {
  await page.goto("/");
  for (const [slug] of PAGES) {
    await expect(page.locator(`footer a[href="/legal/${slug}"]`)).toHaveCount(1);
  }
});

test("privacy page says documents are not stored", async ({ page }) => {
  await page.goto("/en/legal/privacy");
  await expect(page.getByText(/do not store photos of your documents/)).toBeVisible();
  await expect(page.getByText(/Your name and mobile number/)).toBeVisible();
});

test("unknown legal page is a 404", async ({ page }) => {
  const res = await page.goto("/legal/nothing");
  expect(res?.status()).toBe(404);
});
