import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ContactButtons } from "@/components/ContactButtons";

export const metadata: Metadata = { robots: { index: false } };

const STATES = ["success", "fail", "cancel", "review", "error"] as const;
type State = (typeof STATES)[number];

export default async function PayResultPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string; ref?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;
  const status: State = (STATES as readonly string[]).includes(sp.status ?? "") ? (sp.status as State) : "error";
  const ref = sp.ref && /^LD-\d{4,}$/.test(sp.ref) ? sp.ref : null;
  const t = await getTranslations("payResult");

  return (
    <div className="flex flex-col gap-5 pt-6">
      <h1 className="text-[length:var(--text-2xl)] font-bold">{t(`${status}.title`)}</h1>
      <p>{t(`${status}.body`)}</p>
      {ref && (
        <p>
          {t("ref")}: <strong className="tabular-nums" dir="ltr">{ref}</strong>
        </p>
      )}
      <ContactButtons />
    </div>
  );
}
