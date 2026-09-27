import type { CaseStatus } from "@/lib/cases/workflow";

export const STATUS_LABEL: Record<CaseStatus, string> = {
  new: "নতুন · New",
  triage_done: "কল হয়েছে · Triage done",
  offer_sent: "প্রস্তাব পাঠানো · Offer sent",
  paid: "পেমেন্ট হয়েছে · Paid",
  in_progress: "কাজ চলছে · In progress",
  delivered: "কাজ দেওয়া হয়েছে · Delivered",
  closed: "বন্ধ · Closed",
  cancelled: "বাতিল · Cancelled",
  refunded: "ফেরত · Refunded",
};

export const STATUS_TONE: Record<CaseStatus, string> = {
  new: "bg-warning-soft text-warning",
  triage_done: "bg-sunken text-ink",
  offer_sent: "bg-sunken text-ink",
  paid: "bg-accent-soft text-accent",
  in_progress: "bg-accent-soft text-accent",
  delivered: "bg-accent-soft text-accent",
  closed: "bg-sunken text-muted",
  cancelled: "bg-sunken text-muted",
  refunded: "bg-danger-soft text-danger",
};

export const CATEGORY_LABEL: Record<string, string> = {
  pre_purchase_check: "কেনার আগে যাচাই · Pre-purchase check",
  mutation: "নামজারি · Mutation",
  survey: "পরিমাপ · Survey",
  inheritance: "ওয়ারিশ · Inheritance",
  record_correction: "রেকর্ড সংশোধন · Record correction",
  dispute: "বিরোধ · Dispute",
};

export const AREA_LABEL: Record<string, string> = { savar: "সাভার", gazipur: "গাজীপুর", other: "অন্য" };

export const DOC_LABEL: Record<string, string> = {
  deed: "দলিল", khatian: "খতিয়ান", mutation_dcr: "ডিসিআর", tax_receipt: "খাজনা রসিদ", mouza_map: "মৌজা ম্যাপ",
};

export const METHOD_LABEL: Record<string, string> = {
  manual_bkash: "bKash (হাতে রেকর্ড)",
  manual_nagad: "Nagad (হাতে রেকর্ড)",
  manual_bank: "ব্যাংক · Bank",
  manual_cash_office: "অফিসে নগদ · Cash at office",
  sslcommerz: "SSLCommerz",
};

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Dhaka",
  }).format(new Date(iso));
}
