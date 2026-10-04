import { describe, expect, it } from "vitest";
import { WA_TEMPLATE_LABEL, waLink, waTemplate, type WaTemplateKey } from "@/lib/admin/wa-templates";

const c = { ref: "LD-0042", customer_name: "নাসরিন আক্তার" };

describe("staff WhatsApp messages", () => {
  it("puts the real case number in every message", () => {
    for (const key of Object.keys(WA_TEMPLATE_LABEL) as WaTemplateKey[]) {
      expect(waTemplate(key, c)).toContain("LD-0042");
      expect(waTemplate(key, c)).not.toContain("LD-0000");
    }
  });
  it("greets the customer by name when the case is received", () => {
    expect(waTemplate("received", c)).toContain("নাসরিন আক্তার");
  });
  it("builds a wa.me link to the customer's number with the text encoded", () => {
    const url = waLink("+8801712345678", waTemplate("docs", c));
    expect(url.startsWith("https://wa.me/8801712345678?text=")).toBe(true);
    expect(decodeURIComponent(url.split("?text=")[1] ?? "")).toBe(waTemplate("docs", c));
    expect(url).not.toContain(" ");
  });
});
