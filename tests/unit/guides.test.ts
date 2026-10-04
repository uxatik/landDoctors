import { describe, expect, it } from "vitest";
import { GUIDES, guideDoc, guideLocales, isPublished, PUBLISHED_GUIDES } from "@/lib/content/guides";
import { CATEGORY_SLUGS } from "@/lib/content/categories";
import { categoryFromServiceSlug, getServiceDoc, SERVICE_SLUG, SERVICE_SLUGS } from "@/lib/content/services";

describe("guides", () => {
  it("has ten guides with unique, address-safe slugs", () => {
    expect(GUIDES).toHaveLength(10);
    const slugs = GUIDES.map((g) => g.slug);
    expect(new Set(slugs).size).toBe(10);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9-]+$/);
  });

  it("every guide has Bangla text, sources and a title in Bangla", () => {
    for (const g of GUIDES) {
      expect(g.bn.title).toMatch(/[ঀ-৿]/);
      expect(g.bn.sections.length).toBeGreaterThanOrEqual(3);
      expect(g.sources.length).toBeGreaterThanOrEqual(2);
      for (const s of g.sources) expect(s.url).toMatch(/^https?:\/\//);
      expect(CATEGORY_SLUGS).toContain(g.service);
    }
  });

  it("an unreviewed guide is never public, and must say what the reviewer has to confirm", () => {
    for (const g of GUIDES) {
      if (g.review === null) {
        expect(isPublished(g)).toBe(false);
        expect(g.reviewNotes.length).toBeGreaterThan(0);
      } else {
        expect(g.review.by.trim()).not.toBe("");
        expect(g.review.on).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
    expect(PUBLISHED_GUIDES.every(isPublished)).toBe(true);
  });

  it("only advertises English where the guide is written in English", () => {
    for (const g of GUIDES) {
      expect(guideLocales(g).includes("en")).toBe(Boolean(g.en));
      expect(guideDoc(g, "bn")).toBe(g.bn);
      expect(guideDoc(g, "en")).toBe(g.en);
    }
  });

  it("never promises faster government work", () => {
    const text = JSON.stringify(GUIDES);
    expect(text).not.toMatch(/দ্রুত করিয়ে|দ্রুত করে দি|ঘুষ ছাড়া করিয়ে/);
  });
});

describe("service pages", () => {
  it("has one page per category in both languages", () => {
    expect(SERVICE_SLUGS).toHaveLength(CATEGORY_SLUGS.length);
    expect(new Set(SERVICE_SLUGS).size).toBe(CATEGORY_SLUGS.length);
    for (const c of CATEGORY_SLUGS) {
      expect(categoryFromServiceSlug(SERVICE_SLUG[c])).toBe(c);
      for (const l of ["bn", "en"]) {
        const d = getServiceDoc(l, c);
        expect(d.title.length).toBeGreaterThan(3);
        expect(d.includes.length).toBeGreaterThanOrEqual(3);
        expect(d.description.length).toBeLessThanOrEqual(170);
      }
      expect(getServiceDoc("bn", c).title).toMatch(/[ঀ-৿]/);
    }
    expect(categoryFromServiceSlug("nothing")).toBeNull();
  });

  it("uses the same prices as the home page", () => {
    expect(getServiceDoc("en", "survey").price).toContain("৳6,000");
    expect(getServiceDoc("en", "pre_purchase_check").price).toContain("৳8,000");
    expect(getServiceDoc("bn", "mutation").price).toContain("৳1,000");
  });
});
