"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

export function LanguageToggle() {
  const t = useTranslations("site");
  const locale = useLocale();
  const pathname = usePathname();
  const other = locale === "bn" ? "en" : "bn";
  return (
    <Link
      href={pathname}
      locale={other}
      lang={other}
      aria-label={t("switchLanguageLabel")}
      className="inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-4 text-sm font-medium text-ink hover:border-accent"
    >
      {t("switchLanguage")}
    </Link>
  );
}
