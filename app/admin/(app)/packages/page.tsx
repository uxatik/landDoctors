import { requireStaff } from "@/lib/admin/auth";
import { formatTaka } from "@/lib/money";
import { staffClient } from "@/lib/supabase/server";
import { savePackage } from "./actions";

type P = {
  id: number; slug: string; name_bn: string; name_en: string; scope_bn: string; scope_en: string;
  exclusions_bn: string; exclusions_en: string; delivery_days: number; base_price: number;
  consultant_share_pct: number; field_work: boolean; price_confirmed: boolean; active: boolean;
};
const INPUT = "rounded-sm border border-line bg-surface px-2 py-2 text-sm";

export default async function PackagesPage({ searchParams }: { searchParams: Promise<{ ok?: string; error?: string }> }) {
  await requireStaff({ superAdmin: true });
  const sp = await searchParams;
  const { data } = await (await staffClient()).from("packages").select("*").order("id").returns<P[]>();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold">প্যাকেজ ও দাম · Packages and prices</h1>
      <p className="text-sm text-muted">
        &quot;দাম নিশ্চিত&quot; টিক না দেওয়া পর্যন্ত গ্রাহক অনলাইনে পেমেন্ট করতে পারবেন না। দাম বদলালে আগের প্রস্তাবের দাম বদলায় না।
        · Customers can pay online only after &quot;Price confirmed&quot; is ticked. Changing a price doesn&apos;t change offers already sent.
      </p>
      {sp.ok && <p role="status" className="rounded-md bg-accent-soft p-3 text-sm">{sp.ok}</p>}
      {sp.error && <p role="alert" className="rounded-md border-2 border-danger bg-danger-soft p-3 text-sm">{sp.error}</p>}

      {data?.map((p) => (
        <form key={p.id} action={savePackage} className="grid gap-2 rounded-md border border-line bg-surface p-4 text-sm sm:grid-cols-2">
          <input type="hidden" name="id" value={p.id} />
          <div className="flex flex-wrap items-center gap-2 sm:col-span-2">
            <strong className="text-base">{p.name_bn}</strong>
            <span className="text-muted">{p.slug} · {formatTaka(p.base_price)}</span>
            {!p.price_confirmed && <span className="rounded-full bg-warning-soft px-2 text-xs font-semibold text-warning">দাম অনিশ্চিত · Unconfirmed</span>}
          </div>
          <label className="flex flex-col">নাম (বাংলা)<input name="name_bn" defaultValue={p.name_bn} className={INPUT} required /></label>
          <label className="flex flex-col">Name (English)<input name="name_en" defaultValue={p.name_en} className={INPUT} required /></label>
          <label className="flex flex-col">যা থাকছে<textarea name="scope_bn" defaultValue={p.scope_bn} rows={3} className={INPUT} required /></label>
          <label className="flex flex-col">What&apos;s included<textarea name="scope_en" defaultValue={p.scope_en} rows={3} className={INPUT} required /></label>
          <label className="flex flex-col">যা থাকছে না<textarea name="exclusions_bn" defaultValue={p.exclusions_bn} rows={2} className={INPUT} /></label>
          <label className="flex flex-col">Not included<textarea name="exclusions_en" defaultValue={p.exclusions_en} rows={2} className={INPUT} /></label>
          <label className="flex flex-col">দাম (৳) · Price<input name="base_price" inputMode="numeric" defaultValue={p.base_price} className={INPUT} /></label>
          <label className="flex flex-col">বিশেষজ্ঞের শেয়ার % · Consultant share %<input name="consultant_share_pct" inputMode="numeric" defaultValue={p.consultant_share_pct} className={INPUT} /></label>
          <label className="flex flex-col">দিন · Delivery days<input name="delivery_days" inputMode="numeric" defaultValue={p.delivery_days} className={INPUT} /></label>
          <div className="flex items-end gap-4">
            <label><input type="checkbox" name="price_confirmed" defaultChecked={p.price_confirmed} /> দাম নিশ্চিত · Price confirmed</label>
            <label><input type="checkbox" name="active" defaultChecked={p.active} /> সক্রিয় · Active</label>
          </div>
          <button className="w-fit rounded-sm bg-accent px-4 py-2 font-semibold text-on-accent">সংরক্ষণ · Save</button>
        </form>
      ))}
    </div>
  );
}
