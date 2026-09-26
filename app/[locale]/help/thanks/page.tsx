import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ContactButtons } from "@/components/ContactButtons";

export const metadata: Metadata = { robots: { index: false } };

export default async function ThanksPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ref?: string; waitlist?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { ref, waitlist } = await searchParams;
  const t = await getTranslations("thanks");
  const validRef = typeof ref === "string" && /^LD-\d{4,}$/.test(ref) ? ref : null;
  const next = t.raw("next") as string[];

  return (
    <div className="flex flex-col gap-6 pt-6">
      {waitlist === "1" ? (
        <section className="flex flex-col gap-2">
          <h1 className="text-[length:var(--text-2xl)] font-bold">{t("waitlistTitle")}</h1>
          <p>{t("waitlistBody")}</p>
        </section>
      ) : validRef ? (
        <section className="flex flex-col gap-3">
          <h1 className="text-[length:var(--text-2xl)] font-bold">{t("title")}</h1>
          <div className="flex flex-col gap-1 rounded-lg border-2 border-accent bg-surface p-4">
            <span className="text-sm text-muted">{t("refLabel")}</span>
            <span className="text-2xl font-bold tracking-wide text-accent tabular-nums" dir="ltr">{validRef}</span>
            <span className="text-sm text-muted">{t("refHint")}</span>
          </div>
          <h2 className="pt-2 text-lg font-semibold">{t("nextTitle")}</h2>
          <ol className="list-decimal pl-6">
            {next.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </section>
      ) : (
        <section className="flex flex-col gap-2">
          <h1 className="text-[length:var(--text-2xl)] font-bold">{t("receivedTitle")}</h1>
          <p>{t("receivedBody")}</p>
        </section>
      )}
      <p className="rounded-md bg-warning-soft p-3 text-sm">{t("cashWarning")}</p>
      <ContactButtons />
      <Link href="/" className="text-accent underline">{t("home")}</Link>
    </div>
  );
}
