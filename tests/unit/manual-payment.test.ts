import { describe, expect, it } from "vitest";
import { manualPayment, trxMessageLink } from "@/lib/payments/manual";

const WA = "+8801711000002";

describe("manualPayment", () => {
  it("uses the WhatsApp number as the bKash number until one is set", () =>
    expect(manualPayment({}, WA)).toEqual({ number: WA, display: "01711-000002", type: "personal" }));

  it("uses BKASH_NUMBER and BKASH_ACCOUNT_TYPE when they are set", () =>
    expect(manualPayment({ BKASH_NUMBER: "+8801811000003", BKASH_ACCOUNT_TYPE: "merchant" }, WA)).toEqual({
      number: "+8801811000003", display: "01811-000003", type: "merchant",
    }));

  it("accepts the number in everyday formats", () =>
    expect(manualPayment({ BKASH_NUMBER: "01811-000003" }, WA).number).toBe("+8801811000003"));

  it("refuses a number that is not a Bangladeshi mobile, so customers never see a wrong one", () =>
    expect(() => manualPayment({ BKASH_NUMBER: "12345" }, WA)).toThrow("BKASH_NUMBER"));

  it("treats an unknown account type as personal", () =>
    expect(manualPayment({ BKASH_ACCOUNT_TYPE: "agent" }, WA).type).toBe("personal"));
});

describe("trxMessageLink", () => {
  it("opens WhatsApp with the case number and room for the transaction ID", () => {
    const href = trxMessageLink(WA, "কেস LD-0042-এর পেমেন্ট করেছি। TrxID: ");
    expect(href.startsWith("https://wa.me/8801711000002?text=")).toBe(true);
    expect(decodeURIComponent(href)).toContain("LD-0042");
  });
});
