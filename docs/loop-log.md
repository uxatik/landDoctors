# Loop log

## Loop 0 — Plan (26 Sep 2026)
- Installed 25 skills (frontend, React/Vercel, Supabase Postgres, superpowers, webapp-testing, Trail of Bits security).
- Wrote docs/plan.md (14 tasks) and docs/decisions.md.
- Environment: Docker registries blocked; DB tests use local Postgres 16 + Supabase shim (D6).

## Loop 1 — Task 1: scaffold (26 Sep 2026)
- Next.js 15.5, Tailwind v4 tokens, next-intl (bn at /, en at /en, no browser-language redirect), self-hosted Hind Siliguri.
- Tests: smoke E2E 8/8 (mobile 360×740 + desktop 1280×800).
- Deviation: env validation is lazy for server secrets (so the site builds before Supabase exists); public values validated at startup.

## Loop 2 — Task 2: database schema
- 12 tables, enums, bd_mobile domain, constraints, FK indexes, RLS on every table, all API-role privileges revoked.
- Found and fixed: `lpad` would truncate LD-10000 to LD-1000 → `private.next_case_ref()`.
- Tests: 01_schema ✓.

## Loop 3 — Task 3: public functions
- `submit_case`, `join_waitlist`: validation with field codes, Bangla-digit phone normalisation, 5/hour rate limit per hashed IP, idempotency key, created event.
- Deviation (D10): functions live in `public` schema (Supabase exposes it by default) instead of a separate `api` schema; every function has explicit revoke/grant.
- Tests: 02_public_api ✓ (incl. double tap, out-of-area → waiting list, rate limit, anon cannot read anything).

## Loop 4 — Task 4: staff RLS + workflow
- Staff counts only if active AND two-step verified (aal2). Operations read-only on prices/consultants/payouts/settings/staff.
- Workflow functions: change_case_status, assign_consultant (verified, active, not demo, no government in phase 1, conflict upazila, area coverage for field work), create_offer (price snapshot, only super admin can change price), get_offer (public, never returns phone), record_manual_payment (amount must match, once), record_refund, add_case_note. Audit event for every action.
- Tests: 03_rls ✓, 04_workflow ✓, unit workflow mirror ✓.

## Loop 5 — Task 5: home page
- Categories, contact (tel + wa.me, number as text), how it works, trust points, "no faster approval" note, mouza-map sketch as the one decorative element.
- Review fixes: WhatsApp label wrapped on 360px → shortened; sketch overlapped intro text on desktop → hero text padded.
- Tests: home E2E 10/10, axe: no serious/critical issues.

## Loop 6 — Task 6: intake form
- Shared zod validation, server action, error summary with links and focus, values kept after errors, honeypot, idempotency key per page view, CSS-only reveal of district + field-work note (works without JavaScript), thank-you page with case number or waiting-list message.
- Found and fixed: Next's route announcer also has role=alert → tests target #form-errors; error list order now matches field order.
- Tests: unit 35/35; intake E2E 14 passed, 4 skipped (need database).

## Loop 7 — Task 7: legal pages + footer
- Terms, refund, privacy, disclaimer in bn/en as plain data, DRAFT banner, footer with links and hotline.
- Tests: full E2E suite 50 passed, 4 skipped (database).

## Rubric (reviewer, after Loop 7)
Scope 5 · Correctness 4 (DB-backed flows not yet run end to end) · Security 5 · Usability 4 · Trust 5 · Design-system fidelity 4 (placeholder tokens) · Code quality 4 · Performance 4 (Lighthouse not yet run).
Open: connect Supabase and run DB E2E; Lighthouse; Designfoli tokens.

## Loop 8 — Tasks 8 & 9: staff login and case screens (26 Sep 2026)
- Supabase SSR auth, password + TOTP (enrol with QR, verify), gate order: signed in → aal2 → active staff. Middleware refreshes the session and marks /admin no-store, noindex.
- Case list (filters: status, area, date, case number) and case detail: details, status buttons (only allowed moves), consultant assignment (ineligible ones shown disabled with the reason), offer creation (price editable only by super admin), copy link + WhatsApp share, manual payment, refund with confirmation, notes, timeline with staff names.
- Added migration 0005 (event actor → staff FK) for names on the timeline.
- Tests: all /admin routes redirect to login without a session; headers; TOTP helper checked against RFC 6238. Sign-in E2E written, runs on the founder's Mac (E2E_DB=1).

## Loop 9 — Tasks 10 & 11: offer page and payments
- Offer page: package, scope, exclusions, delivery, service price and government fees on separate lines, total, consultant with verified badge, states open / price unconfirmed / expired / paid, "never pay cash", refund link, noindex.
- SSLCommerz sandbox behind PAYMENTS_ENABLED: amount always from the offer (begin_online_payment), paid only after SSLCommerz validation API + DB amount check (mark_offer_paid, service role only), idempotent for repeated IPN/return, other attempts closed, card data never stored.
- Tests: 05_payments SQL (wrong amount, double confirmation, second attempt after paid, unconfirmed price, roles), unit tests with fixtures (VALID/VALIDATED/failed/currency/amount format/risky/tran mismatch/network), E2E for result pages and switched-off gateway.

## Loop 10 — Task 12: other admin screens
- Consultants (create/edit, super admin only; government requires sanction ref), packages (price, share, days, price-confirmed), waiting list grouped by area, complaints (log + resolve, adds a note to the case), payouts (share + reimbursed government fees per consultant, mark paid).
- Tests: payout calculation unit tests.

## Loop 11 — Task 13: hardening and docs
- CSP and security headers on every response; analytics only when IDs are set; staff creation script; README; launch checklist; database update file for projects set up earlier (tested on top of the first setup).
- Production deploys now fail if the hotline/WhatsApp are placeholders or database keys are missing (found during QA: the placeholder number is built into pages when env vars are missing at build time).

## Loop 12 — Task 14: full QA
- Lighthouse mobile (simulated slow 4G): Home 91–95, Help 93, English home 92, privacy 99; accessibility 100 everywhere. Fix applied: dropped two unused font weights (≈150 KB less Bangla font).
- Security review: restricted payment redirect to sslcommerz.com; no secret names in client bundles; PostCSS advisory fixed with an override (npm audit: 0 vulnerabilities).
- Translation check: bn/en keys identical; no English left in Bangla strings.
- Totals: unit 61, database 7 suites, browser 92 passed / 10 skipped (need the founder's Supabase).

## Rubric (reviewer, after Loop 12)
Scope 5 · Correctness 4 (Supabase-backed browser flows still to run on the founder's Mac) · Security 5 · Usability 4 · Trust 5 · Design-system fidelity 4 (placeholder tokens) · Code quality 4 · Performance 5.

Known limitations
- Browser tests that need Supabase (form submit, staff sign-in, offer page with data) are written but run only on the founder's Mac: this workspace cannot reach supabase.co.
- CSP allows inline scripts (Next.js bootstrap); no user HTML is ever rendered, so the risk is low. Nonce-based CSP is a later improvement.
- Consultant share on payouts comes from the package's current share, not a snapshot at offer time.
- A forged "payment failed" POST can mark a pending attempt failed; a genuine SSLCommerz confirmation still marks it paid afterwards.
- Legal pages are drafts; prices are placeholders; design tokens are placeholders.
