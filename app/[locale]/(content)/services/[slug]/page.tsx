import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { CheckIcon } from "@/components/icons";
import { CATEGORY_SLUGS } from "@/lib/content/categories";
import { categoryFromServiceSlug, getServiceDoc, SERVICE_SLUG, SERVICE_SLUGS } from "@/lib/content/services";
import { absoluteUrl, pageMeta, SITE_URL } from "@/lib/seo";

type Params = { params: Promise<{ locale: string; slug: string }> };
type Step = { title: string; body: string };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => SERVICE_SLUGS.map((slug) => ({ locale, slug })));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  const category = categoryFromServiceSlug(slug);
  if (!category) return {};
  const doc = getServiceDoc(locale, category);
  const ts = await getTranslations({ locale, namespace: "site" });
  return pageMeta({ locale, path: `/services/${slug}`, title: doc.title, description: doc.description, siteName: ts("name") });
}

export default async function ServicePage({ params }: Params) {
  const { locale, slug } = await params;
  const category = categoryFromServiceSlug(slug);
  if (!category) notFound();
  setRequestLocale(locale);

  const t = await getTranslations("service");
  const tDocs = await getTranslations("help.docs");
  const tc = await getTranslations("categories");
  const tl = await getTranslations("landing");
  const doc = getServiceDoc(locale, category);
  const steps = tl.raw("how.steps") as Step[];
  const notes = [...doc.notes, ...(t.raw("commonNotes") as string[])];
  const facts: [string, string][] = [[t("price"), doc.price], [t("time"), doc.time], [t("area"), doc.area]];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: doc.title,
    description: doc.description,
    url: absoluteUrl(locale, `/services/${slug}`),
    provider: { "@id": `${SITE_URL}/#business` },
    areaServed: "Bangladesh",
  };

  return (
    <article className="flex flex-col gap-8 pt-4">
      <header className="flex flex-col gap-3">
        <p className="inline-flex w-fit rounded-full bg-accent-soft px-3 py-1 text-sm font-semibold text-accent">{t("eyebrow")}</p>
        <h1 className="text-[length:var(--text-2xl)] font-bold leading-tight sm:text-4xl">{doc.title}</h1>
        <p className="text-lg text-muted">{doc.lede}</p>
      </header>

      <dl className="flex flex-col gap-3 rounded-panel bg-surface p-5 shadow-[var(--shadow-raised)]">
        {facts.map(([label, value]) => (
          <div key={label} className="grid gap-1 sm:grid-cols-[7rem_1fr] sm:gap-4">
            <dt className="text-sm font-semibold text-muted">{label}</dt>
            <dd className="font-medium text-ink">{value}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="includes" className="flex flex-col gap-3">
        <h2 id="includes" className="text-xl font-semibold">{t("includesTitle")}</h2>
        <ul className="flex flex-col gap-2">
          {doc.includes.map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-verified-soft text-verified"><CheckIcon className="size-4" /></span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="documents" className="flex flex-col gap-3">
        <h2 id="documents" className="text-xl font-semibold">{t("documentsTitle")}</h2>
        <ul className="flex flex-wrap gap-2">
          {[...doc.documents.map((d) => tDocs(d)), ...(doc.extraDocuments ?? [])].map((d) => (
            <li key={d} className="rounded-full bg-sunken px-3 py-1 text-sm font-medium text-ink">{d}</li>
          ))}
        </ul>
        <p className="text-sm text-muted">{t("documentsNote")}</p>
      </section>

      <section aria-labelledby="steps" className="flex flex-col gap-3">
        <h2 id="steps" className="text-xl font-semibold">{t("stepsTitle")}</h2>
        <ol className="flex flex-col gap-3">
          {steps.map((s, i) => (
            <li key={s.title} className="flex gap-3">
              <span aria-hidden="true" className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent">{new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en").format(i + 1)}</span>
              <span className="flex flex-col">
                <span className="font-semibold text-ink">{s.title}</span>
                <span className="text-muted">{s.body}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="notes" className="flex flex-col gap-3 rounded-card bg-sunken p-5">
        <h2 id="notes" className="text-lg font-semibold">{t("notesTitle")}</h2>
        <ul className="flex list-disc flex-col gap-1.5 pl-5 text-sm">
          {notes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ul>
        <Link href="/legal/disclaimer" className="text-sm font-semibold text-accent">{t("disclaimerLink")}</Link>
      </section>

      <Link
        href={{ pathname: "/help", query: { category } }}
        className="inline-flex min-h-[var(--tap-min)] items-center justify-center rounded-full bg-accent px-6 text-lg font-semibold text-on-accent no-underline hover:bg-accent-hover"
      >
        {t("cta")}
      </Link>

      <nav aria-labelledby="other" className="flex flex-col gap-3">
        <h2 id="other" className="text-lg font-semibold">{t("otherTitle")}</h2>
        <ul className="flex flex-wrap gap-2">
          {CATEGORY_SLUGS.filter((c) => c !== category).map((c) => (
            <li key={c}>
              <Link href={`/services/${SERVICE_SLUG[c]}`} className="inline-flex min-h-11 items-center rounded-full bg-surface px-4 text-sm font-medium text-ink no-underline shadow-[var(--shadow-raised)] hover:text-accent">
                {tc(`${c}.name`)}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </article>
  );
}
