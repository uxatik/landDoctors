import { formatPhoneDisplay, normalisePhone, toWhatsAppNumber } from "@/lib/phone";

/**
 * Paying by hand, used while online payment (PAYMENTS_ENABLED) is off: the offer page shows a bKash
 * number, the amount and the case number; the customer sends the transaction ID on WhatsApp and
 * staff record the payment in the admin page after checking it in bKash.
 *
 * BKASH_NUMBER is the number that receives the money. Until it is set, the WhatsApp number is used.
 * BKASH_ACCOUNT_TYPE says which bKash menu the customer must use: "personal" → Send Money,
 * "merchant" → Payment.
 */
export type ManualPayment = { number: string; display: string; type: "personal" | "merchant" };

export function manualPayment(
  env: { BKASH_NUMBER?: string; BKASH_ACCOUNT_TYPE?: string },
  whatsappE164: string,
): ManualPayment {
  let number = whatsappE164;
  if (env.BKASH_NUMBER) {
    const n = normalisePhone(env.BKASH_NUMBER);
    if (!n) throw new Error("BKASH_NUMBER is not a Bangladeshi mobile number");
    number = n;
  }
  return { number, display: formatPhoneDisplay(number), type: env.BKASH_ACCOUNT_TYPE === "merchant" ? "merchant" : "personal" };
}

/** WhatsApp link with the "I have paid, TrxID: …" message started for the customer. */
export function trxMessageLink(whatsappE164: string, text: string): string {
  return `https://wa.me/${toWhatsAppNumber(whatsappE164)}?text=${encodeURIComponent(text)}`;
}
