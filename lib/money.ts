/** 8000 → "৳8,000" (English digits, see decisions D3). */
export function formatTaka(amount: number): string {
  return `৳${new Intl.NumberFormat("en-IN").format(amount)}`;
}
