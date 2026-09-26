import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ContactButtons } from "@/components/ContactButtons";
import { CheckIcon } from "@/components/icons";
import { serverEnv } from "@/lib/env";
import { formatTaka } from "@/lib/money";
import { publicClient } from "@/lib/supabase/public";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type Offer = {
  ref: string; category: string; status: string;
  package_name_bn: string; package_name_en: string; scope_bn: string; scope_en: string;
  exclusions_bn: string; exclusions_en: string; delivery_days: number;
  service_price: number; govt_fees: number; govt_fees_note: string; total: number;
  consultant_name: string; consultant_role: string; consultant_areas: string[]; consultant_verified: boolean;
  expires_at: string; state: "open" | "expired" | "paid" | "price_unconfirmed";
};

const AREA_NAMES: Record<string, { bn: string; en: string }> = {
  savar: { bn: "সাভার", en: "Savar" },
  gazipur: { bn: "গাজীপুর", en: "Gazipur" },
};

export default async function OfferPage({ params }: { params: Promise<{ locale: string; token: string }> }) {
  const { locale, token } = await params;
  setRequestLocale(locale);
  if (!/^[A-Za-z0-9_-]{32,64}$/.test(token)) notFound();

  const supabase = publicClient();
  if (!supabase) notFound();
  const { data } = await supabase.rpc("get_offer", { p_token: token }).maybeSingle<Offer>();
  if (!data) notFound();

  const t = await getTranslations("offer");
  const bn = locale === "bn";
  const o = data;
  const paymentsOn = serverEnv().PAYMENTS_ENABLED === "true";
  const expires = new Intl.DateTimeFormat(bn ? "bn-BD" : "en-GB", { dateStyle: "long", timeZone: "Asia/Dhaka" }).format(
    new Date(o.expires_at),
  );
  const areas = o.consultant_areas.map((a) => AREA_NAMES[a]?.[bn ? "bn" : "en"] ?? a).join(", ");

  return (
    <div className="flex flex-col gap-6 pt-4">
      <div className="flex flex-col gap-1">
        <p className="text-sm text-muted">
          {t("caseLabel")} <span className="font-semibold tabular-nums text-ink" dir="ltr">{o.ref}</span>
        </p>
        <h1 className="text-[length:var(--text-2xl)] font-bold">{t("title")}</h1>
      </div>

      <section className="flex flex-col gap-3 rounded-panel border border-line bg-surface p-4" aria-labelledby="pkg">
        <h2 id="pkg" className="text-lg font-semibold">{bn ? o.package_name_bn : o.package_name_en}</h2>
        <div>
          <h3 className="text-sm font-semibold text-muted">{t("scope")}</h3>
          <p>{bn ? o.scope_bn : o.scope_en}</p>
        </div>
        {(bn ? o.exclusions_bn : o.exclusions_en) && (
          <div>
            <h3 className="text-sm font-semibold text-muted">{t("exclusions")}</h3>
            <p className="text-sm">{bn ? o.exclusions_bn : o.exclusions_en}</p>
          </div>
        )}
        <p className="text-sm">
          <span className="font-semibold text-muted">{t("delivery")}: </span>
          {o.delivery_days > 0 ? t("deliveryDays", { days: o.delivery_days }) : t("deliveryNow")}
        </p>

        <dl className="flex flex-col gap-1 border-t border-line pt-3 tabular-nums">
          <div className="flex justify-between gap-4">
            <dt>{t("servicePrice")}</dt>
            <dd>{formatTaka(o.service_price)}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt>
              {t("govtFees")}
              {o.govt_fees_note && <span className="block text-sm text-muted">{o.govt_fees_note}</span>}
            </dt>
            <dd>{formatTaka(o.govt_fees)}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-line pt-2 text-lg font-bold">
            <dt>{t("total")}</dt>
            <dd data-testid="offer-total">{formatTaka(o.total)}</dd>
          </div>
        </dl>
      </section>

      <section className="flex flex-col gap-1 rounded-panel border border-line bg-surface p-4" aria-labelledby="expert">
        <h2 id="expert" className="text-sm font-semibold text-muted">{t("expert")}</h2>
        <p className="text-lg font-semibold">{o.consultant_name}</p>
        <p className="text-sm">
          {t(`roles.${o.consultant_role}` as "roles.surveyor")}
          {areas && <> · {t("areas")}: {areas}</>}
        </p>
        {o.consultant_verified && (
          <p className="inline-flex w-fit items-center gap-1 rounded-full bg-verified-soft px-2 py-0.5 text-sm font-semibold text-verified">
            <CheckIcon className="size-4" /> {t("verified")}
          </p>
        )}
      </section>

      {o.state === "open" && paymentsOn && (
        <form action="/api/payments/init" method="post" className="flex flex-col gap-2">
          <input type="hidden" name="token" value={token} />
          <input type="hidden" name="locale" value={locale} />
          <button className="min-h-[var(--tap-min)] rounded-full bg-accent px-4 text-lg font-semibold text-on-accent hover:bg-accent-hover">
            {t("pay", { amount: formatTaka(o.total) })}
          </button>
          <p className="text-sm text-muted">{t("payNote")}</p>
          <p className="text-sm text-muted">{t("expires", { date: expires })}</p>
        </form>
      )}
      {o.state === "open" && !paymentsOn && <Notice title={t("manualTitle")} body={t("manualBody")} />}
      {o.state === "price_unconfirmed" && <Notice title={t("unconfirmedTitle")} body={t("unconfirmedBody")} />}
      {o.state === "expired" && <Notice title={t("expiredTitle")} body={t("expiredBody")} />}
      {o.state === "paid" && <Notice title={t("paidTitle")} body={t("paidBody")} tone="good" />}

      <p className="rounded-card bg-warning-soft p-3 text-sm">{t("cash")}</p>
      {o.state !== "paid" && <ContactButtons />}
      <Link href="/legal/refund" className="text-sm text-accent underline">{t("refundLink")}</Link>
    </div>
  );
}

function Notice({ title, body, tone }: { title: string; body: string; tone?: "good" }) {
  return (
    <section
      data-testid="offer-notice"
      className={`flex flex-col gap-1 rounded-card p-4 ${tone === "good" ? "bg-accent-soft" : "bg-sunken"}`}
    >
      <h2 className="text-lg font-semibold">{title}</h2>
      <p>{body}</p>
    </section>
  );
}
