import { getTranslations } from "next-intl/server";
import { callsEnabled, publicEnv } from "@/lib/env";
import { formatPhoneDisplay, toWhatsAppNumber } from "@/lib/phone";
import { ChatIcon, PhoneIcon } from "./icons";

/**
 * The page's own contact block. `message` replaces the default greeting, e.g. to include the
 * customer's case number. While incoming calls are off (lib/env.ts) it is a single WhatsApp button.
 * The floating WhatsApp button hides on pages that show this block (app/globals.css).
 */
export async function ContactButtons({ message }: { message?: string } = {}) {
  const t = await getTranslations("contact");
  const hotline = publicEnv.NEXT_PUBLIC_HOTLINE;
  const whatsapp = publicEnv.NEXT_PUBLIC_WHATSAPP;
  const waHref = `https://wa.me/${toWhatsAppNumber(whatsapp)}?text=${encodeURIComponent(message ?? t("whatsappText"))}`;
  const btn =
    "inline-flex min-h-[var(--tap-min)] items-center justify-center gap-2 rounded-full px-4 font-semibold no-underline";
  const filled = "bg-accent text-on-accent hover:bg-accent-hover";

  if (!callsEnabled)
    return (
      <div className="grid" data-own-contact>
        <a href={waHref} target="_blank" rel="noopener noreferrer" className={`${btn} ${filled}`}>
          <ChatIcon />
          <span>{t("whatsapp")}</span>
        </a>
      </div>
    );

  return (
    <div className="grid grid-cols-2 gap-3" data-own-contact>
      <a href={`tel:${hotline}`} className={`${btn} ${filled}`}>
        <PhoneIcon />
        <span>{t("call")}</span>
      </a>
      <a href={waHref} target="_blank" rel="noopener noreferrer" className={`${btn} border-2 border-accent text-accent hover:bg-accent-soft`}>
        <ChatIcon />
        <span>{t("whatsapp")}</span>
      </a>
      <p className="col-span-2 text-center text-sm text-muted">
        <span className="font-semibold text-ink" dir="ltr">
          {formatPhoneDisplay(hotline)}
        </span>
      </p>
    </div>
  );
}
