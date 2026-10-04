import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStaff } from "@/lib/admin/auth";
import {
  AREA_LABEL, CATEGORY_LABEL, DOC_LABEL, METHOD_LABEL, STATUS_LABEL, STATUS_TONE, formatDateTime,
} from "@/lib/admin/labels";
import { allowedTransitions, type CaseStatus } from "@/lib/cases/workflow";
import { FIELD_CATEGORIES, type CategorySlug } from "@/lib/content/categories";
import { publicEnv } from "@/lib/env";
import { formatTaka } from "@/lib/money";
import { formatPhoneDisplay, toWhatsAppNumber } from "@/lib/phone";
import { WA_TEMPLATE_LABEL, waLink, waTemplate, type WaTemplateKey } from "@/lib/admin/wa-templates";
import { staffClient } from "@/lib/supabase/server";
import { CopyButton } from "@/components/admin/CopyButton";
import { addNote, assignConsultant, changeStatus, createOffer, recordPayment, recordRefund } from "./actions";

type CaseRow = {
  id: number; ref: string; created_at: string; category: CategorySlug; area: "savar" | "gazipur" | "other";
  upazila: string; mouza: string | null; documents: string[]; description: string; customer_name: string;
  customer_phone: string; contact_pref: "call" | "whatsapp"; status: CaseStatus; consultant_id: number | null; source: string;
};
type Consultant = {
  id: number; name: string; role: string; employment_status: string; verified: boolean; active: boolean;
  is_demo: boolean; areas: string[]; conflict_upazilas: string[];
};
type Offer = {
  id: number; token: string; service_price: number; govt_fees: number; govt_fees_note: string; expires_at: string;
  paid_at: string | null; withdrawn_at: string | null; price_confirmed: boolean; packages: { name_bn: string; name_en: string } | null;
};
type Payment = { id: number; amount: number; method: string; status: string; reference: string | null; created_at: string };
type Event = { id: number; at: string; kind: string; from_status: CaseStatus | null; to_status: CaseStatus | null; note: string | null; staff: { name: string } | null };
type Pkg = { id: number; name_bn: string; name_en: string; base_price: number; price_confirmed: boolean; field_work: boolean };

const BOX = "flex flex-col gap-3 rounded-card border border-line bg-surface p-4";
const INPUT = "rounded-control border border-line bg-surface px-2 py-2 text-sm";
const BTN = "rounded-full bg-accent px-3 py-2 text-sm font-semibold text-on-accent";
const BTN_2 = "rounded-full border border-line px-3 py-2 text-sm";

/** Why a consultant can't take this case (mirrors assign_consultant), or null if they can. */
function ineligibleReason(k: Consultant, c: CaseRow): string | null {
  if (!k.verified) return "যাচাই হয়নি";
  if (!k.active) return "নিষ্ক্রিয়";
  if (k.is_demo) return "ডেমো";
  if (k.employment_status !== "private") return "সরকারি (ফেজ ১-এ নয়)";
  const u = c.upazila.split(",")[0]?.trim().toLowerCase();
  if (k.conflict_upazilas.some((x) => x.trim().toLowerCase() === u)) return "স্বার্থের সংঘাত";
  if (FIELD_CATEGORIES.includes(c.category) && !k.areas.includes(c.area)) return "এলাকার বাইরে";
  return null;
}

