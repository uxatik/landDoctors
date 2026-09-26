import { describe, expect, it } from "vitest";
import { formatPhoneDisplay, normalisePhone, toWhatsAppNumber } from "@/lib/phone";
import { toEnglishDigits } from "@/lib/digits";

describe("toEnglishDigits", () => {
  it("converts Bangla digits and leaves everything else", () => {
    expect(toEnglishDigits("০১৭১২-৩৪৫৬৭৮")).toBe("01712-345678");
    expect(toEnglishDigits("৳৮,০০০ abc")).toBe("৳8,000 abc");
  });
});

describe("normalisePhone", () => {
  it.each([
    "01712345678",
    "01712-345678",
    "+8801712345678",
    "8801712345678",
    "০১৭১২৩৪৫৬৭৮",
    "+880 1712 345678",
    "(017) 1234-5678",
  ])("normalises %s", (input) => {
    expect(normalisePhone(input)).toBe("+8801712345678");
  });

  it.each(["029876543", "০১২৩", "01212345678", "0171234567", "017123456789", "", "abc"])(
    "rejects %s",
    (input) => {
      expect(normalisePhone(input)).toBeNull();
    },
  );
});

describe("display helpers", () => {
  it("shows a local-style number", () => {
    expect(formatPhoneDisplay("+8801711000001")).toBe("01711-000001");
  });
  it("gives the digits WhatsApp links expect", () => {
    expect(toWhatsAppNumber("+8801711000002")).toBe("8801711000002");
  });
});
