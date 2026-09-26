import { redirect } from "next/navigation";
import { A } from "@/lib/admin/strings";
import { staffClient, supabaseConfigured } from "@/lib/supabase/server";
import { MfaForm } from "./MfaForm";

export default async function MfaPage() {
  if (!supabaseConfigured()) redirect("/admin/login?error=not_configured");
  const supabase = await staffClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) redirect("/admin/login");

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.currentLevel === "aal2") redirect("/admin/cases");

  const { data: factors } = await supabase.auth.mfa.listFactors();
  const verified = factors?.totp.find((f) => f.status === "verified");

  return (
    <main className="mx-auto flex max-w-sm flex-col gap-6 px-4 py-12">
      <h1 className="text-xl font-bold">{A.mfa.title}</h1>
      <p className="text-sm text-muted">{A.mfa.explain}</p>
      <MfaForm verifiedFactorId={verified?.id} />
    </main>
  );
}
