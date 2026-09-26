import { NextResponse, type NextRequest } from "next/server";
import { confirmPayment } from "@/lib/payments/confirm";
import { sslcConfig } from "@/lib/payments/sslcommerz";
import { serviceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** Server-to-server notification from SSLCommerz. The body is not trusted; see confirmPayment. */
export async function POST(request: NextRequest) {
  const cfg = sslcConfig();
  if (!cfg) return NextResponse.json({ ok: false }, { status: 503 });
  const form = await request.formData();
  const status = String(form.get("status") ?? "");
  const tranId = String(form.get("tran_id") ?? "");
  const valId = String(form.get("val_id") ?? "");

  if (status === "VALID" || status === "VALIDATED") {
    const outcome = await confirmPayment(cfg, valId, tranId);
    return NextResponse.json({ ok: outcome !== "not_paid", outcome });
  }
  if (tranId && ["FAILED", "CANCELLED", "UNATTEMPTED", "EXPIRED"].includes(status)) {
    await serviceClient().rpc("mark_payment_failed", { p_tran_id: tranId, p_status: status });
  }
  return NextResponse.json({ ok: true });
}
