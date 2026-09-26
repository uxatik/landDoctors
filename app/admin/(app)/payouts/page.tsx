import { requireStaff } from "@/lib/admin/auth";
import { formatDateTime } from "@/lib/admin/labels";
import { buildPayouts, type PaidOffer } from "@/lib/admin/payouts";
import { formatTaka } from "@/lib/money";
import { staffClient } from "@/lib/supabase/server";
import { markPayoutPaid } from "./actions";

type Row = {
  case_id: number; service_price: number; govt_fees: number; consultant_id: number;
  consultants: { name: string } | null; packages: { consultant_share_pct: number } | null;
  cases: { ref: string; status: string } | null;
};
type Payout = { id: number; amount: number; paid_at: string | null; case_ids: number[]; consultants: { name: string } | null };

export default async function PayoutsPage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  await requireStaff({ superAdmin: true });
  const sp = await searchParams;
  const supabase = await staffClient();
  const [{ data: offers }, { data: payouts }] = await Promise.all([
    supabase.from("offers")
      .select("case_id, service_price, govt_fees, consultant_id, consultants(name), packages(consultant_share_pct), cases!inner(ref, status)")
      .not("paid_at", "is", null)
      .in("cases.status", ["delivered", "closed"])
      .returns<Row[]>(),
    supabase.from("payouts").select("id, amount, paid_at, case_ids, consultants(name)").order("created_at", { ascending: false }).limit(50).returns<Payout[]>(),
  ]);

  const paid = new Set((payouts ?? []).flatMap((p) => p.case_ids));
  const lines = buildPayouts(
    (offers ?? []).map<PaidOffer>((r) => ({
      case_id: r.case_id, service_price: r.service_price, govt_fees: r.govt_fees, consultant_id: r.consultant_id,
      consultant_name: r.consultants?.name ?? "?", share_pct: r.packages?.consultant_share_pct ?? 0, case_ref: r.cases?.ref ?? "",
    })),
    paid,
  );

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">বিশেষজ্ঞের পাওনা · Payouts</h1>
      <p className="text-sm text-muted">কাজ দেওয়া বা বন্ধ হওয়া কেস থেকে হিসাব। শেয়ার + বিশেষজ্ঞ যে সরকারি ফি দিয়েছেন। · Delivered/closed cases: share plus government fees they paid.</p>
      {sp.ok && <p role="status" className="rounded-full bg-accent-soft p-3 text-sm">{sp.ok}</p>}
      {sp.error && <p role="alert" className="rounded-card border-2 border-danger bg-danger-soft p-3 text-sm">{sp.error}</p>}

      <ul className="flex flex-col gap-3">
        {lines.map((l) => (
          <li key={l.consultantId} className="flex flex-wrap items-center justify-between gap-3 rounded-card border border-line bg-surface p-4 text-sm">
            <div>
              <strong>{l.consultantName}</strong>
              <p className="text-muted">{l.caseRefs.join(", ")}</p>
              <p className="tabular-nums">শেয়ার {formatTaka(l.share)} + ফি {formatTaka(l.feesReimbursed)} = <strong>{formatTaka(l.total)}</strong></p>
            </div>
            <form action={markPayoutPaid}>
              <input type="hidden" name="consultant_id" value={l.consultantId} />
              <input type="hidden" name="amount" value={l.total} />
              <input type="hidden" name="case_ids" value={l.caseIds.join(",")} />
              <button className="rounded-full bg-accent px-3 py-2 font-semibold text-on-accent">পরিশোধ করা হয়েছে · Mark paid</button>
            </form>
          </li>
        ))}
        {lines.length === 0 && <li className="text-muted">কোনো পাওনা নেই · Nothing due</li>}
      </ul>

      <h2 className="pt-2 text-base font-semibold">আগের পরিশোধ · Past payouts</h2>
      <ul className="text-sm">
        {payouts?.map((p) => (
          <li key={p.id} className="border-b border-line py-1 tabular-nums">
            {p.paid_at ? formatDateTime(p.paid_at) : "—"} · {p.consultants?.name} · {formatTaka(p.amount)} · {p.case_ids.length} কেস
          </li>
        ))}
      </ul>
    </div>
  );
}
