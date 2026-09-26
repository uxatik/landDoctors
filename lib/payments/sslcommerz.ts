import "server-only";
import { serverEnv } from "@/lib/env";

type Fetch = typeof fetch;

export type SslcConfig = { storeId: string; storePassword: string; sandbox: boolean };

export function sslcConfig(): SslcConfig | null {
  const env = serverEnv();
  if (env.PAYMENTS_ENABLED !== "true" || !env.SSLCOMMERZ_STORE_ID || !env.SSLCOMMERZ_STORE_PASSWORD) return null;
  return { storeId: env.SSLCOMMERZ_STORE_ID, storePassword: env.SSLCOMMERZ_STORE_PASSWORD, sandbox: env.SSLCOMMERZ_SANDBOX !== "false" };
}

function host(cfg: SslcConfig) {
  return cfg.sandbox ? "https://sandbox.sslcommerz.com" : "https://securepay.sslcommerz.com";
}

export type InitInput = {
  tranId: string; amount: number; caseRef: string; customerName: string; customerPhone: string;
  product: string; siteUrl: string; locale: string;
};

/** Opens an SSLCommerz checkout session and returns the page to send the customer to. */
export async function initSession(cfg: SslcConfig, input: InitInput, fetchImpl: Fetch = fetch): Promise<string> {
  const back = (result: string) => `${input.siteUrl}/api/payments/return?result=${result}&locale=${input.locale}`;
  const body = new URLSearchParams({
    store_id: cfg.storeId,
    store_passwd: cfg.storePassword,
    total_amount: input.amount.toFixed(2),
    currency: "BDT",
    tran_id: input.tranId,
    success_url: back("success"),
    fail_url: back("fail"),
    cancel_url: back("cancel"),
    ipn_url: `${input.siteUrl}/api/payments/ipn`,
    cus_name: input.customerName,
    // SSLCommerz requires an email; we don't collect one.
    cus_email: "customer@landdoctor.invalid",
    cus_add1: "Bangladesh",
    cus_city: "Dhaka",
    cus_country: "Bangladesh",
    cus_phone: input.customerPhone,
    shipping_method: "NO",
    num_of_item: "1",
    product_name: `${input.product} (${input.caseRef})`,
    product_category: "Service",
    product_profile: "non-physical-goods",
    value_a: input.caseRef,
  });
  const res = await fetchImpl(`${host(cfg)}/gwprocess/v4/api.php`, { method: "POST", body });
  const json = (await res.json()) as { status?: string; GatewayPageURL?: string; failedreason?: string };
  const gateway = json.GatewayPageURL ? new URL(json.GatewayPageURL) : null;
  // Only ever send customers to SSLCommerz itself.
  if (json.status !== "SUCCESS" || !gateway || gateway.protocol !== "https:" || !/(^|\.)sslcommerz\.com$/.test(gateway.hostname)) {
    throw new Error(`SSLCommerz init failed: ${json.failedreason ?? json.status ?? res.status}`);
  }
  return gateway.toString();
}

export type Validation =
  | { ok: true; tranId: string; valId: string; amount: number; raw: Record<string, string> }
  | { ok: false; reason: "not_valid" | "currency" | "amount_format" | "tran_mismatch" | "risky" | "network"; raw?: Record<string, string> };

/** Checks an SSLCommerz validation response. Pure: exported for tests. */
export function checkValidation(json: Record<string, string>, expectedTranId: string): Validation {
  if (json.status !== "VALID" && json.status !== "VALIDATED") return { ok: false, reason: "not_valid", raw: json };
  if (json.tran_id !== expectedTranId) return { ok: false, reason: "tran_mismatch", raw: json };
  if ((json.currency_type ?? json.currency) !== "BDT") return { ok: false, reason: "currency", raw: json };
  if (!/^\d+(\.00?)?$/.test(json.amount ?? "")) return { ok: false, reason: "amount_format", raw: json };
  if (json.risk_level === "1") return { ok: false, reason: "risky", raw: json };
  return { ok: true, tranId: json.tran_id, valId: json.val_id ?? "", amount: Math.round(Number(json.amount)), raw: json };
}

/** Asks SSLCommerz whether val_id is a real, completed payment for tranId. Never trusts the POST body. */
export async function validatePayment(cfg: SslcConfig, valId: string, tranId: string, fetchImpl: Fetch = fetch): Promise<Validation> {
  const url = new URL(`${host(cfg)}/validator/api/validationserverAPI.php`);
  url.search = new URLSearchParams({ val_id: valId, store_id: cfg.storeId, store_passwd: cfg.storePassword, format: "json", v: "1" }).toString();
  try {
    const res = await fetchImpl(url, { method: "GET", cache: "no-store" });
    const json = (await res.json()) as Record<string, string>;
    return checkValidation(json, tranId);
  } catch {
    return { ok: false, reason: "network" };
  }
}

/** Keeps only what we want to store from the gateway (no card data). */
export function redactGateway(raw: Record<string, string> | undefined): Record<string, string> {
  if (!raw) return {};
  const keep = ["status", "tran_id", "val_id", "amount", "currency", "currency_type", "bank_tran_id", "card_type", "tran_date", "risk_level", "risk_title"];
  return Object.fromEntries(Object.entries(raw).filter(([k]) => keep.includes(k)));
}
