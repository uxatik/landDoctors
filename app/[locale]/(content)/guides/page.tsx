import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { GUIDES, guideDoc, isPublished, PUBLISHED_GUIDES } from "@/lib/content/guides";
import { pageMeta } from "@/lib/seo";

type Params = { params: Promise<{ locale: string }> };

/** Guides written in this language; reviewed ones first. */
function guidesFor(locale: string) {
  return GUIDES.filter((g) => guideDoc(g, locale)).sort((a, b) => Number(isPublished(b)) - Number(isPublished(a)));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "guide" });
  const ts = await getTranslations({ locale, namespace: "site" });
  // Until at least one guide in this language has been reviewed, the list stays out of search.
  const anyPublished = PUBLISHED_GUIDES.some((g) => guideDoc(g, locale));
  return pageMeta({ locale, path: "/guides", title: t("indexTitle"), description: t("indexDescription"), index: anyPublished, siteName: ts("name") });
}

export default async function GuidesPage({ params }: Params) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("guide");
  const guides = guidesFor(locale);

  return (
    <div className="flex flex-col gap-6 pt-4">
      <header className="flex flex-col gap-3">
        <p className="inline-flex w-fit rounded-full bg-accent-soft px-3 py-1 text-sm font-semibold text-accent">{t("eyebrow")}</p>
        <h1 className="text-[length:var(--text-2xl)] font-bold leading-tight sm:text-4xl">{t("indexTitle")}</h1>
        <p className="text-lg text-muted">{t("indexIntro")}</p>
      </header>
      <ul className="flex flex-col gap-3">
        {guides.map((g) => {
          const doc = guideDoc(g, locale)!;
          return (
            <li key={g.slug}>
              <Link href={`/guides/${g.slug}`} className="flex flex-col gap-1 rounded-panel bg-surface p-5 no-underline shadow-[var(--shadow-raised)] hover:text-accent">
                <span className="flex flex-wrap items-center gap-2">
                  <span className="text-lg font-semibold text-ink">{doc.title}</span>
                  {!isPublished(g) && <span className="rounded-full bg-warning-soft px-2 py-0.5 text-xs font-semibold text-warning">{t("draftBadge")}</span>}
                </span>
                <span className="text-sm text-muted">{doc.description}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
