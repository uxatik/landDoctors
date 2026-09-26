import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CATEGORY_SLUGS } from "@/lib/content/categories";
import { ContactButtons } from "@/components/ContactButtons";
import { MouzaSketch } from "@/components/MouzaSketch";
import { ArrowIcon, CheckIcon } from "@/components/icons";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const tc = await getTranslations("categories");
  const steps = t.raw("steps") as string[];
  const trust = t.raw("trust") as string[];

  return (
    <div className="flex flex-col gap-10 pt-4">
      <section aria-labelledby="home-title" className="relative flex flex-col gap-3 sm:pr-44">
        <MouzaSketch className="pointer-events-none absolute -right-4 -top-2 w-40 text-accent opacity-[0.10] sm:-right-8 sm:w-52 sm:opacity-[0.14]" />
        <p className="relative inline-flex w-fit items-center gap-2 rounded-full bg-accent-soft px-3 py-1 text-sm font-semibold text-accent">
          {t("serving")}
        </p>
        <h1 id="home-title" className="relative text-[length:var(--text-2xl)] font-bold">
          {t("title")}
        </h1>
        <p className="relative max-w-prose text-muted">{t("intro")}</p>
      </section>

      <section aria-labelledby="choose-title" className="flex flex-col gap-3">
        <h2 id="choose-title" className="text-lg font-semibold">
          {t("chooseLabel")}
        </h2>
        <ul className="grid grid-cols-1 gap-3 min-[400px]:grid-cols-2">
          {CATEGORY_SLUGS.map((slug) => (
            <li key={slug}>
              <Link
                href={{ pathname: "/help", query: { category: slug } }}
                className="group flex h-full min-h-[var(--tap-min)] flex-col gap-1 rounded-card border border-line bg-surface p-4 no-underline hover:border-accent"
              >
                <span className="flex items-start justify-between gap-2 font-semibold text-ink">
                  {tc(`${slug}.name`)}
                  <ArrowIcon className="mt-1 shrink-0 text-accent opacity-60 group-hover:opacity-100" />
                </span>
                <span className="text-sm text-muted">{tc(`${slug}.hint`)}</span>
              </Link>
            </li>
          ))}
        </ul>
        <p className="text-sm text-muted">{t("servingNote")}</p>
      </section>

      <section aria-labelledby="talk-title" className="flex flex-col gap-3 rounded-panel bg-sunken p-4">
        <h2 id="talk-title" className="text-lg font-semibold">
          {t("orTalk")}
        </h2>
        <ContactButtons />
      </section>

      <section aria-labelledby="how-title" className="flex flex-col gap-3">
        <h2 id="how-title" className="text-lg font-semibold">
          {t("howTitle")}
        </h2>
        <ol className="flex flex-col gap-3">
          {steps.map((s, i) => (
            <li key={s} className="flex gap-3">
              <span className="flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-accent text-sm font-bold text-accent tabular-nums" aria-hidden="true">
                {new Intl.NumberFormat(locale === "bn" ? "bn-BD" : "en").format(i + 1)}
              </span>
              <span className="pt-0.5">{s}</span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="trust-title" className="flex flex-col gap-3">
        <h2 id="trust-title" className="text-lg font-semibold">
          {t("trustTitle")}
        </h2>
        <ul className="flex flex-col gap-2">
          {trust.map((s) => (
            <li key={s} className="flex gap-2">
              <CheckIcon className="mt-1 shrink-0 text-accent" />
              <span>{s}</span>
            </li>
          ))}
        </ul>
        <p className="border-l-4 border-line pl-3 text-sm text-muted">{t("fasterNote")}</p>
      </section>
    </div>
  );
}
