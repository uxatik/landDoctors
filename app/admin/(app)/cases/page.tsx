import Link from "next/link";
import { requireStaff } from "@/lib/admin/auth";
import { AREA_LABEL, CATEGORY_LABEL, STATUS_LABEL, STATUS_TONE, formatDateTime } from "@/lib/admin/labels";
import { CASE_STATUSES, type CaseStatus } from "@/lib/cases/workflow";
import { formatPhoneDisplay } from "@/lib/phone";
import { staffClient } from "@/lib/supabase/server";

type Row = {
  id: number; ref: string; created_at: string; category: string; area: string; upazila: string;
  customer_name: string; customer_phone: string; status: CaseStatus; consultants: { name: string } | null;
};

export default async function CasesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; area?: string; from?: string; q?: string }>;
}) {
  await requireStaff();
  const sp = await searchParams;
  const supabase = await staffClient();

  let query = supabase
    .from("cases")
    .select("id, ref, created_at, category, area, upazila, customer_name, customer_phone, status, consultants(name)")
    .order("created_at", { ascending: false })
    .limit(200);
  if (sp.status && (CASE_STATUSES as readonly string[]).includes(sp.status)) query = query.eq("status", sp.status);
  if (sp.area && ["savar", "gazipur", "other"].includes(sp.area)) query = query.eq("area", sp.area);
  if (sp.from && /^\d{4}-\d{2}-\d{2}$/.test(sp.from)) query = query.gte("created_at", `${sp.from}T00:00:00+06:00`);
  if (sp.q && /^LD-\d+$/i.test(sp.q.trim())) query = query.eq("ref", sp.q.trim().toUpperCase());

  const { data, error } = await query.returns<Row[]>();
  const rows = data ?? [];
  const sel = "rounded-control border border-line bg-surface px-2 py-2 text-sm";

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">কেস · Cases</h1>
      <form className="flex flex-wrap items-end gap-2" role="search">
        <label className="flex flex-col text-sm">
          অবস্থা · Status
          <select name="status" defaultValue={sp.status ?? ""} className={sel}>
            <option value="">সব · All</option>
            {CASE_STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABEL[s]}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col text-sm">
          এলাকা · Area
          <select name="area" defaultValue={sp.area ?? ""} className={sel}>
            <option value="">সব · All</option>
            <option value="savar">সাভার · Savar</option>
            <option value="gazipur">গাজীপুর · Gazipur</option>
            <option value="other">অন্য · Other</option>
          </select>
        </label>
        <label className="flex flex-col text-sm">
          তারিখ থেকে · From
          <input type="date" name="from" defaultValue={sp.from ?? ""} className={sel} />
        </label>
        <label className="flex flex-col text-sm">
          কেস নম্বর · Case no.
          <input name="q" placeholder="LD-0001" defaultValue={sp.q ?? ""} className={`${sel} w-28`} />
        </label>
        <button className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-on-accent">খুঁজুন · Filter</button>
        <Link href="/admin/cases" className="px-2 py-2 text-sm underline">মুছুন · Clear</Link>
      </form>

      {error && <p role="alert" className="text-danger">লোড করা যায়নি · Could not load cases.</p>}
      <p className="text-sm text-muted">{rows.length} টি কেস · cases</p>

      <div className="overflow-x-auto rounded-card border border-line bg-surface">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-sunken text-xs text-muted">
            <tr>
              <th className="px-3 py-2">কেস · Case</th>
              <th className="px-3 py-2">তারিখ · Date</th>
              <th className="px-3 py-2">সমস্যা · Problem</th>
              <th className="px-3 py-2">এলাকা · Area</th>
              <th className="px-3 py-2">গ্রাহক · Customer</th>
              <th className="px-3 py-2">বিশেষজ্ঞ · Consultant</th>
              <th className="px-3 py-2">অবস্থা · Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-line align-top">
                <td className="px-3 py-2 font-semibold">
                  <Link href={`/admin/cases/${r.id}`} className="text-accent underline">{r.ref}</Link>
                </td>
                <td className="whitespace-nowrap px-3 py-2 tabular-nums">{formatDateTime(r.created_at)}</td>
                <td className="px-3 py-2">{CATEGORY_LABEL[r.category] ?? r.category}</td>
                <td className="px-3 py-2">{AREA_LABEL[r.area]} · {r.upazila}</td>
                <td className="px-3 py-2">
                  {r.customer_name}
                  <br />
                  <span className="text-muted">{formatPhoneDisplay(r.customer_phone)}</span>
                </td>
                <td className="px-3 py-2">{r.consultants?.name ?? "—"}</td>
                <td className="px-3 py-2">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_TONE[r.status]}`}>
                    {STATUS_LABEL[r.status]}
                  </span>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-muted">কোনো কেস নেই · No cases match</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
