import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LanguageToggle } from "./LanguageToggle";
import { LogoMark } from "./LogoMark";

const NAV = ["services", "pricing", "how", "faq"] as const;

export async function SiteHeader() {
  const t = await getTranslations("site");
  const tn = await getTranslations("nav");
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-[color-mix(in_srgb,var(--color-bg)_88%,transparent)] backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-[var(--container-max)] items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-ink no-underline">
          <LogoMark />
          {t("name")}
        </Link>
        <nav aria-label={tn("label")} className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((k) => (
              <li key={k}>
                <Link href={{ pathname: "/", hash: k }} className="rounded-full px-3 py-2 text-sm font-medium text-muted no-underline hover:bg-sunken hover:text-ink">
                  {tn(k)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="flex items-center gap-2">
          <LanguageToggle />
          <Link href="/help" className="hidden min-h-11 items-center rounded-full bg-accent px-4 text-sm font-semibold text-on-accent no-underline hover:bg-accent-hover sm:inline-flex">
            {tn("start")} →
          </Link>
        </div>
      </div>
    </header>
  );
}
