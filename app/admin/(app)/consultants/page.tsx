import { requireStaff } from "@/lib/admin/auth";
import { formatPhoneDisplay } from "@/lib/phone";
import { staffClient } from "@/lib/supabase/server";
import { saveConsultant } from "./actions";

type K = {
  id: number; name: string; role: string; employment_status: string; sanction_ref: string | null; phone: string;
  areas: string[]; upazilas: string[]; conflict_upazilas: string[]; specialities: string[]; payout_account: string | null;
  share_pct: number; verified: boolean; active: boolean; is_demo: boolean;
};

const ROLE: Record<string, string> = {
  surveyor: "সার্ভেয়ার · Surveyor", retired_official: "অবসরপ্রাপ্ত কর্মকর্তা · Retired official",
  advocate: "আইনজীবী · Advocate", deed_writer: "দলিল লেখক · Deed writer",
};
const INPUT = "rounded-control border border-line bg-surface px-2 py-2 text-sm";

function ConsultantForm({ k }: { k?: K }) {
  return (
    <form action={saveConsultant} className="grid gap-2 text-sm sm:grid-cols-2">
      {k && <input type="hidden" name="id" value={k.id} />}
      <label className="flex flex-col">নাম · Name<input name="name" required minLength={2} maxLength={80} defaultValue={k?.name} className={INPUT} /></label>
      <label className="flex flex-col">ফোন · Phone<input name="phone" required defaultValue={k ? formatPhoneDisplay(k.phone) : ""} className={INPUT} /></label>
      <label className="flex flex-col">ভূমিকা · Role
        <select name="role" defaultValue={k?.role ?? "surveyor"} className={INPUT}>
          {Object.entries(ROLE).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </label>
      <label className="flex flex-col">চাকরি · Employment
        <select name="employment_status" defaultValue={k?.employment_status ?? "private"} className={INPUT}>
          <option value="private">বেসরকারি · Private</option>
          <option value="government_sanctioned">সরকারি, অনুমোদনসহ · Government with sanction</option>
        </select>
      </label>
      <label className="flex flex-col">অনুমোদনের রেফারেন্স · Sanction ref<input name="sanction_ref" defaultValue={k?.sanction_ref ?? ""} className={INPUT} /></label>
      <label className="flex flex-col">শেয়ার % · Share %<input name="share_pct" inputMode="numeric" defaultValue={k?.share_pct ?? 80} className={INPUT} /></label>
      <fieldset className="flex gap-4">
        <legend>মাঠের কাজের এলাকা · Field areas</legend>
        <label><input type="checkbox" name="area_savar" defaultChecked={k?.areas.includes("savar")} /> সাভার</label>
        <label><input type="checkbox" name="area_gazipur" defaultChecked={k?.areas.includes("gazipur")} /> গাজীপুর</label>
      </fieldset>
      <label className="flex flex-col">উপজেলা (কমা দিয়ে) · Upazilas<input name="upazilas" defaultValue={k?.upazilas.join(", ")} className={INPUT} /></label>
      <label className="flex flex-col sm:col-span-2">
        যেসব উপজেলার অফিসে কাজ করেছেন (এসব কেস পাবেন না) · Offices worked at (conflict)
        <input name="conflict_upazilas" defaultValue={k?.conflict_upazilas.join(", ")} className={INPUT} />
      </label>
      <label className="flex flex-col">বিশেষত্ব · Specialities<input name="specialities" defaultValue={k?.specialities.join(", ")} className={INPUT} /></label>
      <label className="flex flex-col">পেমেন্ট অ্যাকাউন্ট (bKash) · Payout account<input name="payout_account" defaultValue={k?.payout_account ?? ""} className={INPUT} /></label>
      <div className="flex flex-wrap gap-4 sm:col-span-2">
        <label><input type="checkbox" name="verified" defaultChecked={k?.verified} /> যাচাই করা · Verified</label>
        <label><input type="checkbox" name="active" defaultChecked={k?.active ?? true} /> সক্রিয় · Active</label>
        <label><input type="checkbox" name="is_demo" defaultChecked={k?.is_demo} /> ডেমো · Demo</label>
      </div>
      <button className="w-fit rounded-full bg-accent px-4 py-2 font-semibold text-on-accent">সংরক্ষণ · Save</button>
    </form>
  );
}

export default async function ConsultantsPage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  const staff = await requireStaff();
  const sp = await searchParams;
  const isSuper = staff.role === "super_admin";
  const { data } = await (await staffClient()).from("consultants").select("*").order("name").returns<K[]>();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">বিশেষজ্ঞ · Consultants</h1>
      {sp.ok && <p role="status" className="rounded-full bg-accent-soft p-3 text-sm">{sp.ok}</p>}
      {sp.error && <p role="alert" className="rounded-card border-2 border-danger bg-danger-soft p-3 text-sm">{sp.error}</p>}
      {!isSuper && <p className="text-sm text-muted">শুধু দেখা যাবে; বদলাতে সুপার অ্যাডমিন লাগবে। · Read only.</p>}

      <ul className="flex flex-col gap-3">
        {data?.map((k) => (
          <li key={k.id} className="rounded-card border border-line bg-surface p-4">
            <div className="flex flex-wrap items-center gap-2">
              <strong>{k.name}</strong>
              <span className="text-sm text-muted">{ROLE[k.role]}</span>
              {k.verified ? <span className="rounded-full bg-verified-soft px-2 text-xs font-semibold text-verified">যাচাই করা</span>
                : <span className="rounded-full bg-warning-soft px-2 text-xs font-semibold text-warning">যাচাই হয়নি</span>}
              {!k.active && <span className="rounded-full bg-sunken px-2 text-xs">নিষ্ক্রিয়</span>}
              {k.employment_status !== "private" && <span className="rounded-full bg-sunken px-2 text-xs">সরকারি · {k.sanction_ref}</span>}
              {k.is_demo && <span className="rounded-full bg-sunken px-2 text-xs">ডেমো</span>}
            </div>
            <p className="text-sm text-muted">
              {formatPhoneDisplay(k.phone)} · {k.areas.join(", ") || "—"} · {k.upazilas.join(", ")} · শেয়ার {k.share_pct}%
              {k.conflict_upazilas.length > 0 && <> · সংঘাত: {k.conflict_upazilas.join(", ")}</>}
            </p>
            {isSuper && (
              <details className="mt-2">
                <summary className="cursor-pointer text-sm text-accent underline">সম্পাদনা · Edit</summary>
                <div className="pt-3"><ConsultantForm k={k} /></div>
              </details>
            )}
          </li>
        ))}
        {!data?.length && <li className="text-muted">এখনো কেউ নেই · No consultants yet</li>}
      </ul>

      {isSuper && (
        <section className="rounded-card border border-line bg-surface p-4">
          <h2 className="mb-3 text-base font-semibold">নতুন বিশেষজ্ঞ · Add consultant</h2>
          <ConsultantForm />
        </section>
      )}
    </div>
  );
}
