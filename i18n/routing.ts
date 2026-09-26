import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["bn", "en"],
  defaultLocale: "bn",
  localePrefix: "as-needed",
  // Bangla is always the default at "/", whatever the browser language.
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
