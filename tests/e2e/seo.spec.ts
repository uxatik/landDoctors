import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const SITE = "https://landdoctor.test";
const SERVICES = ["land-check", "namjari", "land-survey", "inheritance", "khatian-correction", "land-dispute"];

test.describe("What search engines are told", () => {
  test("robots.txt opens public pages, closes private ones and names the sitemap", async ({ request }) => {
    const res = await request.get("/robots.txt");
    expect(res.status()).toBe(200);
    const body = await res.text();
    expect(body).toMatch(/User-Agent: \*/i);
    expect(body).toContain("Allow: /");
    for (const p of ["/admin", "/api/", "/offer/", "/pay/", "/help/thanks"]) expect(body).toContain(`Disallow: ${p}`);
    expect(body).toContain(`Sitemap: ${SITE}/sitemap.xml`);
  });

  test("sitemap lists home, form, services and the abroad page in both languages, and no drafts", async ({ request }) => {
    const body = await (await request.get("/sitemap.xml")).text();
    for (const u of [`${SITE}<`, `${SITE}/en<`, `${SITE}/help<`, `${SITE}/abroad<`, `${SITE}/en/abroad<`]) expect(body).toContain(`<loc>${u}`);
    for (const s of SERVICES) {
      expect(body).toContain(`<loc>${SITE}/services/${s}</loc>`);
      expect(body).toContain(`<loc>${SITE}/en/services/${s}</loc>`);
    }
    expect(body).not.toContain("/legal/");
    expect(body).not.toContain("/guides");
    expect(body).not.toContain("/offer");
  });

  test("home page declares its address, the other language, a description and a share image", async ({ page, request }) => {
    await page.goto("/");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", SITE);
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveAttribute("href", `${SITE}/en`);
    await expect(page.locator('link[rel="alternate"][hreflang="bn"]')).toHaveAttribute("href", SITE);
    const desc = await page.locator('meta[name="description"]').getAttribute("content");
    expect(desc!.length).toBeGreaterThan(80);
    await expect(page).toHaveTitle(/সাভার ও গাজীপুরে যাচাইকৃত ভূমি বিশেষজ্ঞ/);
    const og = await page.locator('meta[property="og:image"]').getAttribute("content");
    expect(og).toBe(`${SITE}/og-bn.png`);
    const img = await request.get("/og-bn.png");
    expect(img.status()).toBe(200);
    expect(img.headers()["content-type"]).toContain("image/png");
    await page.goto("/en");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${SITE}/en`);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", `${SITE}/og-en.png`);
  });

  test("home page states the business facts for machines", async ({ page }) => {
    await page.goto("/");
    const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const business = blocks.map((b) => JSON.parse(b)).find((b) => b["@type"] === "ProfessionalService");
    expect(business.name).toBe("LandDoctor");
    expect(business.areaServed.map((a: { name: string }) => a.name)).toEqual(["Savar", "Gazipur"]);
    expect(business.contactPoint.url).toBe("https://wa.me/8801711000002");
    expect(business.makesOffer).toHaveLength(3);
    expect(business.makesOffer[0].price).toBe(1000);
    expect(business.makesOffer[2].priceSpecification.minPrice).toBe(8000);
    expect(JSON.stringify(business)).not.toContain("telephone");
  });

  test("browser icon and llms.txt exist", async ({ request, page }) => {
    expect((await request.get("/favicon.ico")).status()).toBe(200);
    await page.goto("/");
    expect(await page.locator('link[rel="icon"]').count()).toBeGreaterThan(0);
    const llms = await request.get("/llms.txt");
    expect(llms.status()).toBe(200);
    const text = await llms.text();
    expect(text).toContain("# LandDoctor");
    expect(text).toContain("+8801711000002");
    expect(text).toContain("Land survey: from BDT 6,000");
    expect(text).toContain(`${SITE}/en/services/namjari`);
    expect(text).not.toMatch(/hotline|call us/i);
  });

  test("draft legal pages are kept out of search", async ({ page }) => {
    await page.goto("/legal/terms");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${SITE}/legal/terms`);
  });

  test("the old vercel.app address goes to the same page on the new address", async ({ request }) => {
    const res = await request.get("/en/help?category=survey", { headers: { host: "land-doctors.vercel.app" }, maxRedirects: 0 });
    expect(res.status()).toBe(308);
    expect(res.headers()["location"]).toBe(`${SITE}/en/help?category=survey`);
  });
});

