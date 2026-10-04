import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["bn", "en"],
  defaultLocale: "bn",
  localePrefix: "as-needed",
  // Bangla is always the default at "/", whatever the browser language.
  localeDetection: false,
  // The other language's address is declared in each page's own tags (lib/seo.ts), because some
  // pages exist in one language only.
  alternateLinks: false,
});

export type Locale = (typeof routing.locales)[number];
