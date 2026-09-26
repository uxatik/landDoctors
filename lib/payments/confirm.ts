import "server-only";
import { serviceClient } from "@/lib/supabase/server";
import { redactGateway, validatePayment, type SslcConfig } from "./sslcommerz";

export type ConfirmOutcome = "paid" | "already_paid" | "review" | "not_paid";

/**
 * Shared by the IPN (server-to-server) and the browser return. Both are untrusted input:
 * we only mark a case paid after SSLCommerz's own validation API confirms the val_id,
 * and the database checks the amount against the payment it created.
 */
export async function confirmPayment(cfg: SslcConfig, valId: string, tranId: string): Promise<ConfirmOutcome> {
  if (!valId || !tranId || tranId.length > 64) return "not_paid";
  const v = await validatePayment(cfg, valId, tranId);
  if (!v.ok) return v.reason === "risky" || v.reason === "network" ? "review" : "not_paid";

  const { data, error } = await serviceClient().rpc("mark_offer_paid", {
    p_tran_id: v.tranId, p_val_id: v.valId, p_amount: v.amount, p_raw: redactGateway(v.raw),
  });
  if (error) {
    console.error("mark_offer_paid failed", error.message);
    return "review";
  }
  return data === true ? "paid" : "already_paid";
}
