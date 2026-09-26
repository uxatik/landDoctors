import "server-only";
import { redirect } from "next/navigation";
import { staffClient, supabaseConfigured } from "@/lib/supabase/server";

export type StaffRole = "operations" | "super_admin";
export type StaffSession = { userId: string; email: string; name: string; role: StaffRole };

/**
 * Gate for every staff page. Order matters:
 * 1. signed in  2. two-step verified (aal2)  3. an active staff member.
 * The database enforces the same rules with RLS; this only decides where to send people.
 */
export async function requireStaff(opts: { superAdmin?: boolean } = {}): Promise<StaffSession> {
  if (!supabaseConfigured()) redirect("/admin/login?error=not_configured");
  const supabase = await staffClient();

  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;
  if (!user) redirect("/admin/login");

  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.currentLevel !== "aal2") redirect("/admin/mfa");

  const { data: staff } = await supabase
    .from("staff")
    .select("name, role, active")
    .eq("user_id", user.id)
    .maybeSingle<{ name: string; role: StaffRole; active: boolean }>();
  if (!staff || !staff.active) {
    await supabase.auth.signOut();
    redirect("/admin/login?error=not_staff");
  }
  if (opts.superAdmin && staff.role !== "super_admin") redirect("/admin/cases?error=super_admin_only");

  return { userId: user.id, email: user.email ?? "", name: staff.name, role: staff.role };
}
