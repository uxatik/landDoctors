import { describe, expect, it } from "vitest";
import { totp } from "../e2e/helpers/totp";

describe("totp test helper", () => {
  it("matches the RFC 6238 SHA-1 test vector", () => {
    // Secret "12345678901234567890" in base32, T = 59s → 94287082 (last 6 digits 287082).
    expect(totp("GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ", 59_000)).toBe("287082");
  });
});