test.describe("Service pages", () => {
  for (const slug of SERVICES) {
    test(`${slug} has price, time, area and a way to ask, in both languages`, async ({ page }) => {
      await page.goto(`/services/${slug}`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      for (const label of ["মূল্য", "সময়", "এলাকা"]) await expect(page.locator("dl").getByText(label, { exact: true })).toBeVisible();
      await expect(page.getByRole("link", { name: /এই সেবার জন্য জানান/ })).toHaveAttribute("href", /\/help\?category=/);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", `${SITE}/services/${slug}`);
      await expect(page.getByText("সরকারি কাজ দ্রুত করানোর কোনো প্রতিশ্রুতি দেওয়া হয় না।")).toBeVisible();
      await expect(page.locator("main").getByText("খতিয়ান / পর্চা", { exact: true })).toBeVisible();
      await expect(page.locator("main")).not.toContainText("help.");
      await page.goto(`/en/services/${slug}`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.getByRole("link", { name: /Ask about this service/ })).toBeVisible();
    });
  }

  test("the survey page shows the same price as the home page and passes the accessibility check", async ({ page }) => {
    await page.goto("/services/land-survey");
    await expect(page.locator("dl")).toContainText("৳6,000 থেকে");
    await expect(page.locator("dl")).toContainText("সাভার ও গাজীপুর");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
  });

  test("the footer links to every service page, and an unknown one is a 404", async ({ page }) => {
    await page.goto("/");
    for (const slug of SERVICES) await expect(page.locator(`footer a[href="/services/${slug}"]`)).toHaveCount(1);
    expect((await page.goto("/services/nothing"))?.status()).toBe(404);
  });
});

test.describe("Page for Bangladeshis abroad", () => {
  test("explains the service in English and Bangla with a WhatsApp button", async ({ page }) => {
    await page.goto("/en/abroad");
    await expect(page.getByRole("heading", { level: 1, name: "Land help for Bangladeshis living abroad" })).toBeVisible();
    const wa = page.locator("main").getByRole("link", { name: "WhatsApp", exact: true });
    expect(decodeURIComponent((await wa.getAttribute("href")) ?? "")).toContain("writing from abroad");
    await expect(page.getByText(/We currently take payment by bKash/)).toBeVisible();
    await expect(page.locator("[data-wa-float]")).toBeHidden();
    await page.goto("/abroad");
    await expect(page.getByRole("heading", { level: 1, name: "প্রবাসী বাংলাদেশিদের জন্য জমির সেবা" })).toBeVisible();
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
  });

  test("is linked from the home page", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('main a[href="/abroad"]')).toHaveCount(1);
  });
});

test.describe("Guides", () => {
  test("a draft guide shows the draft banner, the reviewer's checklist and stays out of search", async ({ page }) => {
    await page.goto("/guides/namjari-documents-cost-time");
    await expect(page.getByRole("heading", { level: 1, name: /নামজারি করতে কী কী কাগজ লাগে/ })).toBeVisible();
    await expect(page.getByText("খসড়া – বিশেষজ্ঞের পর্যালোচনা বাকি")).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
    await page.getByText("পর্যালোচকের জন্য: যা নিশ্চিত করতে হবে").click();
    await expect(page.getByText(/নিষ্পত্তির সময়সীমা/)).toBeVisible();
    await expect(page.getByRole("heading", { name: "তথ্যসূত্র" })).toBeVisible();
    await expect(page.locator("main").getByRole("link", { name: /সমস্যা জানান/ })).toHaveAttribute("href", "/help?category=mutation");
    await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.filter((v) => v.impact === "serious" || v.impact === "critical")).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(page.viewportSize()!.width);
  });

  test("the list shows all ten in Bangla, marked as drafts, and is itself out of search", async ({ page }) => {
    await page.goto("/guides");
    await expect(page.locator('main a[href^="/guides/"]')).toHaveCount(10);
    await expect(page.getByText("খসড়া", { exact: true })).toHaveCount(10);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("English has only the guide written in English; a Bangla-only guide sends English readers to the list", async ({ page }) => {
    await page.goto("/en/guides");
    await expect(page.locator('main a[href^="/en/guides/"]')).toHaveCount(1);
    await page.goto("/en/guides/check-land-from-abroad");
    await expect(page.getByRole("heading", { level: 1, name: "How to check land in Bangladesh from abroad" })).toBeVisible();
    await expect(page.locator('link[rel="alternate"][hreflang="bn"]')).toHaveAttribute("href", `${SITE}/guides/check-land-from-abroad`);
    await page.goto("/en/guides/khatian-correction");
    await expect(page).toHaveURL(/\/en\/guides$/);
    await page.goto("/guides/khatian-correction");
    await expect(page.locator('link[rel="alternate"][hreflang="en"]')).toHaveCount(0);
  });

  test("drafts are not linked from the footer, and an unknown guide is a 404", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('footer a[href="/guides"]')).toHaveCount(0);
    expect((await page.goto("/guides/nothing"))?.status()).toBe(404);
  });
});
