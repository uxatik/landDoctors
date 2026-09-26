import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LanguageToggle } from "./LanguageToggle";

export async function SiteHeader() {
  const t = await getTranslations("site");
  return (
    <header className="mx-auto flex w-full max-w-[var(--content-max)] items-center justify-between gap-4 px-4 py-3">
      <Link href="/" className="text-lg font-bold text-accent no-underline">
        {t("name")}
      </Link>
      <LanguageToggle />
    </header>
  );
}
