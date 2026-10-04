import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { ContactButtons } from "@/components/ContactButtons";
import { CheckIcon } from "@/components/icons";
import { pageMeta } from "@/lib/seo";

type Params = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "abroad" });
  const ts = await getTranslations({ locale, namespace: "site" });
  return pageMeta({ locale, path: "/abroad", title: t("metaTitle"), description: t("description"), siteName: ts("name") });
}

/** For Bangladeshis living abroad. Says only what the rest of the site already promises. */
export default async function AbroadPage({ params }: Params) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("abroad");
  const num = (n: number) => new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en").format(n);

  return (
    <article className="flex flex-col gap-8 pt-4">
      <header className="flex flex-col gap-3">
        <p className="inline-flex w-fit rounded-full bg-accent-soft px-3 py-1 text-sm font-semibold text-accent">{t("eyebrow")}</p>
        <h1 className="text-[length:var(--text-2xl)] font-bold leading-tight sm:text-4xl">{t("title")}</h1>
        <p className="text-lg text-muted">{t("lede")}</p>
      </header>

      <ContactButtons message={t("whatsappText")} />

      <section aria-labelledby="can" className="flex flex-col gap-3">
        <h2 id="can" className="text-xl font-semibold">{t("canTitle")}</h2>
        <ul className="flex flex-col gap-2">
          {(t.raw("can") as string[]).map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-verified-soft text-verified"><CheckIcon className="size-4" /></span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="how" className="flex flex-col gap-3">
        <h2 id="how" className="text-xl font-semibold">{t("howTitle")}</h2>
        <ol className="flex flex-col gap-3">
          {(t.raw("how") as string[]).map((step, i) => (
            <li key={step} className="flex gap-3">
              <span aria-hidden="true" className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent">{num(i + 1)}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="pay" className="flex flex-col gap-2 rounded-panel bg-surface p-5 shadow-[var(--shadow-raised)]">
        <h2 id="pay" className="text-lg font-semibold">{t("payTitle")}</h2>
        <p>{t("payBody")}</p>
      </section>

      <section aria-labelledby="notes" className="flex flex-col gap-3 rounded-card bg-sunken p-5">
        <h2 id="notes" className="text-lg font-semibold">{t("notesTitle")}</h2>
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm">
          {(t.raw("notes") as string[]).map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
      </section>

      <Link href="/help" className="w-fit font-semibold text-accent no-underline hover:underline">{t("formCta")}</Link>
    </article>
  );
}
