import { getTranslations } from "next-intl/server";
import { publicEnv } from "@/lib/env";
import { toWhatsAppNumber } from "@/lib/phone";
import { ChatIcon } from "./icons";

/**
 * WhatsApp button that stays in the bottom-right corner of every public page.
 * Its position and the two exceptions (above the phone action bar; hidden where a page has its
 * own case-number WhatsApp button) are plain CSS in app/globals.css, so it needs no JavaScript.
 */
export async function WhatsAppFloat() {
  const t = await getTranslations("contact");
  const href = `https://wa.me/${toWhatsAppNumber(publicEnv.NEXT_PUBLIC_WHATSAPP)}?text=${encodeURIComponent(t("whatsappText"))}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-wa-float
      className="fixed right-4 z-40 inline-flex min-h-[var(--tap-min)] items-center gap-2 rounded-full bg-chat px-4 font-semibold text-ink no-underline shadow-[var(--shadow-lg-light)] transition-[background-color,transform] duration-150 ease-out hover:bg-chat-hover active:scale-[0.98] sm:right-6 print:hidden"
    >
      <ChatIcon />
      <span>{t("whatsapp")}</span>
    </a>
  );
}
