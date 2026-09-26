"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/admin/auth";
import { adminErrorMessage } from "@/lib/admin/errors";
import { staffClient } from "@/lib/supabase/server";

function back(caseId: number, params: Record<string, string>): never {
  revalidatePath(`/admin/cases/${caseId}`);
  revalidatePath("/admin/cases");
  redirect(`/admin/cases/${caseId}?${new URLSearchParams(params).toString()}`);
}

function num(v: FormDataEntryValue | null): number | null {
  if (typeof v !== "string" || v.trim() === "") return null;
  const n = Number(v);
  return Number.isInteger(n) && n >= 0 ? n : NaN;
}

async function call(caseId: number, fn: string, args: Record<string, unknown>, okMsg: string): Promise<never> {
  await requireStaff();
  const supabase = await staffClient();
  const { error } = await supabase.rpc(fn, args);
  if (error) back(caseId, { error: adminErrorMessage(error.message) });
  back(caseId, { ok: okMsg });
}

export async function changeStatus(caseId: number, formData: FormData) {
  await call(caseId, "change_case_status", {
    p_case_id: caseId, p_to: String(formData.get("to") ?? ""), p_note: String(formData.get("note") ?? ""),
  }, "অবস্থা বদলানো হয়েছে · Status updated");
}

export async function assignConsultant(caseId: number, formData: FormData) {
  const consultantId = num(formData.get("consultant_id"));
  if (!consultantId) back(caseId, { error: "বিশেষজ্ঞ বেছে নিন · Choose a consultant" });
  await call(caseId, "assign_consultant", { p_case_id: caseId, p_consultant_id: consultantId },
    "বিশেষজ্ঞ ঠিক করা হয়েছে · Consultant assigned");
}

export async function createOffer(caseId: number, formData: FormData) {
  const packageId = num(formData.get("package_id"));
  const price = num(formData.get("service_price"));
  const fees = num(formData.get("govt_fees")) ?? 0;
  if (!packageId || Number.isNaN(price) || Number.isNaN(fees)) back(caseId, { error: "তথ্যটি ঠিক নয় · Check the input" });
  await call(caseId, "create_offer", {
    p_case_id: caseId, p_package_id: packageId, p_service_price: price,
    p_govt_fees: fees, p_govt_fees_note: String(formData.get("govt_fees_note") ?? ""),
  }, "প্রস্তাব তৈরি হয়েছে · Offer created");
}

export async function recordPayment(caseId: number, formData: FormData) {
  const amount = num(formData.get("amount"));
  if (!amount) back(caseId, { error: "টাকার পরিমাণ লিখুন · Enter the amount" });
  await call(caseId, "record_manual_payment", {
    p_case_id: caseId, p_amount: amount, p_method: String(formData.get("method") ?? ""),
    p_reference: String(formData.get("reference") ?? ""),
  }, "পেমেন্ট রেকর্ড হয়েছে · Payment recorded");
}

export async function recordRefund(caseId: number, formData: FormData) {
  if (formData.get("confirm") !== "yes") back(caseId, { error: "নিশ্চিত করতে টিক দিন · Tick to confirm the refund" });
  await call(caseId, "record_refund", { p_case_id: caseId, p_note: String(formData.get("note") ?? "") },
    "রিফান্ড রেকর্ড হয়েছে · Refund recorded");
}

export async function addNote(caseId: number, formData: FormData) {
  await call(caseId, "add_case_note", { p_case_id: caseId, p_note: String(formData.get("note") ?? "") },
    "নোট যোগ হয়েছে · Note added");
}
