import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Analytics } from "@/components/Analytics";
import "@fontsource/hind-siliguri/400.css";
import "@fontsource/hind-siliguri/700.css";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site" });
  return { title: { default: `${t("name")} — ${t("tagline")}`, template: `%s · ${t("name")}` }, description: t("tagline") };
}

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#1d6a4c" };

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("site");

  return (
    <html lang={locale}>
      <body className="flex min-h-dvh flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:rounded-sm focus:bg-surface focus:p-2">
          {t("skipToContent")}
        </a>
        <NextIntlClientProvider>
          <SiteHeader />
          <main id="main" className="mx-auto w-full flex-1 max-w-[var(--content-max)] px-4 pb-12">
            {children}
          </main>
          <SiteFooter />
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
