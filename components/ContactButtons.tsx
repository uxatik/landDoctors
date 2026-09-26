import { getTranslations } from "next-intl/server";
import { publicEnv } from "@/lib/env";
import { formatPhoneDisplay, toWhatsAppNumber } from "@/lib/phone";
import { ChatIcon, PhoneIcon } from "./icons";

export async function ContactButtons() {
  const t = await getTranslations("contact");
  const hotline = publicEnv.NEXT_PUBLIC_HOTLINE;
  const whatsapp = publicEnv.NEXT_PUBLIC_WHATSAPP;
  const waHref = `https://wa.me/${toWhatsAppNumber(whatsapp)}?text=${encodeURIComponent(t("whatsappText"))}`;
  const btn =
    "inline-flex min-h-[var(--tap-min)] items-center justify-center gap-2 rounded-md px-4 font-semibold no-underline";

  return (
    <div className="grid grid-cols-2 gap-3">
      <a href={`tel:${hotline}`} className={`${btn} bg-accent text-on-accent hover:bg-accent-hover`}>
        <PhoneIcon />
        <span>{t("call")}</span>
      </a>
      <a href={waHref} target="_blank" rel="noopener noreferrer" className={`${btn} border-2 border-accent text-accent hover:bg-accent-soft`}>
        <ChatIcon />
        <span>{t("whatsapp")}</span>
      </a>
      <p className="col-span-2 text-center text-sm text-muted">
        <span className="font-semibold tabular-nums text-ink" dir="ltr">
          {formatPhoneDisplay(hotline)}
        </span>
      </p>
    </div>
  );
}
