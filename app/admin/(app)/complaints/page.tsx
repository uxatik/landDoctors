import Link from "next/link";
import { requireStaff } from "@/lib/admin/auth";
import { formatDateTime } from "@/lib/admin/labels";
import { formatPhoneDisplay } from "@/lib/phone";
import { staffClient } from "@/lib/supabase/server";
import { addComplaint, resolveComplaint } from "./actions";

type C = {
  id: number; created_at: string; description: string; status: "open" | "resolved"; resolution: string | null;
  phone: string | null; case_id: number | null; cases: { ref: string } | null;
};
const INPUT = "rounded-control border border-line bg-surface px-2 py-2 text-sm";

export default async function ComplaintsPage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  await requireStaff();
  const sp = await searchParams;
  const { data } = await (await staffClient())
    .from("complaints").select("id, created_at, description, status, resolution, phone, case_id, cases(ref)")
    .order("status").order("created_at", { ascending: false }).returns<C[]>();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">অভিযোগ · Complaints</h1>
      <p className="text-sm text-muted">কেউ নগদ বা অনানুষ্ঠানিক টাকা চাইলে অবশ্যই এখানে লিখুন। · Always log requests for cash or unofficial money.</p>
      {sp.ok && <p role="status" className="rounded-full bg-accent-soft p-3 text-sm">{sp.ok}</p>}
      {sp.error && <p role="alert" className="rounded-card border-2 border-danger bg-danger-soft p-3 text-sm">{sp.error}</p>}

      <form action={addComplaint} className="grid gap-2 rounded-card border border-line bg-surface p-4 text-sm sm:grid-cols-3">
        <label className="flex flex-col">কেস নম্বর (যদি থাকে)<input name="case_ref" placeholder="LD-0001" className={INPUT} /></label>
        <label className="flex flex-col">ফোন<input name="phone" className={INPUT} /></label>
        <label className="flex flex-col sm:col-span-3">কী হয়েছে · What happened<textarea name="description" rows={3} required maxLength={2000} className={INPUT} /></label>
        <button className="w-fit rounded-full bg-accent px-4 py-2 font-semibold text-on-accent">অভিযোগ যোগ · Log complaint</button>
      </form>

      <ul className="flex flex-col gap-3">
        {data?.map((c) => (
          <li key={c.id} className={`rounded-card border p-4 text-sm ${c.status === "open" ? "border-warning bg-surface" : "border-line bg-sunken"}`}>
            <p className="flex flex-wrap gap-2 text-muted">
              <span className="tabular-nums">{formatDateTime(c.created_at)}</span>
              {c.cases && <Link className="text-accent underline" href={`/admin/cases/${c.case_id}`}>{c.cases.ref}</Link>}
              {c.phone && <span>{formatPhoneDisplay(c.phone)}</span>}
              <strong className={c.status === "open" ? "text-warning" : ""}>{c.status === "open" ? "খোলা · Open" : "সমাধান · Resolved"}</strong>
            </p>
            <p className="whitespace-pre-wrap">{c.description}</p>
            {c.resolution && <p className="mt-2 border-l-4 border-line pl-2">{c.resolution}</p>}
            {c.status === "open" && (
              <form action={resolveComplaint} className="mt-2 flex gap-2">
                <input type="hidden" name="id" value={c.id} />
                <input name="resolution" required placeholder="কী করা হলো · Resolution" className={`${INPUT} flex-1`} />
                <button className="rounded-control border border-line px-3">সমাধান · Resolve</button>
              </form>
            )}
          </li>
        ))}
        {!data?.length && <li className="text-muted">কোনো অভিযোগ নেই · No complaints</li>}
      </ul>
    </div>
  );
}
