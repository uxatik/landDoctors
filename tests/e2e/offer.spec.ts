import { test, expect } from "@playwright/test";

const HAS_DB = process.env.E2E_DB === "1";

test("unknown or malformed offer links are a 404 and never indexed", async ({ page }) => {
  let res = await page.goto("/offer/short");
  expect(res?.status()).toBe(404);
  res = await page.goto("/offer/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");
  expect(res?.status()).toBe(404);
});

test.describe("payment result pages", () => {
  for (const [status, text] of [
    ["success", "পেমেন্ট সফল হয়েছে"],
    ["fail", "পেমেন্ট হয়নি"],
    ["cancel", "পেমেন্ট বাতিল করেছেন"],
    ["review", "পেমেন্ট যাচাই হচ্ছে"],
    ["whatever", "পেমেন্ট শুরু করা যায়নি"],
  ] as const) {
    test(`${status}`, async ({ page }) => {
      await page.goto(`/pay/result?status=${status}&ref=LD-0042`);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(text);
    });
  }

  test("ignores a fake case number", async ({ page }) => {
    await page.goto("/pay/result?status=success&ref=<script>");
    await expect(page.getByText("<script>")).toHaveCount(0);
  });
});

test("payment start without a configured gateway goes to the error page", async ({ request }) => {
  const res = await request.post("/api/payments/init", { form: { token: "a".repeat(40), locale: "bn" }, maxRedirects: 0 });
  expect(res.status()).toBe(303);
  expect(res.headers()["location"]).toContain("/pay/result?status=error");
});

test("the IPN refuses to work when payments are switched off", async ({ request }) => {
  const res = await request.post("/api/payments/ipn", { form: { status: "VALID", tran_id: "LD-0001-x", val_id: "x" } });
  expect(res.status()).toBe(503);
});

test.describe("offer page with the database", () => {
  test.skip(!HAS_DB || !process.env.E2E_OFFER_TOKEN, "set E2E_DB=1 and E2E_OFFER_TOKEN (an open offer)");

  test("shows service price and government fees separately with a total", async ({ page }) => {
    await page.goto(`/offer/${process.env.E2E_OFFER_TOKEN}`);
    await expect(page.getByText("সেবার দাম")).toBeVisible();
    await expect(page.getByText(/সরকারি ফি/)).toBeVisible();
    await expect(page.getByTestId("offer-total")).toContainText("৳");
    await expect(page.getByText(/হাতে নগদ টাকা দেবেন না/)).toBeVisible();
  });
});
