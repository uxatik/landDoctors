import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LEGAL_SLUGS } from "@/lib/content/legal";
import { publicEnv } from "@/lib/env";
import { formatPhoneDisplay } from "@/lib/phone";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const ts = await getTranslations("site");
  const hotline = publicEnv.NEXT_PUBLIC_HOTLINE;
  return (
    <footer className="border-t border-line bg-sunken">
      <div className="mx-auto flex w-full max-w-[var(--content-max)] flex-col gap-3 px-4 py-6 text-sm">
        <nav aria-label={ts("name")}>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {LEGAL_SLUGS.map((slug) => (
              <li key={slug}>
                <Link href={`/legal/${slug}`} className="text-ink underline">
                  {t(slug)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p>
          {t("hotline")}:{" "}
          <a href={`tel:${hotline}`} className="font-semibold text-ink tabular-nums" dir="ltr">
            {formatPhoneDisplay(hotline)}
          </a>
        </p>
        <p className="text-muted">
          {t("note")} © {new Date().getFullYear()} {ts("name")}
        </p>
      </div>
    </footer>
  );
}