export default async function CasePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ok?: string; error?: string }>;
}) {
  const staff = await requireStaff();
  const { id } = await params;
  const caseId = Number(id);
  if (!Number.isInteger(caseId) || caseId <= 0) notFound();
  const sp = await searchParams;
  const supabase = await staffClient();

  const [{ data: c }, { data: consultants }, { data: offers }, { data: payments }, { data: events }, { data: packages }] =
    await Promise.all([
      supabase.from("cases").select("*").eq("id", caseId).maybeSingle<CaseRow>(),
      supabase.from("consultants").select("id, name, role, employment_status, verified, active, is_demo, areas, conflict_upazilas").order("name").returns<Consultant[]>(),
      supabase.from("offers").select("id, token, service_price, govt_fees, govt_fees_note, expires_at, paid_at, withdrawn_at, price_confirmed, packages(name_bn, name_en)").eq("case_id", caseId).order("created_at", { ascending: false }).returns<Offer[]>(),
      supabase.from("payments").select("id, amount, method, status, reference, created_at").eq("case_id", caseId).order("created_at").returns<Payment[]>(),
      supabase.from("case_events").select("id, at, kind, from_status, to_status, note, staff:actor(name)").eq("case_id", caseId).order("at").returns<Event[]>(),
      supabase.from("packages").select("id, name_bn, name_en, base_price, price_confirmed, field_work").eq("active", true).order("id").returns<Pkg[]>(),
    ]);
  if (!c) notFound();

  const assigned = consultants?.find((k) => k.id === c.consultant_id);
  const openOffer = offers?.find((o) => !o.paid_at && !o.withdrawn_at);
  const offerUrl = openOffer ? `${publicEnv.NEXT_PUBLIC_SITE_URL}/offer/${openOffer.token}` : null;
  const offerTotal = openOffer ? openOffer.service_price + openOffer.govt_fees : 0;
  const waText = openOffer
    ? `আসসালামু আলাইকুম ${c.customer_name}, ল্যান্ডডক্টর থেকে আপনার কেস ${c.ref}-এর প্রস্তাব: ${offerUrl}`
    : "";
  const nextStatuses = allowedTransitions[c.status];
  const isSuper = staff.role === "super_admin";
  const bound = (fn: (id: number, fd: FormData) => Promise<void>) => fn.bind(null, c.id);

  return (
    <div className="flex flex-col gap-5">
      <Link href="/admin/cases" className="text-sm underline">← কেস তালিকা · All cases</Link>

      {sp.ok && <p role="status" className="rounded-full bg-accent-soft p-3 text-sm text-accent">{sp.ok}</p>}
      {sp.error && <p role="alert" className="rounded-card border-2 border-danger bg-danger-soft p-3 text-sm">{sp.error}</p>}

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-bold tabular-nums">{c.ref}</h1>
        <span className={`rounded-full px-3 py-1 text-sm font-semibold ${STATUS_TONE[c.status]}`}>{STATUS_LABEL[c.status]}</span>
        <span className="text-sm text-muted">{formatDateTime(c.created_at)} · {c.source}</span>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className={`${BOX} lg:col-span-2`} aria-label="Case details">
          <h2 className="text-base font-semibold">কেসের তথ্য · Details</h2>
          <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1 text-sm">
            <dt className="text-muted">সমস্যা</dt><dd>{CATEGORY_LABEL[c.category]}</dd>
            <dt className="text-muted">এলাকা</dt><dd>{AREA_LABEL[c.area]} · {c.upazila}{c.mouza ? ` · মৌজা ${c.mouza}` : ""}</dd>
            <dt className="text-muted">কাগজ</dt><dd>{c.documents.length ? c.documents.map((d) => DOC_LABEL[d] ?? d).join(", ") : "—"}</dd>
            <dt className="text-muted">গ্রাহক</dt><dd>{c.customer_name}</dd>
            <dt className="text-muted">ফোন</dt>
            <dd className="flex flex-wrap gap-3 tabular-nums">
              <a href={`tel:${c.customer_phone}`} className="text-accent underline">{formatPhoneDisplay(c.customer_phone)}</a>
              <a href={`https://wa.me/${toWhatsAppNumber(c.customer_phone)}`} target="_blank" rel="noopener noreferrer" className="underline">WhatsApp</a>
              <span className="text-muted">({c.contact_pref === "call" ? "কল পছন্দ" : "WhatsApp পছন্দ"})</span>
            </dd>
          </dl>
          {c.description && <p className="whitespace-pre-wrap rounded-control bg-sunken p-3 text-sm">{c.description}</p>}
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-muted">WhatsApp বার্তা · Ready messages</h3>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(WA_TEMPLATE_LABEL) as WaTemplateKey[]).map((k) => (
                <a key={k} className={BTN_2} target="_blank" rel="noopener noreferrer" data-wa-template={k}
                  href={waLink(c.customer_phone, waTemplate(k, c))}>
                  {WA_TEMPLATE_LABEL[k]}
                </a>
              ))}
            </div>
            <p className="text-xs text-muted">কেস নম্বর ও নাম নিজে থেকে বসে। WhatsApp খুলবে, আপনি শুধু Send চাপবেন। · Case number and name are filled in; you press send.</p>
          </div>
        </section>

        <section className={BOX} aria-label="Status">
          <h2 className="text-base font-semibold">অবস্থা বদলান · Change status</h2>
          {nextStatuses.length === 0 && <p className="text-sm text-muted">আর কোনো ধাপ নেই · No further steps</p>}
          {nextStatuses.map((to) => (
            <form key={to} action={bound(changeStatus)} className="flex flex-col gap-1">
              <input type="hidden" name="to" value={to} />
              <input name="note" placeholder="নোট (ঐচ্ছিক) · Note" className={INPUT} />
              <button className={to === "cancelled" ? BTN_2 : BTN}>→ {STATUS_LABEL[to]}</button>
            </form>
          ))}
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className={BOX} aria-label="Consultant">
          <h2 className="text-base font-semibold">বিশেষজ্ঞ · Consultant</h2>
          <p className="text-sm">{assigned ? `${assigned.name} (${assigned.role})` : "এখনো ঠিক হয়নি · Not assigned"}</p>
          {!["closed", "cancelled", "refunded", "delivered"].includes(c.status) && (
            <form action={bound(assignConsultant)} className="flex flex-wrap gap-2">
              <select name="consultant_id" className={INPUT} defaultValue="" required aria-label="Consultant">
                <option value="" disabled>বেছে নিন · Choose</option>
                {consultants?.map((k) => {
                  const why = ineligibleReason(k, c);
                  return (
                    <option key={k.id} value={k.id} disabled={!!why}>
                      {k.name}{why ? ` — ${why}` : ""}
                    </option>
                  );
                })}
              </select>
              <button className={BTN}>ঠিক করুন · Assign</button>
            </form>
          )}
        </section>

        <section className={BOX} aria-label="Offer">
          <h2 className="text-base font-semibold">প্রস্তাব · Offer</h2>
          {openOffer ? (
            <div className="flex flex-col gap-2 text-sm">
              <p>
                {openOffer.packages?.name_bn} · সেবা {formatTaka(openOffer.service_price)} + সরকারি ফি {formatTaka(openOffer.govt_fees)} ={" "}
                <strong>{formatTaka(offerTotal)}</strong>
              </p>
              {!openOffer.price_confirmed && (
                <p className="rounded-control bg-warning-soft p-2">দাম এখনো নিশ্চিত নয়, তাই গ্রাহক অনলাইনে পেমেন্ট করতে পারবেন না। · Price not confirmed: no online payment.</p>
              )}
              <p className="text-muted">মেয়াদ · Expires {formatDateTime(openOffer.expires_at)}</p>
              <p className="break-all rounded-control bg-sunken p-2 font-mono text-xs">{offerUrl}</p>
              <div className="flex flex-wrap gap-2">
                <CopyButton text={offerUrl ?? ""} label="লিংক কপি · Copy link" />
                <a className={BTN} target="_blank" rel="noopener noreferrer"
                  href={`https://wa.me/${toWhatsAppNumber(c.customer_phone)}?text=${encodeURIComponent(waText)}`}>
                  WhatsApp-এ পাঠান · Send
                </a>
              </div>
            </div>
          ) : ["new", "triage_done"].includes(c.status) ? (
            <form action={bound(createOffer)} className="flex flex-col gap-2 text-sm">
              <label className="flex flex-col gap-1">
                প্যাকেজ · Package
                <select name="package_id" className={INPUT} required defaultValue="">
                  <option value="" disabled>বেছে নিন · Choose</option>
                  {packages?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name_bn} · {formatTaka(p.base_price)}{p.price_confirmed ? "" : " (দাম অনিশ্চিত)"}
                    </option>
                  ))}
                </select>
              </label>
              {isSuper ? (
                <label className="flex flex-col gap-1">
                  সেবার দাম (খালি = প্যাকেজের দাম) · Service price (blank = package price)
                  <input name="service_price" inputMode="numeric" pattern="\d*" className={INPUT} />
                </label>
              ) : (
                <p className="text-muted">দাম প্যাকেজ অনুযায়ী; বদলাতে সুপার অ্যাডমিন লাগবে। · Package price applies.</p>
              )}
              <label className="flex flex-col gap-1">
                সরকারি ফি (৳) · Government fees
                <input name="govt_fees" inputMode="numeric" pattern="\d*" defaultValue="0" className={INPUT} />
              </label>
              <label className="flex flex-col gap-1">
                সরকারি ফি কীসের · What the fees are for
                <input name="govt_fees_note" maxLength={300} placeholder="যেমন: সার্টিফাইড খতিয়ানের কপি" className={INPUT} />
              </label>
              <button className={BTN} disabled={!c.consultant_id}>প্রস্তাব তৈরি · Create offer</button>
              {!c.consultant_id && <p className="text-muted">আগে বিশেষজ্ঞ ঠিক করুন · Assign a consultant first</p>}
            </form>
          ) : (
            <p className="text-sm text-muted">খোলা প্রস্তাব নেই · No open offer</p>
          )}
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className={BOX} aria-label="Payments">
          <h2 className="text-base font-semibold">পেমেন্ট · Payments</h2>
          {payments?.length ? (
            <ul className="text-sm">
              {payments.map((p) => (
                <li key={p.id}>
                  {formatTaka(p.amount)} · {METHOD_LABEL[p.method] ?? p.method} · {p.status}
                  {p.reference ? ` · ${p.reference}` : ""} · {formatDateTime(p.created_at)}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted">কোনো পেমেন্ট নেই · None yet</p>
          )}

          {c.status === "offer_sent" && openOffer && (
            <form action={bound(recordPayment)} className="flex flex-col gap-2 border-t border-line pt-3 text-sm">
              <p className="font-medium">হাতে পেমেন্ট রেকর্ড · Record a manual payment</p>
              <input name="amount" inputMode="numeric" defaultValue={offerTotal} className={INPUT} aria-label="Amount" />
              <select name="method" className={INPUT} aria-label="Method" defaultValue="manual_bkash">
                {["manual_bkash", "manual_nagad", "manual_bank", "manual_cash_office"].map((m) => (
                  <option key={m} value={m}>{METHOD_LABEL[m]}</option>
                ))}
              </select>
              <input name="reference" placeholder="ট্রানজ্যাকশন আইডি · Transaction ID" className={INPUT} />
              <button className={BTN}>রেকর্ড করুন · Record</button>
            </form>
          )}

          {["paid", "in_progress", "delivered"].includes(c.status) && (
            <form action={bound(recordRefund)} className="flex flex-col gap-2 border-t border-line pt-3 text-sm">
              <p className="font-medium">রিফান্ড · Refund</p>
              <input name="note" placeholder="কারণ · Reason" className={INPUT} required />
              <label className="flex items-center gap-2">
                <input type="checkbox" name="confirm" value="yes" /> টাকা ফেরত দেওয়া হয়েছে/হবে, নিশ্চিত · I confirm this refund
              </label>
              <button className={BTN_2}>রিফান্ড রেকর্ড · Record refund</button>
            </form>
          )}
        </section>

        <section className={BOX} aria-label="Timeline">
          <h2 className="text-base font-semibold">ইতিহাস · Timeline</h2>
          <ol className="flex flex-col gap-2 text-sm">
            {events?.map((e) => (
              <li key={e.id} className="border-l-2 border-line pl-3">
                <span className="text-muted tabular-nums">{formatDateTime(e.at)}</span> · {e.staff?.name ?? "ওয়েবসাইট"} ·{" "}
                <strong>{e.kind}</strong>
                {e.to_status ? ` → ${STATUS_LABEL[e.to_status]}` : ""}
                {e.note ? <span className="block whitespace-pre-wrap">{e.note}</span> : null}
              </li>
            ))}
          </ol>
          <form action={bound(addNote)} className="flex gap-2 border-t border-line pt-3">
            <input name="note" required placeholder="নোট লিখুন · Add a note" className={`${INPUT} flex-1`} />
            <button className={BTN}>যোগ · Add</button>
          </form>
        </section>
      </div>
    </div>
  );
}
