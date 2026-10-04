import en from "@/messages/en.json";
import { CATEGORY_SLUGS } from "@/lib/content/categories";
import { publicEnv } from "@/lib/env";
import { SERVICE_SLUG } from "@/lib/content/services";
import { absoluteUrl, SITE_URL } from "@/lib/seo";

export const dynamic = "force-static";

/**
 * /llms.txt: a plain-text summary of the business for AI assistants. Facts only, taken from the
 * same strings and settings the site itself uses, so it cannot drift from what the pages say.
 */
export function GET() {
  const pk = en.landing.pricing.packages;
  const price = (p: (typeof pk)[number]) => `- ${p.name}: ${p.from ? "from " : ""}BDT ${new Intl.NumberFormat("en").format(p.price)} (${p.where})`;
  const wa = publicEnv.NEXT_PUBLIC_WHATSAPP;
  const lines = [
    "# LandDoctor (ল্যান্ডডক্টর)",
    "",
    "> LandDoctor connects people in Bangladesh with verified land experts.",
    "> It is a private advisory service, not a government office and not a law firm,",
    "> and it does not speed up government work.",
    "",
    "## Services",
    ...CATEGORY_SLUGS.map((c) => `- [${en.categories[c].name}](${absoluteUrl("en", `/services/${SERVICE_SLUG[c]}`)}): ${en.categories[c].hint}`),
    "",
    "## Where",
    "- Field work: Savar and Gazipur",
    "- Consultation by phone or WhatsApp: anywhere in Bangladesh and abroad",
    "- Office: Mohammadpur, Dhaka",
    "",
    "## Prices",
    ...pk.map(price),
    "- The first 10 minutes of consultation are free",
    "- Government fees are separate",
    "- The final price is stated in a written proposal before any payment",
    "",
    "## How it works",
    ...en.landing.how.steps.map((s, i) => `${i + 1}. ${s.title}: ${s.body}`),
    "",
    "## Contact",
    `- WhatsApp: ${wa}`,
    `- Request form: ${absoluteUrl("en", "/help")}`,
    "",
    "## Pages",
    `- Home (Bangla): ${SITE_URL}`,
    `- Home (English): ${absoluteUrl("en", "/")}`,
    `- For Bangladeshis abroad: ${absoluteUrl("en", "/abroad")}`,
    `- Refund policy: ${absoluteUrl("en", "/legal/refund")}`,
    "",
  ];
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
