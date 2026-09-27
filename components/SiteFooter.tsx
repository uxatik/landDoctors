import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { CATEGORY_SLUGS } from "@/lib/content/categories";
import { LEGAL_SLUGS } from "@/lib/content/legal";
import { publicEnv } from "@/lib/env";
import { formatPhoneDisplay, toWhatsAppNumber } from "@/lib/phone";
import { LogoMark } from "./LogoMark";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const tx = await getTranslations("footerExtra");
  const ts = await getTranslations("site");
  const tn = await getTranslations("nav");
  const tc = await getTranslations("categories");
  const tContact = await getTranslations("contact");
  const hotline = publicEnv.NEXT_PUBLIC_HOTLINE;
  const whatsapp = publicEnv.NEXT_PUBLIC_WHATSAPP;
  const link = "text-muted no-underline hover:text-ink hover:underline";
  const head = "text-sm font-semibold text-ink";

  return (
    <footer className="bg-surface">
      <div className="mx-auto grid w-full max-w-[var(--container-max)] grid-cols-2 gap-x-6 gap-y-10 px-4 py-12 text-sm sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div className="col-span-2 flex flex-col gap-3 lg:col-span-1">
          <p className="flex items-center gap-2 text-lg font-bold text-ink">
            <LogoMark className="size-7" />
            {ts("name")}
          </p>
          <p className="text-muted">{tx("tagline")}</p>
          <p>
            {t("hotline")}:{" "}
            <a href={`tel:${hotline}`} className="font-semibold text-ink" dir="ltr">{formatPhoneDisplay(hotline)}</a>
          </p>
          <p>
            <a href={`https://wa.me/${toWhatsAppNumber(whatsapp)}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent no-underline hover:underline">
              {tContact("whatsapp")} →
            </a>
          </p>
          <p className="text-muted">{tx("areas")}</p>
        </div>
        <nav aria-labelledby="f-services" className="flex flex-col gap-3">
          <h2 id="f-services" className={head}>{tx("services")}</h2>
          <ul className="flex flex-col gap-2">
            {CATEGORY_SLUGS.map((s) => (
              <li key={s}><Link href={{ pathname: "/help", query: { category: s } }} className={link}>{tc(`${s}.name`)}</Link></li>
            ))}
          </ul>
        </nav>
        <nav aria-labelledby="f-company" className="flex flex-col gap-3">
          <h2 id="f-company" className={head}>{tx("company")}</h2>
          <ul className="flex flex-col gap-2">
            {(["how", "pricing", "faq"] as const).map((k) => (
              <li key={k}><Link href={{ pathname: "/", hash: k }} className={link}>{tn(k)}</Link></li>
            ))}
            <li><Link href="/help" className={link}>{tn("start")}</Link></li>
          </ul>
        </nav>
        <nav aria-labelledby="f-policies" className="flex flex-col gap-3">
          <h2 id="f-policies" className={head}>{tx("policies")}</h2>
          <ul className="flex flex-col gap-2">
            {LEGAL_SLUGS.map((slug) => (
              <li key={slug}><Link href={`/legal/${slug}`} className={link}>{t(slug)}</Link></li>
            ))}
          </ul>
        </nav>
      </div>
      <div>
        <p className="mx-auto w-full max-w-[var(--container-max)] px-4 pb-8 pt-2 text-sm text-muted sm:px-6">
          {t("note")} © {new Date().getFullYear()} {ts("name")}
        </p>
      </div>
    </footer>
  );
}
