const BANGLA_DIGITS = "০১২৩৪৫৬৭৮৯";

/** Converts Bangla digits (০–৯) to English digits; other characters are unchanged. */
export function toEnglishDigits(input: string): string {
  return input.replace(/[০-৯]/g, (d) => String(BANGLA_DIGITS.indexOf(d)));
}
