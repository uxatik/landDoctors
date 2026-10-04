import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getLegalDoc, isLegalSlug, LEGAL_DRAFT, LEGAL_SLUGS } from "@/lib/content/legal";
import { pageMeta } from "@/lib/seo";

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => LEGAL_SLUGS.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLegalSlug(slug)) return {};
  const tm = await getTranslations({ locale, namespace: "meta" });
  const ts = await getTranslations({ locale, namespace: "site" });
  const title = getLegalDoc(locale, slug).title;
  return pageMeta({ locale, path: `/legal/${slug}`, title, description: tm("legalDescription", { title }), index: !LEGAL_DRAFT, siteName: ts("name") });
}

export default async function LegalPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  if (!isLegalSlug(slug)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("legal");
  const doc = getLegalDoc(locale, slug);

  return (
    <article className="flex flex-col gap-6 pt-4">
      {LEGAL_DRAFT && (
        <p role="note" className="rounded-card border-2 border-warning bg-warning-soft p-3 font-semibold text-warning">
          {t("draft")}
          <span className="block text-sm font-normal text-ink">{t("draftNote")}</span>
        </p>
      )}
      <h1 className="text-[length:var(--text-2xl)] font-bold">{doc.title}</h1>
      {doc.sections.map((s) => (
        <section key={s.heading} className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">{s.heading}</h2>
          {s.paragraphs?.map((p) => (
            <p key={p}>{p}</p>
          ))}
          {s.bullets && (
            <ul className="list-disc pl-6">
              {s.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </article>
  );
}
