import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link, redirect } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { getGuide, guideDoc, guideLocales, GUIDES, isPublished } from "@/lib/content/guides";
import { SERVICE_SLUG } from "@/lib/content/services";
import { absoluteUrl, pageMeta } from "@/lib/seo";

type Params = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => GUIDES.filter((g) => guideDoc(g, locale)).map((g) => ({ locale, slug: g.slug })));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale, slug } = await params;
  const guide = getGuide(slug);
  const doc = guide && guideDoc(guide, locale);
  if (!guide || !doc) return {};
  const ts = await getTranslations({ locale, namespace: "site" });
  return pageMeta({
    locale, path: `/guides/${slug}`, title: doc.title, description: doc.description,
    index: isPublished(guide), locales: guideLocales(guide), siteName: ts("name"),
  });
}

export default async function GuidePage({ params }: Params) {
  const { locale, slug } = await params;
  const guide = getGuide(slug);
  if (!guide) notFound();
  const doc = guideDoc(guide, locale);
  // Written in Bangla only: send English readers to the list of English guides.
  if (!doc) return redirect({ href: "/guides", locale });
  setRequestLocale(locale);

  const t = await getTranslations("guide");
  const tc = await getTranslations("categories");
  const published = isPublished(guide);
  const date = (iso: string) => new Intl.DateTimeFormat(locale === "bn" ? "bn-BD" : "en-GB", { dateStyle: "long" }).format(new Date(`${iso}T00:00:00Z`));
  const num = (n: number) => new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en").format(n);

  const jsonLd = published
    ? {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: doc.title,
        description: doc.description,
        inLanguage: locale,
        dateModified: guide.updated,
        mainEntityOfPage: absoluteUrl(locale, `/guides/${slug}`),
        author: { "@type": "Organization", name: "LandDoctor" },
        ...(guide.review ? { reviewedBy: { "@type": "Person", name: guide.review.by, jobTitle: guide.review.role } } : {}),
      }
    : null;

  return (
    <article className="flex flex-col gap-6 pt-4">
      {!published && (
        <div role="note" className="flex flex-col gap-2 rounded-card border-2 border-warning bg-warning-soft p-3">
          <p className="font-semibold text-warning">{t("draft")}</p>
          <p className="text-sm text-ink">{t("draftNote")}</p>
          {guide.reviewNotes.length > 0 && (
            <details className="text-sm text-ink">
              <summary className="cursor-pointer font-semibold">{t("reviewerTitle")}</summary>
              {/* Reviewer notes are written in Bangla for the experts who check the guides. */}
              <ul lang="bn" className="mt-2 flex list-disc flex-col gap-1 pl-5">
                {guide.reviewNotes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </details>
          )}
        </div>
      )}

      <header className="flex flex-col gap-3">
        <p className="inline-flex w-fit rounded-full bg-accent-soft px-3 py-1 text-sm font-semibold text-accent">{t("eyebrow")}</p>
        <h1 className="text-[length:var(--text-2xl)] font-bold leading-tight sm:text-4xl">{doc.title}</h1>
        <p className="text-lg text-muted">{doc.intro}</p>
        <p className="text-sm text-muted">
          {guide.review && (
            <>
              {t("reviewedBy", { name: guide.review.by, role: guide.review.role })} · {t("reviewedOn", { date: date(guide.review.on) })} ·{" "}
            </>
          )}
          {t("updated", { date: date(guide.updated) })}
        </p>
      </header>

      {doc.sections.map((s) => (
        <section key={s.heading} className="flex flex-col gap-2">
          <h2 className="text-xl font-semibold">{s.heading}</h2>
          {s.paragraphs?.map((p) => <p key={p}>{p}</p>)}
          {s.steps && (
            <ol className="flex flex-col gap-2">
              {s.steps.map((step, i) => (
                <li key={step} className="flex gap-3">
                  <span aria-hidden="true" className="flex size-7 shrink-0 items-center justify-center rounded-full bg-accent-soft text-sm font-bold text-accent">{num(i + 1)}</span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          )}
          {s.bullets && (
            <ul className="flex list-disc flex-col gap-1.5 pl-6">
              {s.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          )}
          {s.after?.map((p) => <p key={p}>{p}</p>)}
        </section>
      ))}

      <section aria-labelledby="guide-help" className="flex flex-col gap-3 rounded-panel bg-surface p-5 shadow-[var(--shadow-raised)]">
        <h2 id="guide-help" className="text-lg font-semibold">{t("helpTitle")}</h2>
        <p>{t("helpBody")}</p>
        <Link href={`/services/${SERVICE_SLUG[guide.service]}`} className="w-fit font-semibold text-accent no-underline hover:underline">
          {t("helpService", { service: tc(`${guide.service}.name`) })}
        </Link>
        <Link
          href={{ pathname: "/help", query: { category: guide.service } }}
          className="inline-flex min-h-[var(--tap-min)] items-center justify-center rounded-full bg-accent px-6 font-semibold text-on-accent no-underline hover:bg-accent-hover"
        >
          {t("helpCta")}
        </Link>
      </section>

      <section aria-labelledby="guide-sources" className="flex flex-col gap-2 text-sm">
        <h2 id="guide-sources" className="text-base font-semibold">{t("sourcesTitle")}</h2>
        <ul className="flex list-disc flex-col gap-1 pl-5">
          {guide.sources.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noopener noreferrer nofollow" className="text-accent underline">{s.label}</a>
            </li>
          ))}
        </ul>
        <p className="text-muted">{t("disclaimer")}</p>
      </section>

      <Link href="/guides" className="w-fit text-sm font-semibold text-accent no-underline hover:underline">← {t("allGuides")}</Link>

      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />}
    </article>
  );
}
