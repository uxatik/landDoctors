# LandDoctor Phase 1 — Implementation Plan

> For agentic workers: use superpowers:executing-plans. Each task runs the loop PLAN → TEST → BUILD → VERIFY → REVIEW → FIX → LOG. Steps use checkboxes.

**Goal:** A mobile-first, Bangla-first website where people in Savar and Gazipur submit a land problem, operations turn it into a fixed-price offer with a verified consultant, and the customer pays online. Staff run everything from a protected admin area.

**Architecture:** Next.js App Router renders public pages on the server with very little client JavaScript. Supabase provides Postgres, staff login with two-step verification, and row-level security. Anonymous visitors never touch tables directly; they can only call three narrow database functions. Staff use table access guarded by role policies. Payments go through SSLCommerz, with every amount read from the database and every callback validated with SSLCommerz from the server.

**Tech stack:** Next.js 15 (App Router, TypeScript strict), Tailwind CSS v4 (tokens in CSS `@theme`), next-intl (bn default, en), `@supabase/ssr` + `@supabase/supabase-js`, zod, Fontsource Hind Siliguri (self-hosted), Vitest, Playwright + `@axe-core/playwright`, Postgres 16 for local database tests.

**Spec:** `docs/project-brief.md` (Phase 1 only), `docs/research-summary.md`, `design/` (Designfoli tokens, pending).

## Global constraints

- Phase 1 scope only. Nothing from Phase 2 or 3.
- Bangla is the default language at `/`; English at `/en`. Every string exists in both `messages/bn.json` and `messages/en.json`.
- Prices and phone numbers use English digits: `৳8,000`, `01712-345678`. Inputs also accept Bangla digits (০–৯) and convert them.
- Money is stored as whole taka in `integer` columns. No floating point.
- Pilot areas: `savar`, `gazipur`. Anything else goes to the waiting list for field work.
- Case reference format: `LD-0001` (4+ digits, from a sequence).
- Case statuses: `new → triage_done → offer_sent → paid → in_progress → delivered → closed`, plus `cancelled` and `refunded`.
- Roles: `operations`, `super_admin`. Customers and consultants have no login in Phase 1.
- Operations cannot change prices, payouts or consultant approval.
- Only verified, active, private consultants can be assigned in Phase 1. A consultant cannot be assigned a case in an upazila listed in their `conflict_upazilas`.
- No document uploads. No NID storage. No consultant phone numbers on public pages.
- Official government fees are always shown separately from the service price.
- Copy never promises faster approval or outcomes.
- Legal pages carry a visible "খসড়া – আইনজীবীর পর্যালোচনা প্রয়োজন / DRAFT – needs lawyer review" banner.
- Package prices are seeded as placeholders and flagged `price_confirmed = false`; the offer page will not show a pay button for unconfirmed prices.
- Secrets live only in server code and `.env.local`. Nothing secret is prefixed `NEXT_PUBLIC_`.
- Payments run in SSLCommerz sandbox, behind `PAYMENTS_ENABLED`. Going live is the founder's decision.
- Pages target Lighthouse mobile ≥ 90 for performance and accessibility; WCAG AA contrast.

## Review focus

1. **Phone numbers in every real format:** `01712345678`, `01712-345678`, `+8801712345678`, `8801712345678`, Bangla digits `০১৭১২৩৪৫৬৭৮`. All normalise to `+8801712345678`; landlines and short numbers are rejected with a Bangla message. Tested in Task 6 (unit) and Task 3 (SQL).
2. **Double submission:** double-tapping Submit on a slow 3G connection or a repeated SSLCommerz IPN must create one case and one payment. Tested in Task 3 (idempotency key) and Task 11 (IPN replay).
3. **Tampered payments:** a callback with a changed amount, currency or `tran_id`, or one SSLCommerz does not confirm, never marks a case paid. Tested in Task 11.
4. **Stale or reused offer links:** an expired offer, a paid offer, or an offer whose package price changed afterwards shows the right state and the price that was offered. Tested in Tasks 4 and 10.
5. **Out-of-area field work:** choosing Field survey or Land health report with area "Other" goes to the waiting list, not a case; a 30-minute session from anywhere becomes a case. Tested in Task 3 and Task 6.

---

## File structure

