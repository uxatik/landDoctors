import { NextResponse, type NextRequest } from "next/server";
import { publicEnv } from "@/lib/env";
import { confirmPayment } from "@/lib/payments/confirm";
import { sslcConfig } from "@/lib/payments/sslcommerz";
import { serviceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** The customer's browser comes back here from SSLCommerz (POST). */
export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const result = url.searchParams.get("result");
  const locale = url.searchParams.get("locale") === "en" ? "en" : "bn";
  const prefix = locale === "en" ? "/en" : "";
  const go = (status: string, ref?: string) =>
    NextResponse.redirect(
      new URL(`${prefix}/pay/result?status=${status}${ref ? `&ref=${encodeURIComponent(ref)}` : ""}`, publicEnv.NEXT_PUBLIC_SITE_URL),
      303,
    );

  const cfg = sslcConfig();
  if (!cfg) return go("error");
  const form = await request.formData();
  const tranId = String(form.get("tran_id") ?? "");
  const valId = String(form.get("val_id") ?? "");
  const ref = /^(LD-\d{4,})-/.exec(tranId)?.[1];

  if (result === "success") {
    const outcome = await confirmPayment(cfg, valId, tranId);
    if (outcome === "paid" || outcome === "already_paid") return go("success", ref);
    return go(outcome === "review" ? "review" : "fail", ref);
  }
  if (tranId) await serviceClient().rpc("mark_payment_failed", { p_tran_id: tranId, p_status: result ?? "unknown" });
  return go(result === "cancel" ? "cancel" : "fail", ref);
}
