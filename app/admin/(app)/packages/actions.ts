"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/admin/auth";
import { bool, int, s } from "@/lib/admin/form";
import { staffClient } from "@/lib/supabase/server";

export async function savePackage(formData: FormData) {
  await requireStaff({ superAdmin: true });
  const id = int(formData, "id");
  const price = int(formData, "base_price");
  const share = int(formData, "consultant_share_pct");
  const days = int(formData, "delivery_days");
  const back = (p: Record<string, string>): never => {
    revalidatePath("/admin/packages");
    redirect(`/admin/packages?${new URLSearchParams(p)}`);
  };
  if (!id || price === null || share === null || share > 100 || days === null || days > 60) back({ error: "তথ্যটি ঠিক নয় · Check the numbers" });

  const { error } = await (await staffClient())
    .from("packages")
    .update({
      name_bn: s(formData, "name_bn"), name_en: s(formData, "name_en"),
      scope_bn: s(formData, "scope_bn"), scope_en: s(formData, "scope_en"),
      exclusions_bn: s(formData, "exclusions_bn"), exclusions_en: s(formData, "exclusions_en"),
      base_price: price, consultant_share_pct: share, delivery_days: days,
      price_confirmed: bool(formData, "price_confirmed"), active: bool(formData, "active"),
    })
    .eq("id", id);
  if (error) back({ error: "সংরক্ষণ করা যায়নি · Could not save" });
  back({ ok: "সংরক্ষিত · Saved" });
}
