import { parseDbError } from "@/lib/supabase/public";

const MESSAGES: Record<string, string> = {
  not_authorised: "এই কাজের অনুমতি নেই। · You don't have permission for this.",
  invalid_transition: "এই অবস্থা থেকে সেখানে যাওয়া যায় না। · That status change isn't allowed.",
  consultant_required: "আগে একজন বিশেষজ্ঞ ঠিক করুন। · Assign a consultant first.",
  consultant_not_eligible: "এই বিশেষজ্ঞকে দেওয়া যাবে না (যাচাই/সক্রিয়/সরকারি/ডেমো)। · This consultant can't be assigned.",
  conflict_of_interest: "স্বার্থের সংঘাত: বিশেষজ্ঞ এই উপজেলার অফিসে কাজ করেছেন। · Conflict: they worked in this upazila.",
  outside_consultant_area: "মাঠের কাজের জন্য বিশেষজ্ঞ এই এলাকায় কাজ করেন না। · Consultant doesn't cover this area.",
  invalid_status: "কেসের বর্তমান অবস্থায় এটি করা যায় না। · Not possible in the case's current status.",
  amount_mismatch: "টাকার পরিমাণ প্রস্তাবের মোটের সঙ্গে মেলে না। · Amount doesn't match the offer total.",
  not_found: "খুঁজে পাওয়া যায়নি। · Not found.",
  invalid_input: "তথ্যটি ঠিক নয়। · Check the input.",
};

export function adminErrorMessage(message: string | undefined): string {
  const { kind } = parseDbError(message);
  return MESSAGES[kind] ?? "কিছু একটা সমস্যা হয়েছে। · Something went wrong.";
}
