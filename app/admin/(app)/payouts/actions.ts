"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/admin/auth";
import { int, s } from "@/lib/admin/form";
import { staffClient } from "@/lib/supabase/server";

export async function markPayoutPaid(formData: FormData) {
  const staff = await requireStaff({ superAdmin: true });
  const consultantId = int(formData, "consultant_id");
  const amount = int(formData, "amount");
  const caseIds = s(formData, "case_ids").split(",").map(Number).filter((n) => Number.isInteger(n) && n > 0);
  const back = (p: Record<string, string>): never => {
    revalidatePath("/admin/payouts");
    redirect(`/admin/payouts?${new URLSearchParams(p)}`);
  };
  if (!consultantId || amount === null || caseIds.length === 0) back({ error: "তথ্যটি ঠিক নয় · Invalid payout" });
  const today = new Date().toISOString().slice(0, 10);
  const { error } = await (await staffClient()).from("payouts").insert({
    consultant_id: consultantId, amount, case_ids: caseIds, period_start: today, period_end: today,
    paid_at: new Date().toISOString(), recorded_by: staff.userId,
  });
  if (error) back({ error: "সংরক্ষণ করা যায়নি · Could not save" });
  back({ ok: "পরিশোধ রেকর্ড হয়েছে · Payout recorded" });
}