```
app/
  [locale]/
    layout.tsx                 locale layout, fonts, header/footer
    page.tsx                   Home
    help/page.tsx              Intake form
    help/thanks/page.tsx       Confirmation
    offer/[token]/page.tsx     Offer page
    pay/result/page.tsx        Payment success/fail/cancel
    legal/[slug]/page.tsx      terms, refund, privacy, disclaimer
  admin/                       staff area (English + Bangla labels, no locale prefix)
    login/page.tsx
    mfa/page.tsx
    layout.tsx                 session + aal2 + role gate
    cases/page.tsx
    cases/[id]/page.tsx
    consultants/page.tsx       super_admin edit, operations read
    packages/page.tsx          super_admin only
    waitlist/page.tsx
    complaints/page.tsx
    payouts/page.tsx
  api/payments/
    init/route.ts
    ipn/route.ts
    return/route.ts            success/fail/cancel POST-backs
components/                    small UI pieces (Button, Field, CategoryCard, StatusPill…)
lib/
  env.ts                       zod-validated env, server/public split
  phone.ts                     normalisePhone()
  digits.ts                    toEnglishDigits()
  money.ts                     formatTaka()
  validation/intake.ts         intakeSchema (shared client/server)
  supabase/server.ts           server client (cookies), service client (server-only)
  supabase/public.ts           rpc helpers for anon functions
  cases/workflow.ts            allowedTransitions (mirrors SQL)
  payments/sslcommerz.ts       initSession(), validatePayment()
  rate-limit.ts                hashIp()
messages/bn.json, messages/en.json
design/tokens.css              Designfoli tokens (placeholder until provided)
app/globals.css                Tailwind v4 @theme mapping tokens
supabase/migrations/*.sql
supabase/seed.sql              three packages (placeholder prices), demo consultants flagged demo
tests/unit/*.test.ts           Vitest
tests/db/*.sql                 SQL tests (run by scripts/db-test.sh)
tests/db/00_supabase_shim.sql  anon/authenticated/service_role roles, auth.uid(), auth.jwt()
tests/e2e/*.spec.ts            Playwright
scripts/db-test.sh             throwaway Postgres 16 cluster → shim → migrations → tests
docs/plan.md, decisions.md, loop-log.md, launch-checklist.md
```

## Data model (SQL summary)

Enums: `case_status`, `area` (`savar`,`gazipur`,`other`), `problem_category` (`pre_purchase_check`,`mutation`,`survey`,`inheritance`,`record_correction`,`dispute`), `contact_pref` (`call`,`whatsapp`), `employment_status` (`private`,`government_sanctioned`), `consultant_role` (`surveyor`,`retired_official`,`advocate`,`deed_writer`), `staff_role` (`operations`,`super_admin`), `payment_status` (`pending`,`paid`,`failed`,`refunded`), `payment_method` (`sslcommerz`,`manual_bkash`,`manual_nagad`,`manual_bank`,`manual_cash_office`).

| Table | Key columns |
|---|---|
| `cases` | `id bigint identity`, `ref text unique` (LD-0001), `created_at`, `category`, `area`, `upazila text`, `mouza text null`, `documents text[]`, `description text (≤1000)`, `customer_name text (≤80)`, `customer_phone text` (+8801…), `contact_pref`, `status case_status default 'new'`, `consultant_id → consultants`, `idempotency_key uuid unique` |
| `offers` | `id`, `case_id → cases`, `package_id → packages`, `token text unique` (32 random bytes, base64url), `service_price int`, `govt_fees int`, `govt_fees_note text`, `consultant_id`, `expires_at` (+7 days), `created_by → staff`, `paid_at null`. Price is a snapshot. One open offer per case (partial unique index). |
| `packages` | `id`, `slug`, `name_bn`, `name_en`, `scope_bn/en`, `exclusions_bn/en`, `delivery_days int`, `base_price int`, `consultant_share_pct int (0–100)`, `field_work bool`, `price_confirmed bool default false`, `active` |
| `consultants` | `id`, `name`, `role`, `employment_status`, `sanction_ref text null` (required if government), `conflict_upazilas text[]`, `areas area[]`, `upazilas text[]`, `specialities text[]`, `languages text[]`, `phone`, `payout_account text`, `share_pct`, `verified bool`, `active bool`, `is_demo bool` |
| `payments` | `id`, `case_id`, `offer_id`, `amount int`, `method`, `tran_id text unique`, `gateway_val_id text null`, `status`, `verified_at`, `recorded_by → staff null`, `raw jsonb` (gateway fields minus card data) |
| `payouts` | `id`, `consultant_id`, `period_start`, `period_end`, `amount int`, `case_ids bigint[]`, `paid_at`, `recorded_by` |
| `waitlist` | `id`, `created_at`, `district text`, `upazila text`, `category`, `phone`, `idempotency_key unique` |
| `complaints` | `id`, `case_id null`, `phone`, `description`, `status` (`open`,`resolved`), `resolution text`, `created_at` |
| `staff` | `user_id uuid pk → auth.users`, `name`, `role staff_role`, `active` |
| `case_events` | `id`, `case_id`, `at`, `actor uuid`, `kind` (`status`,`assign`,`offer`,`payment`,`note`), `from_status`, `to_status`, `note text` — append-only audit |
| `rate_limits` | `ip_hash text`, `bucket text`, `window_start`, `count` |
| `settings` | `key text pk`, `value jsonb` — e.g. `allow_government_consultants=false`, `hotline`, `whatsapp` |

