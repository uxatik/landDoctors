import { describe, expect, it } from "vitest";
import bn from "@/messages/bn.json";
import en from "@/messages/en.json";

function keys(obj: unknown, prefix = ""): string[] {
  if (Array.isArray(obj)) return [`${prefix}[${obj.length}]`];
  if (obj && typeof obj === "object") {
    return Object.entries(obj).flatMap(([k, v]) => keys(v, prefix ? `${prefix}.${k}` : k));
  }
  return [prefix];
}

describe("translations", () => {
  it("Bangla and English have exactly the same keys (and list lengths)", () => {
    expect(keys(bn).sort()).toEqual(keys(en).sort());
  });

  it("no Bangla string is left empty or in English by mistake", () => {
    const leaves = (o: unknown): string[] =>
      Array.isArray(o) ? o.flatMap(leaves) : o && typeof o === "object" ? Object.values(o).flatMap(leaves) : typeof o === "string" ? [o] : []; // numbers and flags (package prices) are not text
    // The language switch is written in the language it switches to.
    const allowedLatin = new Set(["English", "WhatsApp", "Switch to English"]);
    const suspicious = leaves(bn).filter((s) => s.trim() === "" || (!/[ঀ-৿]/.test(s) && !allowedLatin.has(s)));
    expect(suspicious).toEqual([]);
  });
});
