# Decisions log

Each entry: what was decided, why, and what would change it.

## D1 — Anonymous visitors call functions, never tables (26 Sep 2026)
Anonymous users get `execute` on three `security definer` functions (`submit_case`, `join_waitlist`, `get_offer`) and no table privileges at all. This keeps customer phone numbers unreadable from the browser even if a policy is written wrong, and puts validation and rate limiting in one place.

## D2 — Money in whole taka integers (26 Sep 2026)
Prices and fees are `integer` taka. No paisa is needed for these services and integers avoid rounding bugs.

## D3 — English digits for prices and phone numbers; Bangla digits accepted as input (26 Sep 2026)
Most Bangladeshi apps show prices and numbers with English digits, and they are easier to copy into bKash. Every numeric input converts ০–৯ to 0–9. Revisit after user testing.

## D4 — Self-hosted Bangla font (26 Sep 2026)
Hind Siliguri via Fontsource (npm), not a runtime Google Fonts request: faster on slow connections, no third-party call, and the build does not depend on Google being reachable.

## D5 — Placeholder design tokens until Designfoli arrives (26 Sep 2026)
Token names follow a common structure (`--color-bg`, `--color-surface`, `--color-text`, `--color-muted`, `--color-accent`, `--color-accent-contrast`, `--color-success/warning/danger`, `--font-body`, `--space-*`, `--radius-*`). Placeholder palette: deep field green accent `#1D6A4C` on off-white `#F7F9F6`, ink `#16231D`, with gold `#9A6B12` for the verified badge, taken from the approved screen sketches. When the Designfoli export arrives, its values replace these and any colour override is recorded here.

## D6 — Database tests run on local Postgres 16 with a Supabase shim (26 Sep 2026)
Docker registries are blocked in the build workspace, so a full local Supabase stack cannot run. Migrations and RLS are tested on a throwaway Postgres 16 cluster with the same roles (`anon`, `authenticated`, `service_role`) and `auth.uid()` / `auth.jwt()` reading `request.jwt.claims`, which is how Supabase implements them. Flows that need Supabase Auth or its API run against the founder's free Supabase dev project.

## D7 — Staff must be two-step verified for any data access (26 Sep 2026)
RLS checks the JWT `aal = 'aal2'`, so a stolen password alone cannot read cases.

## D8 — Field work only in the pilot areas; phone sessions anywhere (26 Sep 2026)
From the brief: surveys and land health reports only in Savar and Gazipur; other areas go to the waiting list. A 30-minute phone session is accepted from anywhere, so non-field categories from "Other" still create a case.

## D9 — Unconfirmed prices cannot be paid (26 Sep 2026)
Packages are seeded with the brief's starting prices and `price_confirmed = false`. The offer page shows "call us to confirm" instead of a Pay button until the super admin confirms real prices.

## D11 — Designfoli installed, light theme, with Bangla and contrast adjustments (27 Sep 2026)
Designfoli (`.claude/skills/designfoli/`) is the design system. `styles/designfoli.css` is its CSS with font paths changed from `fonts/` to `/fonts/` (fonts in `public/fonts/`), imported in the base CSS layer so page-level Tailwind classes can size headings. `design/tokens.css` maps our token names onto Designfoli variables; no new hex values.
- Light theme, not the dark signature: most visitors read Bangla on cheap phones in daylight; light is easier to read.
- Mona Sans has no Bangla letters, so the stack is Mona Sans → Hind Siliguri. Bangla headings get normal letter-spacing and body line-height 1.6.
- White on primary-500 is 4.4:1 (just under AA), so filled buttons and links use primary-600. Success, warning and error text use darker shades of Designfoli's own colours (`color-mix` with black) to reach AA.
- Pill buttons, 12px cards, 8px inputs, "→" on the two main CTAs. Phone numbers use normal digits (fixed-width digits looked like a code font).

## D12 — Landing page modelled on Attio's structure, built from Designfoli (27 Sep 2026)
The founder picked Attio's page as the style reference. Structure borrowed: centred hero with a product "screenshot", a logo-style strip, bento feature grids, a dark section, a gradient call-to-action band, a four-column footer.
- **Product visuals are HTML, not images.** Designfoli rules out photos and illustrations, and a real offer card says more than a picture: it shows the price split and the verified expert. It also costs a few KB instead of hundreds on a slow phone connection. Every mock is labelled "Sample" and hidden from screen readers.
- **No testimonials or client logos.** We have no customers yet, and made-up reviews are not allowed. The logo strip lists the land papers we work with; trust comes from the safety section and the FAQ.
- **What goes up front** (from the research): no middlemen, prices before you commit, government fees separate, first 10-minute call free, no cash in hand, pilot areas, and a section for people living abroad.
- **Prices on the page are the brief's starting prices** (৳1,000 / from ৳6,000 / from ৳8,000). They must be confirmed before launch (launch checklist).
- New tokens, all derived from Designfoli: `--gradient-brand-deep` (white text passes AA on it), `--gradient-brand-text`, `--container-max`. The safety section uses Designfoli's own dark theme (`data-theme="dark"`).
- Phones get a sticky bottom bar with Call and Tell us your problem.
- Speed: Mona Sans now loads as small Latin-only WOFF2 files (about 25 KB each, the TTFs stay as fallback) with `font-display: swap`; client components get only the strings they use. Lighthouse mobile: 85–96 across runs, accessibility 100, SEO 100.

## D13 — Brand colour: deep teal instead of Designfoli violet (27 Sep 2026)
The founder compared violet, deep teal and trust blue on the real page and chose teal: it reads as land and trust, not "tech app", and stays apart from government green, bKash pink and Nagad orange.
Only the hue changed: the Designfoli primary scale, gradient partner, glow and shadow tints are overridden in the first block of `design/tokens.css` (the only place brand hex values live). Contrast: white on primary-600 5.6:1, primary-600 on white 5.6:1, on the soft tint 5.0:1, primary-300 on the dark section 10.6:1 — all AA. `CLAUDE.md` records the override so future UI work uses teal.

## D14 — "What is your land problem?" moves into the hero (27 Sep 2026)
Founder feedback: the first build was more actionable because the problem list came first. The six problem cards now sit directly under the headline, with call/WhatsApp and the three promises right after, so a visitor can act on the first screen. The offer sample moved down into the pricing section ("The offer you get after the free call"), and "How it works" now comes before pricing.

## D15 — Floating WhatsApp button uses the system green (4 Oct 2026)
The floating button must be seen on light, teal and navy sections, and must not compete with the teal "Tell us" button. It uses Designfoli's success green (`--color-success`, exposed as `--color-chat`) with dark text (about 9:1; white text on that green would fail AA), a chat-bubble icon and the word "WhatsApp". This is the one place a second colour is used for a button; no new hex value was added.
