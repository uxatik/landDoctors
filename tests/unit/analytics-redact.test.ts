import { describe, expect, it } from "vitest";
import { redactUrl } from "@/lib/analytics-redact";

describe("redactUrl", () => {
  it("hides offer tokens", () => {
    expect(redactUrl("https://landdoctorbd.com/offer/abc123XYZ")).toBe("https://landdoctorbd.com/offer/[token]");
    expect(redactUrl("https://landdoctorbd.com/en/offer/abc123?paid=1")).toBe("https://landdoctorbd.com/en/offer/[token]");
  });
  it("drops query strings and hashes", () => {
    expect(redactUrl("https://landdoctorbd.com/help?ref=fb#form")).toBe("https://landdoctorbd.com/help");
  });
  it("keeps normal pages unchanged", () => {
    expect(redactUrl("https://landdoctorbd.com/services/namjari")).toBe("https://landdoctorbd.com/services/namjari");
  });
  it("handles relative paths", () => {
    expect(redactUrl("/offer/tok?x=1")).toBe("/offer/[token]");
  });
});