Indexes: every foreign key; `cases(status, created_at desc)`; `cases(area)`; `offers(token)`; `payments(tran_id)`.

## Security model (RLS)

- `revoke all` on all tables from `anon`, `authenticated`, `public`. RLS enabled on every table.
- **Anonymous** gets `execute` on exactly three `security definer` functions in schema `api`: `submit_case(...)`, `join_waitlist(...)`, `get_offer(token)`. Each validates input, applies rate limiting, sets `search_path = ''`, and returns only what the page needs (`get_offer` never returns the customer's phone or internal notes).
- **Staff** helper `private.staff_role()` returns the caller's role only if `auth.uid()` is in `staff`, `active`, and the JWT `aal = 'aal2'` (two-step verified). Policies wrap it as `(select private.staff_role())`.
- Operations: select all operational tables; update `cases` (status and assignment only through workflow functions), insert `case_events`, `offers`, manual `payments`, update `complaints`.
- Super admin: all of the above plus insert/update `consultants`, `packages`, `payouts`, `settings`, `staff`.
- Workflow functions (`api.change_case_status`, `api.assign_consultant`, `api.create_offer`, `api.record_manual_payment`, `api.record_refund`) enforce transitions, eligibility and the conflict rule, and write `case_events`.
- The payment IPN and return routes use the service-role key on the server only, and call `api.mark_offer_paid(tran_id, val_id, amount)`, which is granted to `service_role` only.

---

## Tasks

### Task 1: Project scaffold, tokens and locales

**Files:** `package.json`, `next.config.ts`, `tsconfig.json`, `app/globals.css`, `design/tokens.css`, `i18n/routing.ts`, `i18n/request.ts`, `middleware.ts`, `messages/bn.json`, `messages/en.json`, `app/[locale]/layout.tsx`, `app/[locale]/page.tsx` (stub), `playwright.config.ts`, `vitest.config.ts`, `tests/e2e/smoke.spec.ts`, `.env.example`, `.gitignore`, `lib/env.ts`.

**Produces:** `npm run check` (typecheck + lint + unit + db tests), `npm run e2e`; CSS variables `--color-*`, `--font-*`, `--space-*`, `--radius-*` from `design/tokens.css`; `getTranslations`/`useTranslations` for `bn`/`en`.

- [ ] Write `tests/e2e/smoke.spec.ts`: `/` has `<html lang="bn">` and the Bangla site name; `/en` has `lang="en"`; language toggle switches between them; viewport 360×740 has no horizontal scroll.
- [ ] Run → fails (no app).
- [ ] Scaffold Next.js 15 + TS strict + Tailwind v4 + next-intl (`localePrefix: 'as-needed'`, default `bn`) + Fontsource Hind Siliguri 400/500/600/700 with system fallback. Placeholder tokens in `design/tokens.css` (see decisions D5).
- [ ] `lib/env.ts`: zod schema; throws at build if a required server var is missing; `PUBLIC_*` subset exported separately.
- [ ] Run smoke tests at 360×740 and 1280×800 → pass. Commit.

### Task 2: Database foundation and local test harness

**Files:** `supabase/migrations/0001_schema.sql`, `tests/db/00_supabase_shim.sql`, `tests/db/01_schema.test.sql`, `scripts/db-test.sh`.

**Produces:** all tables, enums, constraints and indexes above; `npm run test:db`.

- [ ] Write `01_schema.test.sql`: inserting a case with phone `017123` fails the check constraint; `consultant_share_pct = 120` fails; a government consultant without `sanction_ref` fails; `ref` of the first case is `LD-0001`; every table has RLS enabled (query `pg_class.relrowsecurity`).
- [ ] Run `scripts/db-test.sh` → fails (no migration).
- [ ] Write the migration; `ref` default `'LD-' || lpad(nextval('case_ref_seq')::text, 4, '0')`.
- [ ] Run → pass. Commit.

### Task 3: Public database functions (submit, waitlist) with rate limiting

**Files:** `supabase/migrations/0002_public_api.sql`, `tests/db/02_public_api.test.sql`.

**Interfaces — produces:**
- `api.submit_case(p_category, p_area, p_upazila, p_mouza, p_documents text[], p_description, p_name, p_phone, p_contact_pref, p_idempotency_key uuid, p_ip_hash text) returns table(ref text, outcome text)` where `outcome ∈ ('case','waitlist')`.
- `api.join_waitlist(p_district, p_upazila, p_category, p_phone, p_idempotency_key, p_ip_hash) returns void`.

- [ ] Tests, run as role `anon`: `select * from cases` raises permission denied; `submit_case` with area `savar` returns `('LD-0001','case')`; same `idempotency_key` twice returns the same ref and one row; category `survey` with area `other` returns `outcome = 'waitlist'` and creates no case; category `mutation` session-style request with area `other` returns `case` (phone sessions allowed anywhere, per brief) — field categories are `survey` and `pre_purchase_check`; phone `০১৭১২৩৪৫৬৭৮` stored as `+8801712345678`; 6th submission from one `ip_hash` within 1 hour raises `rate_limited`; description over 1000 chars rejected.
- [ ] Run → fail. Implement. Run → pass. Commit.

### Task 4: Staff roles, RLS policies and workflow functions

**Files:** `supabase/migrations/0003_staff_rls.sql`, `supabase/migrations/0004_workflow.sql`, `tests/db/03_rls.test.sql`, `tests/db/04_workflow.test.sql`, `lib/cases/workflow.ts`, `tests/unit/workflow.test.ts`.

**Interfaces — produces:**
- `api.change_case_status(p_case_id bigint, p_to case_status, p_note text) returns void`
- `api.assign_consultant(p_case_id bigint, p_consultant_id bigint) returns void`
- `api.create_offer(p_case_id bigint, p_package_id bigint, p_service_price int, p_govt_fees int, p_govt_fees_note text) returns text` (the token)
- `api.get_offer(p_token text) returns table(ref, category, package_name_bn, package_name_en, scope_bn, scope_en, delivery_days, service_price, govt_fees, govt_fees_note, consultant_name, consultant_role, consultant_areas, verified, state)` with `state ∈ ('open','expired','paid','price_unconfirmed')`
- `api.record_manual_payment(p_case_id, p_amount int, p_method payment_method, p_reference text) returns void`
- `api.record_refund(p_case_id, p_note text) returns void`
- `lib/cases/workflow.ts`: `allowedTransitions: Record<CaseStatus, CaseStatus[]>` identical to SQL.

- [ ] RLS tests with claims set via shim: operations with `aal1` sees nothing; operations `aal2` can select cases and cannot update `packages`, `consultants`, `payouts` or `settings`; super_admin `aal2` can; inactive staff sees nothing; anon still sees nothing.
- [ ] Workflow tests: `new → paid` rejected; `new → triage_done → offer_sent` allowed; assigning an unverified, inactive, government or demo consultant rejected; assigning a consultant whose `conflict_upazilas` contains the case upazila rejected; `create_offer` moves status to `offer_sent`, snapshots price, and a second open offer for the same case is rejected; `get_offer` on expired token returns `state='expired'`, on unknown token returns zero rows; changing `packages.base_price` after the offer leaves `get_offer.service_price` unchanged; every call writes a `case_events` row.
- [ ] Unit test: `allowedTransitions` equals the SQL transition list (fixture exported from migration comment).
- [ ] Run → fail. Implement. Run → pass. Commit.

### Task 5: Home page

**Files:** `app/[locale]/page.tsx`, `components/CategoryCard.tsx`, `components/ContactButtons.tsx`, `components/SiteHeader.tsx`, `components/SiteFooter.tsx`, messages, `tests/e2e/home.spec.ts`.

- [ ] E2E: heading "আপনার জমির সমস্যা কী?"; six category links each go to `/help?category=<slug>`; Call button `href="tel:+880…"` and number visible as text; WhatsApp link to `https://wa.me/880…`; "এখন সেবা দিচ্ছি: সাভার ও গাজীপুর" visible; axe finds no serious/critical violations; no horizontal scroll at 360px; English version matches.
- [ ] Run → fail. Build (server component, no client JS except the language toggle). Run → pass. Screenshot review at 360 and 1280. Commit.

### Task 6: Intake form and confirmation

**Files:** `app/[locale]/help/page.tsx`, `app/[locale]/help/actions.ts`, `app/[locale]/help/thanks/page.tsx`, `components/Field.tsx`, `lib/phone.ts`, `lib/digits.ts`, `lib/validation/intake.ts`, `lib/rate-limit.ts`, `lib/supabase/public.ts`, `tests/unit/phone.test.ts`, `tests/unit/intake.test.ts`, `tests/e2e/intake.spec.ts`.

**Interfaces — produces:** `normalisePhone(input: string): string | null`; `toEnglishDigits(s: string): string`; `intakeSchema` (zod); server action `submitIntake(prev: FormState, data: FormData): Promise<FormState>`.

- [ ] Unit tests: the five phone formats in Review Focus 1 → `+8801712345678`; `029876543` → null; `০১২৩` → null; `intakeSchema` rejects missing category, missing phone, description > 1000, honeypot filled.
- [ ] E2E (no database): submitting empty form shows Bangla errors next to each field and focus moves to the first error; form works with JavaScript disabled (progressive enhancement); category pre-selected from `?category=`; choosing "Other" area with Survey shows a note that field work is only in Savar and Gazipur for now.
- [ ] E2E (requires Supabase dev project — see Stop 2): valid submit lands on thanks page showing `LD-####`; double-click submits once.
- [ ] Run → fail. Implement. Run → pass. Commit.

### Task 7: Legal pages and footer

**Files:** `app/[locale]/legal/[slug]/page.tsx`, `content/legal/{terms,refund,privacy,disclaimer}.{bn,en}.md`, `tests/e2e/legal.spec.ts`.

- [ ] E2E: four pages exist in both languages; each shows the DRAFT banner; footer links to all four; privacy page states what is collected (name, phone, area, problem) and that documents are not stored.
- [ ] Implement with plain Markdown rendered on the server. Run → pass. Commit.

### Task 8: Staff login, two-step verification and admin shell

**Files:** `app/admin/login/page.tsx`, `app/admin/mfa/page.tsx`, `app/admin/layout.tsx`, `lib/supabase/server.ts`, `middleware.ts` (admin matcher), `tests/e2e/admin-auth.spec.ts`.

- [ ] E2E (Supabase dev project): anonymous visit to `/admin/cases` redirects to `/admin/login`; password login without TOTP redirects to `/admin/mfa`; after TOTP, operations sees Cases but not Packages in nav; super_admin sees both; non-staff user is signed out with a message.
- [ ] Implement with `@supabase/ssr`; TOTP enrol + verify via `supabase.auth.mfa`. Commit.

### Task 9: Admin cases (list, detail, assign, status, offer, payments)

**Files:** `app/admin/cases/page.tsx`, `app/admin/cases/[id]/page.tsx`, `app/admin/cases/actions.ts`, `components/admin/*`, `tests/e2e/admin-cases.spec.ts`.

- [ ] E2E: list filters by status, area and date; detail shows events timeline; assign dropdown lists only eligible consultants; status buttons show only allowed next statuses; "Create offer" picks a package, pre-fills its price (editable by super_admin only), sets government fees, then shows "Copy offer link" and a WhatsApp share link with Bangla text; "Record manual payment" and "Refund" work and appear in the timeline.
- [ ] Implement using the Task 4 functions only (no direct table updates). Commit.

### Task 10: Offer page

**Files:** `app/[locale]/offer/[token]/page.tsx`, `tests/e2e/offer.spec.ts`.

- [ ] E2E: open offer shows package, scope, delivery time, service price and government fees on separate lines with total, consultant name, role, areas and verified badge, "never pay an expert in cash" note, refund link; `price_unconfirmed` hides Pay and shows "call us to confirm"; expired shows expired message with call/WhatsApp; paid shows "already paid" with case ref; unknown token → 404; page sets `noindex`.
- [ ] Implement (server component calling `api.get_offer`). Commit.

### Task 11: SSLCommerz payments (sandbox) behind a flag

**Files:** `lib/payments/sslcommerz.ts`, `app/api/payments/init/route.ts`, `app/api/payments/ipn/route.ts`, `app/api/payments/return/route.ts`, `app/[locale]/pay/result/page.tsx`, `supabase/migrations/0005_payments.sql`, `tests/unit/sslcommerz.test.ts`, `tests/fixtures/sslcommerz/*.json`, `tests/db/05_payments.test.sql`.

**Interfaces — produces:** `initSession(offer: OfferForPayment): Promise<{ redirectUrl: string; tranId: string }>`; `validatePayment(valId: string): Promise<ValidationResult>`; `api.mark_offer_paid(p_tran_id text, p_val_id text, p_amount int) returns boolean` (service_role only).

- [ ] Unit tests with recorded fixtures: `VALID` with matching amount/currency/tran_id → paid; `VALIDATED` (already validated) → paid once; amount mismatch → rejected; currency ≠ BDT → rejected; `FAILED`/`CANCELLED` → not paid; network error → not paid and retried by IPN.
- [ ] SQL tests: `mark_offer_paid` twice with same `tran_id` → one payment row, returns true then false; wrong amount raises; `anon`/`authenticated` cannot execute it.
- [ ] When `PAYMENTS_ENABLED=false`, the Pay button is replaced by manual payment instructions (bKash/Nagad number from settings, "operations will confirm").
- [ ] Implement. Commit.

### Task 12: Remaining admin screens

**Files:** `app/admin/{consultants,packages,waitlist,complaints,payouts}/page.tsx` + actions, `tests/e2e/admin-other.spec.ts`.

- [ ] E2E: super_admin creates a consultant (government requires sanction reference; demo flag visible); operations sees consultants read-only; packages editable only by super_admin, with `price_confirmed` toggle; waiting list groups by district and upazila with counts; complaints open/resolve; payout summary lists delivered-and-closed cases per consultant for a chosen week with consultant share, and "Mark paid" (super_admin).
- [ ] Implement. Commit.

### Task 13: Hardening, analytics, docs

**Files:** `next.config.ts` (security headers + CSP), `components/Analytics.tsx`, `README.md`, `docs/launch-checklist.md`, `supabase/seed.sql`, `scripts/create-super-admin.ts`.

- [ ] Tests: response headers include CSP, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`; analytics scripts absent when env IDs empty and present when set; `npm run build` output shows no server env names in client chunks (grep).
- [ ] Implement. Commit.

### Task 14: Full QA pass and release candidate

- [ ] All E2E flows on the Supabase dev project at 360×740 and 1280×800 in bn and en.
- [ ] Security review with `sharp-edges`, `entry-point-analyzer`, `differential-review`, `supply-chain-risk-auditor`.
- [ ] Lighthouse mobile on Home, Help, Offer ≥ 90 performance and accessibility.
- [ ] Bangla QA: no untranslated keys (script compares bn/en key sets), conjuncts render, every error message in Bangla.
- [ ] Rubric scores ≥ 4 on all eight; fix and repeat until true. Final summary to founder.

---

## Stop points (need the founder)

1. **Now:** approve this plan.
2. **Before Task 6's database E2E (around Loop 6):** create a free Supabase project (region Mumbai or Singapore) and put its URL, anon key and service-role key in `.env.local`. Tasks 1–7 UI work and all database tests run before this.
3. **Before Task 11 E2E:** free SSLCommerz sandbox store ID and password (developer.sslcommerz.com).
4. **Design tokens:** can arrive any time. Swapping them touches `design/tokens.css` only.
5. **Any deploy, domain, live keys or money:** always the founder.

## Execution

Native: I implement each task in this session following the loop, with QA and review at every task and a full independent review at the end. The tasks depend heavily on each other's database interfaces, so one continuous context is safer than handing each task to a fresh worker.
