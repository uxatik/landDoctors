import { describe, expect, it } from "vitest";
import { absoluteUrl, localePath, pageMeta } from "@/lib/seo";
import { oldHostRedirect } from "@/lib/canonical-host";

describe("localePath", () => {
  it("keeps Bangla at the root and English under /en", () => {
    expect(localePath("bn", "/")).toBe("/");
    expect(localePath("en", "/")).toBe("/en");
    expect(localePath("bn", "/help")).toBe("/help");
    expect(localePath("en", "/help")).toBe("/en/help");
  });
  it("builds full addresses without a doubled slash", () => {
    expect(absoluteUrl("bn", "/", "https://x.test")).toBe("https://x.test");
    expect(absoluteUrl("en", "/services/namjari", "https://x.test")).toBe("https://x.test/en/services/namjari");
  });
});

describe("pageMeta", () => {
  const base = { path: "/help", title: "T", description: "D", siteName: "LandDoctor" };
  it("points each language at itself and names the other one", () => {
    const m = pageMeta({ ...base, locale: "en" });
    expect(String(m.alternates?.canonical)).toMatch(/\/en\/help$/);
    const langs = m.alternates?.languages as Record<string, string>;
    expect(langs.bn).toMatch(/\/help$/);
    expect(langs.en).toMatch(/\/en\/help$/);
    expect(langs["x-default"]).toBe(langs.bn);
  });
  it("does not advertise a language the page does not exist in", () => {
    const langs = pageMeta({ ...base, locale: "bn", locales: ["bn"] }).alternates?.languages as Record<string, string>;
    expect(Object.keys(langs).sort()).toEqual(["bn", "x-default"]);
  });
  it("keeps drafts out of search", () => {
    expect(pageMeta({ ...base, locale: "bn", index: false }).robots).toEqual({ index: false, follow: true });
    expect(pageMeta({ ...base, locale: "bn" }).robots).toBeUndefined();
  });
  it("uses the share image for the page's language", () => {
    const og = pageMeta({ ...base, locale: "en" }).openGraph as { images: { url: string }[] };
    expect(og.images[0]?.url).toBe("/og-en.png");
  });
});

describe("oldHostRedirect", () => {
  const site = "https://landdoctorbd.com";
  it("sends the old address to the same page on the new one", () =>
    expect(oldHostRedirect("land-doctors.vercel.app", "/en/help?category=survey", site)).toBe("https://landdoctorbd.com/en/help?category=survey"));
  it("leaves the new address, previews and local runs alone", () => {
    expect(oldHostRedirect("landdoctorbd.com", "/", site)).toBeNull();
    expect(oldHostRedirect("landdoctors-git-main-x.vercel.app", "/", site)).toBeNull();
    expect(oldHostRedirect("localhost:3000", "/", site)).toBeNull();
  });
  it("does nothing until SITE_URL is the new address", () => {
    expect(oldHostRedirect("land-doctors.vercel.app", "/", "https://land-doctors.vercel.app")).toBeNull();
    expect(oldHostRedirect("land-doctors.vercel.app", "/", "http://localhost:3000")).toBeNull();
    expect(oldHostRedirect("land-doctors.vercel.app", "/", undefined)).toBeNull();
  });
});
