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
