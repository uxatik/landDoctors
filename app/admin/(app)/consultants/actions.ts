"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/admin/auth";
import { bool, int, list, s } from "@/lib/admin/form";
import { normalisePhone } from "@/lib/phone";
import { staffClient } from "@/lib/supabase/server";

function done(params: Record<string, string>): never {
  revalidatePath("/admin/consultants");
  redirect(`/admin/consultants?${new URLSearchParams(params)}`);
}

export async function saveConsultant(formData: FormData) {
  await requireStaff({ superAdmin: true });
  const phone = normalisePhone(s(formData, "phone"));
  const share = int(formData, "share_pct");
  const employment = s(formData, "employment_status") === "government_sanctioned" ? "government_sanctioned" : "private";
  const role = s(formData, "role");
  if (!phone) done({ error: "ফোন নম্বর ঠিক নয় · Invalid phone" });
  if (share === null || share > 100) done({ error: "শেয়ার ০–১০০ · Share must be 0–100" });
  if (!["surveyor", "retired_official", "advocate", "deed_writer"].includes(role)) done({ error: "ভূমিকা বেছে নিন · Choose a role" });
  if (employment === "government_sanctioned" && !s(formData, "sanction_ref")) {
    done({ error: "সরকারি কর্মচারীর অনুমোদনের রেফারেন্স লাগবে · Government staff need a sanction reference" });
  }

  const row = {
    name: s(formData, "name"),
    role,
    employment_status: employment,
    sanction_ref: s(formData, "sanction_ref") || null,
    phone,
    areas: ["savar", "gazipur"].filter((a) => bool(formData, `area_${a}`)),
    upazilas: list(formData, "upazilas"),
    conflict_upazilas: list(formData, "conflict_upazilas"),
    specialities: list(formData, "specialities"),
    payout_account: s(formData, "payout_account") || null,
    share_pct: share,
    verified: bool(formData, "verified"),
    active: bool(formData, "active"),
    is_demo: bool(formData, "is_demo"),
  };
  const supabase = await staffClient();
  const id = int(formData, "id");
  const { error } = id
    ? await supabase.from("consultants").update(row).eq("id", id)
    : await supabase.from("consultants").insert(row);
  if (error) done({ error: "সংরক্ষণ করা যায়নি · Could not save" });
  done({ ok: "সংরক্ষিত · Saved" });
}
