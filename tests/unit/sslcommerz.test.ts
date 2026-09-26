import { describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
import valid from "../fixtures/sslcommerz/valid.json";
import initOk from "../fixtures/sslcommerz/init-success.json";
import { checkValidation, initSession, redactGateway, validatePayment, type SslcConfig } from "@/lib/payments/sslcommerz";

const cfg: SslcConfig = { storeId: "test", storePassword: "secret", sandbox: true };
const TRAN = "LD-0001-abc123";

describe("checkValidation", () => {
  it("accepts VALID and VALIDATED payments that match", () => {
    expect(checkValidation(valid, TRAN)).toMatchObject({ ok: true, amount: 1240, tranId: TRAN });
    expect(checkValidation({ ...valid, status: "VALIDATED" }, TRAN).ok).toBe(true);
  });

  it.each([
    [{ status: "FAILED" }, "not_valid"],
    [{ status: "INVALID_TRANSACTION" }, "not_valid"],
    [{ status: "CANCELLED" }, "not_valid"],
    [{ tran_id: "LD-0002-zzz" }, "tran_mismatch"],
    [{ currency_type: "USD", currency: "USD" }, "currency"],
    [{ amount: "1240.50" }, "amount_format"],
    [{ amount: "abc" }, "amount_format"],
    [{ risk_level: "1" }, "risky"],
  ])("rejects %j as %s", (patch, reason) => {
    expect(checkValidation({ ...valid, ...patch } as Record<string, string>, TRAN)).toMatchObject({ ok: false, reason });
  });
});

describe("validatePayment", () => {
  it("asks the sandbox validator with the val_id and never trusts the POST body", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(valid)));
    const r = await validatePayment(cfg, "260926182011abcDEF", TRAN, fetchImpl as unknown as typeof fetch);
    expect(r.ok).toBe(true);
    const url = String((fetchImpl.mock.calls[0] as unknown[])[0]);
    expect(url).toContain("https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php");
    expect(url).toContain("val_id=260926182011abcDEF");
  });

  it("treats a network error as not paid", async () => {
    const fetchImpl = vi.fn(async () => { throw new Error("offline"); });
    expect(await validatePayment(cfg, "x", TRAN, fetchImpl as unknown as typeof fetch)).toEqual({ ok: false, reason: "network" });
  });
});

describe("initSession", () => {
  it("sends the amount from the server with two decimals and returns the gateway URL", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify(initOk)));
    const url = await initSession(cfg, {
      tranId: TRAN, amount: 1240, caseRef: "LD-0001", customerName: "Nasrin", customerPhone: "+8801712345678",
      product: "Land health report", siteUrl: "https://landdoctor.example", locale: "bn",
    }, fetchImpl as unknown as typeof fetch);
    expect(url).toBe(initOk.GatewayPageURL);
    const body = (fetchImpl.mock.calls[0] as unknown[])[1] as { body: URLSearchParams };
    expect(body.body.get("total_amount")).toBe("1240.00");
    expect(body.body.get("currency")).toBe("BDT");
    expect(body.body.get("ipn_url")).toBe("https://landdoctor.example/api/payments/ipn");
  });

  it("throws when the gateway refuses", async () => {
    const fetchImpl = vi.fn(async () => new Response(JSON.stringify({ status: "FAILED", failedreason: "Store Credential Error" })));
    await expect(initSession(cfg, {
      tranId: TRAN, amount: 1, caseRef: "LD-0001", customerName: "N", customerPhone: "+8801712345678",
      product: "x", siteUrl: "https://x.example", locale: "bn",
    }, fetchImpl as unknown as typeof fetch)).rejects.toThrow("Store Credential Error");
  });
});

it("stores only non-sensitive gateway fields", () => {
  expect(redactGateway({ ...valid, card_no: "4111", card_issuer: "X" } as Record<string, string>)).not.toHaveProperty("card_no");
});
