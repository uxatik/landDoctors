import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations, setRequestLocale } from "next-intl/server";
import { preload } from "react-dom";
import { routing } from "@/i18n/routing";
import { SITE_URL } from "@/lib/seo";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Analytics } from "@/components/Analytics";
import { WhatsAppFloat } from "@/components/WhatsAppFloat";
import "@fontsource/hind-siliguri/400.css";
import "@fontsource/hind-siliguri/700.css";
import "../globals.css";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "site" });
  const tm = await getTranslations({ locale, namespace: "meta" });
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: tm("homeTitle"), template: `%s · ${t("name")}` },
    description: tm("homeDescription"),
    applicationName: t("name"),
  };
}

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#0E7563" };

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
  // Send the browser only the strings that client components use (smaller page, less parsing).
  const all = await getMessages();
  const clientMessages = { site: all.site, help: all.help, categories: all.categories };
  preload("/fonts/MonaSans-Regular-latin.woff2", { as: "font", type: "font/woff2", crossOrigin: "anonymous" });
  preload("/fonts/MonaSans-Bold-latin.woff2", { as: "font", type: "font/woff2", crossOrigin: "anonymous" });

  return (
    <html lang={locale}>
      <body className="flex min-h-dvh flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:rounded-control focus:bg-surface focus:p-2">
          {t("skipToContent")}
        </a>
        <NextIntlClientProvider messages={clientMessages}>
          <SiteHeader />
          <main id="main" className="w-full flex-1">
            {children}
          </main>
          <SiteFooter />
          <WhatsAppFloat />
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
