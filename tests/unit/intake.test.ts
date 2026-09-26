import { describe, expect, it } from "vitest";
import { parseIntake } from "@/lib/validation/intake";

function form(overrides: Record<string, string | string[]> = {}): FormData {
  const base: Record<string, string | string[]> = {
    category: "mutation",
    area: "savar",
    upazila: "Savar",
    district: "",
    mouza: "",
    documents: ["deed", "khatian"],
    description: "নামজারি আবেদন বাতিল হয়েছে",
    name: "Nasrin Akter",
    phone: "01712-345678",
    contact_pref: "call",
    website: "",
    idempotency_key: "11111111-1111-4111-8111-111111111111",
  };
  const fd = new FormData();
  for (const [k, v] of Object.entries({ ...base, ...overrides })) {
    if (Array.isArray(v)) v.forEach((x) => fd.append(k, x));
    else fd.set(k, v);
  }
  return fd;
}

describe("parseIntake", () => {
  it("accepts a valid form and normalises the phone", () => {
    const r = parseIntake(form());
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.phone).toBe("+8801712345678");
      expect(r.data.documents).toEqual(["deed", "khatian"]);
      expect(r.data.district).toBeNull();
    }
  });

  it("accepts Bangla digits in the phone", () => {
    const r = parseIntake(form({ phone: "০১৭১২৩৪৫৬৭৮" }));
    expect(r.ok && r.data.phone).toBe("+8801712345678");
  });

  it.each([
    [{ category: "" }, "category", "required"],
    [{ category: "passport" }, "category", "required"],
    [{ area: "" }, "area", "required"],
    [{ upazila: "" }, "upazila", "required"],
    [{ phone: "" }, "phone", "required"],
    [{ phone: "029876543" }, "phone", "invalid"],
    [{ name: "" }, "name", "required"],
    [{ description: "x".repeat(1001) }, "description", "too_long"],
    [{ contact_pref: "" }, "contact_pref", "required"],
    [{ area: "other", district: "" }, "district", "required"],
    [{ documents: ["passport"] }, "documents", "invalid"],
  ])("rejects %j with %s:%s", (overrides, field, code) => {
    const r = parseIntake(form(overrides as Record<string, string>));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.errors[field as keyof typeof r.errors]).toBe(code);
  });

  it("treats a filled honeypot as spam", () => {
    const r = parseIntake(form({ website: "http://spam.example" }));
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.spam).toBe(true);
  });

  it("keeps the district only for areas outside the pilot", () => {
    const inPilot = parseIntake(form({ district: "Cumilla" }));
    expect(inPilot.ok && inPilot.data.district).toBeNull();
    const outside = parseIntake(form({ area: "other", district: "Cumilla", upazila: "Sadar" }));
    expect(outside.ok && outside.data.district).toBe("Cumilla");
  });

  it("returns the typed values so the form can be refilled", () => {
    const r = parseIntake(form({ phone: "bad" }));
    expect(!r.ok && r.values.name).toBe("Nasrin Akter");
  });
});
