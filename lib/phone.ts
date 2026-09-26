import { toEnglishDigits } from "./digits";

const OPERATOR_PREFIX = "1[3-9]";

/**
 * Returns a Bangladeshi mobile number as +8801XXXXXXXXX, or null if it is not one.
 * Accepts Bangla digits, spaces, dashes, dots and brackets. Mirrors
 * private.normalise_phone() in supabase/migrations/0002_public_api.sql.
 */
export function normalisePhone(input: string): string | null {
  const d = toEnglishDigits(input).replace(/[\s\-().]/g, "");
  if (new RegExp(`^\\+880${OPERATOR_PREFIX}\\d{8}$`).test(d)) return d;
  if (new RegExp(`^880${OPERATOR_PREFIX}\\d{8}$`).test(d)) return `+${d}`;
  if (new RegExp(`^0${OPERATOR_PREFIX}\\d{8}$`).test(d)) return `+88${d}`;
  return null;
}

/** +8801711000001 → 01711-000001 */
export function formatPhoneDisplay(e164: string): string {
  const local = e164.replace(/^\+88/, "");
  return `${local.slice(0, 5)}-${local.slice(5)}`;
}

/** +8801711000002 → 8801711000002 (wa.me format) */
export function toWhatsAppNumber(e164: string): string {
  return e164.replace(/^\+/, "");
}
