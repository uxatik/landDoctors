import { requireStaff } from "@/lib/admin/auth";
import { CATEGORY_LABEL, formatDateTime } from "@/lib/admin/labels";
import { formatPhoneDisplay } from "@/lib/phone";
import { staffClient } from "@/lib/supabase/server";

type W = { id: number; created_at: string; district: string; upazila: string; category: string; phone: string };

export default async function WaitlistPage() {
  await requireStaff();
  const { data } = await (await staffClient()).from("waitlist").select("*").order("created_at", { ascending: false }).limit(1000).returns<W[]>();
  const rows = data ?? [];
  const groups = new Map<string, number>();
  for (const r of rows) {
    const key = `${r.district.trim()} · ${r.upazila.trim()}`;
    groups.set(key, (groups.get(key) ?? 0) + 1);
  }
  const ranked = [...groups.entries()].sort((a, b) => b[1] - a[1]);

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">অপেক্ষার তালিকা · Waiting list</h1>
      <p className="text-sm text-muted">কোন এলাকায় পরের সেবা চালু করবেন, তা এখান থেকে বোঝা যায়। · Shows where to expand next.</p>
      <section className="rounded-card border border-line bg-surface p-4">
        <h2 className="mb-2 text-base font-semibold">এলাকা অনুযায়ী · By area</h2>
        <ol className="grid gap-1 text-sm sm:grid-cols-2">
          {ranked.map(([k, n]) => (
            <li key={k} className="flex justify-between gap-4 border-b border-line py-1">
              <span>{k}</span><strong className="tabular-nums">{n}</strong>
            </li>
          ))}
          {ranked.length === 0 && <li className="text-muted">এখনো কেউ নেই · Empty</li>}
        </ol>
      </section>
      <div className="overflow-x-auto rounded-card border border-line bg-surface">
        <table className="w-full min-w-[600px] text-left text-sm">
          <thead className="bg-sunken text-xs text-muted">
            <tr><th className="px-3 py-2">তারিখ</th><th className="px-3 py-2">এলাকা</th><th className="px-3 py-2">সমস্যা</th><th className="px-3 py-2">ফোন</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-line">
                <td className="px-3 py-2 tabular-nums">{formatDateTime(r.created_at)}</td>
                <td className="px-3 py-2">{r.district} · {r.upazila}</td>
                <td className="px-3 py-2">{CATEGORY_LABEL[r.category] ?? r.category}</td>
                <td className="px-3 py-2"><a href={`tel:${r.phone}`} className="underline">{formatPhoneDisplay(r.phone)}</a></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
