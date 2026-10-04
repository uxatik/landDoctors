import { getTranslations } from "next-intl/server";
import { publicEnv, serverEnv } from "@/lib/env";
import { formatTaka } from "@/lib/money";
import { manualPayment, trxMessageLink } from "@/lib/payments/manual";
import { ChatIcon } from "./icons";

/**
 * "Pay by bKash" block on the offer page while online payment is off: number, amount and case
 * number to use, then a WhatsApp button to send the transaction ID. Staff check it in bKash and
 * record the payment in the admin page.
 */
export async function ManualPayment({ caseRef, total, expires }: { caseRef: string; total: number; expires: string }) {
  const t = await getTranslations("offer");
  const pay = manualPayment(serverEnv(), publicEnv.NEXT_PUBLIC_WHATSAPP);
  const rows: [string, string, string][] = [
    [t("manual.number"), pay.display, "bkash-number"],
    [t("manual.amount"), formatTaka(total), "bkash-amount"],
    [t("manual.reference"), caseRef, "bkash-reference"],
  ];

  return (
    <section data-testid="offer-notice" aria-labelledby="manual-pay" className="flex flex-col gap-4 rounded-panel bg-surface p-4 shadow-[var(--shadow-raised)]">
      <div className="flex flex-col gap-1">
        <h2 id="manual-pay" className="text-lg font-semibold">{t("manualTitle")}</h2>
        <p>{t(pay.type === "merchant" ? "manual.introMerchant" : "manual.introPersonal")}</p>
      </div>
      <dl className="flex flex-col gap-2 rounded-card bg-sunken p-4">
        {rows.map(([label, value, id]) => (
          <div key={id} className="flex items-baseline justify-between gap-4">
            <dt className="text-sm text-muted">{label}</dt>
            <dd data-testid={id} dir="ltr" className="select-all text-lg font-bold text-ink">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-sm">{t("manual.after")}</p>
      <a
        href={trxMessageLink(publicEnv.NEXT_PUBLIC_WHATSAPP, t("manual.trxMessage", { ref: caseRef }))}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-[var(--tap-min)] items-center justify-center gap-2 rounded-full bg-accent px-4 font-semibold text-on-accent no-underline hover:bg-accent-hover"
      >
        <ChatIcon />
        <span>{t("manual.sendTrx")}</span>
      </a>
      <p className="text-sm text-muted">{t("manual.onlyThisNumber")}</p>
      <p className="text-sm text-muted">{t("expires", { date: expires })}</p>
    </section>
  );
}
