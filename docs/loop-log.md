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
