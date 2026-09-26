"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/admin/auth";
import { int, s } from "@/lib/admin/form";
import { normalisePhone } from "@/lib/phone";
import { staffClient } from "@/lib/supabase/server";

function back(p: Record<string, string>): never {
  revalidatePath("/admin/complaints");
  redirect(`/admin/complaints?${new URLSearchParams(p)}`);
}

export async function addComplaint(formData: FormData) {
  await requireStaff();
  const supabase = await staffClient();
  const ref = s(formData, "case_ref").toUpperCase();
  let caseId: number | null = null;
  if (ref) {
    const { data } = await supabase.from("cases").select("id").eq("ref", ref).maybeSingle<{ id: number }>();
    if (!data) back({ error: "কেস নম্বর পাওয়া যায়নি · Case not found" });
    caseId = data.id;
  }
  const rawPhone = s(formData, "phone");
  const phone = rawPhone ? normalisePhone(rawPhone) : null;
  if (rawPhone && !phone) back({ error: "ফোন নম্বর ঠিক নয় · Invalid phone" });
  const description = s(formData, "description");
  if (!description) back({ error: "বিবরণ লিখুন · Describe the complaint" });

  const { error } = await supabase.from("complaints").insert({ case_id: caseId, phone, description });
  if (error) back({ error: "সংরক্ষণ করা যায়নি · Could not save" });
  if (caseId) await supabase.rpc("add_case_note", { p_case_id: caseId, p_note: `অভিযোগ: ${description}` });
  back({ ok: "অভিযোগ যোগ হয়েছে · Complaint logged" });
}

export async function resolveComplaint(formData: FormData) {
  const staff = await requireStaff();
  const id = int(formData, "id");
  const resolution = s(formData, "resolution");
  if (!id || !resolution) back({ error: "সমাধান লিখুন · Write the resolution" });
  const { error } = await (await staffClient())
    .from("complaints")
    .update({ status: "resolved", resolution, resolved_at: new Date().toISOString(), resolved_by: staff.userId })
    .eq("id", id);
  if (error) back({ error: "সংরক্ষণ করা যায়নি · Could not save" });
  back({ ok: "সমাধান হয়েছে · Resolved" });
}
