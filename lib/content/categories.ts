export const CATEGORY_SLUGS = [
  "pre_purchase_check",
  "mutation",
  "survey",
  "inheritance",
  "record_correction",
  "dispute",
] as const;

export type CategorySlug = (typeof CATEGORY_SLUGS)[number];

/** Categories that need a field visit; only offered in the pilot areas. */
export const FIELD_CATEGORIES: readonly CategorySlug[] = ["pre_purchase_check", "survey"];

export function isCategory(value: unknown): value is CategorySlug {
  return typeof value === "string" && (CATEGORY_SLUGS as readonly string[]).includes(value);
}
