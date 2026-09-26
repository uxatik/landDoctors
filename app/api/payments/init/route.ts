import { NextResponse, type NextRequest } from "next/server";
import { publicEnv } from "@/lib/env";
import { initSession, sslcConfig } from "@/lib/payments/sslcommerz";
import { serviceClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function resultUrl(locale: string, status: string) {
  const prefix = locale === "en" ? "/en" : "";
  return new URL(`${prefix}/pay/result?status=${status}`, publicEnv.NEXT_PUBLIC_SITE_URL);
}

export async function POST(request: NextRequest) {
  const form = await request.formData();
  const token = String(form.get("token") ?? "");
  const locale = form.get("locale") === "en" ? "en" : "bn";
  const cfg = sslcConfig();
  if (!cfg || !/^[A-Za-z0-9_-]{32,64}$/.test(token)) return NextResponse.redirect(resultUrl(locale, "error"), 303);

  const { data, error } = await serviceClient()
    .rpc("begin_online_payment", { p_token: token })
    .single<{ tran_id: string; amount: number; case_ref: string; customer_name: string; customer_phone: string; product: string }>();
  if (error || !data) return NextResponse.redirect(resultUrl(locale, "error"), 303);

  try {
    const gateway = await initSession(cfg, {
      tranId: data.tran_id, amount: data.amount, caseRef: data.case_ref, customerName: data.customer_name,
      customerPhone: data.customer_phone, product: data.product, siteUrl: publicEnv.NEXT_PUBLIC_SITE_URL, locale,
    });
    return NextResponse.redirect(gateway, 303);
  } catch (e) {
    console.error("payment init failed", (e as Error).message);
    return NextResponse.redirect(resultUrl(locale, "error"), 303);
  }
}
