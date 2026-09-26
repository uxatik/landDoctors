"use server";

import { redirect } from "next/navigation";
import { staffClient, supabaseConfigured } from "@/lib/supabase/server";

export type LoginState = { error?: string };

export async function signIn(_prev: LoginState, formData: FormData): Promise<LoginState> {
  if (!supabaseConfigured()) return { error: "not_configured" };
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "invalid" };

  const supabase = await staffClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.status === 400 ? "invalid" : "unknown" };
  redirect("/admin/mfa");
}

export type MfaState = { error?: string; factorId?: string; qr?: string; secret?: string };

/** Creates a new TOTP factor (removing any half-finished one) and returns its QR code. */
export async function startEnrol(): Promise<MfaState> {
  const supabase = await staffClient();
  const { data: factors } = await supabase.auth.mfa.listFactors();
  for (const f of factors?.all ?? []) {
    if (f.factor_type === "totp" && f.status !== "verified") await supabase.auth.mfa.unenroll({ factorId: f.id });
  }
  const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: `LandDoctor ${Date.now()}` });
  if (error || !data) return { error: "unknown" };
  return { factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret };
}

export async function verifyCode(prev: MfaState, formData: FormData): Promise<MfaState> {
  const code = String(formData.get("code") ?? "").replace(/\s/g, "");
  const factorId = String(formData.get("factorId") ?? "");
  if (!/^\d{6}$/.test(code) || !factorId) return { ...prev, error: "invalid_code" };

  const supabase = await staffClient();
  const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId, code });
  if (error) return { ...prev, error: "invalid_code" };
  redirect("/admin/cases");
}

export async function signOut(): Promise<void> {
  if (supabaseConfigured()) {
    const supabase = await staffClient();
    await supabase.auth.signOut();
  }
  redirect("/admin/login");
}
