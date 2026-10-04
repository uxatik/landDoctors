# Launch checklist (what only the founder can do)

Tick these before real customers see the site.

## Legal and business
- [ ] Lawyer in Bangladesh reviews the four legal pages (`lib/content/legal.ts`), then remove the DRAFT banner (`app/[locale]/legal/[slug]/page.tsx`).
- [ ] Lawyer reviews the consultant agreement (share, no cash, conflict rule, liability).
- [ ] Trade licence, TIN, business bank account, DBID.
- [ ] SSLCommerz merchant approval (live store ID and password).
- [ ] Written agreement with the association; family link disclosed.
- [ ] Every Phase 1 consultant confirmed as **private**. Government employees only later, with sanction on file.

## Supabase
- [ ] `supabase/setup.sql` run once (or `supabase/updates/*` after an older setup).
- [ ] Authentication: public sign-ups **off**; TOTP MFA **on**.
- [ ] Staff created with `scripts/create-staff.mjs`; each has set up the authenticator app.
- [ ] Remove any test or demo consultants and test cases.
- [ ] Point-in-time backups: check your plan (the free plan has daily backups only).

## Content and prices
- [ ] Real prices set in `/admin/packages` and **Price confirmed** ticked for each package.
- [ ] Same prices on the home page (`messages/bn.json` and `messages/en.json` → `landing.pricing.packages`).
- [ ] Home page claims checked as true: association membership, how experts are checked, refund wording, payment methods (bKash, Nagad, Rocket, card) live on SSLCommerz.
- [ ] Package scope and exclusions checked by the consultants who will deliver them.
- [ ] Real WhatsApp number in the environment variables.
- [ ] Incoming calls: leave `CALLS_ENABLED` off until a person or a tested voice agent answers the hotline. When turning it on: real `HOTLINE` set, hotline hours decided and shown on the home page.
- [ ] Someone is assigned to call customers back (the site promises a free 10-minute call).
- [x] Designfoli tokens swapped into `design/tokens.css`; contrast checked (AA, see D11).
- [ ] Bangla copy read by a native speaker on a phone.

## Deployment
- [ ] Private GitHub repository; backend developer invited to review `lib/payments/*`, `app/api/payments/*`, `supabase/migrations/*`.
- [ ] Vercel project with all environment variables; `NEXT_PUBLIC_SITE_URL` = real domain.
- [ ] Domain connected (.com now; .com.bd later if wanted).
- [ ] `IP_HASH_SALT` set to a long random value.
- [ ] Sandbox payment tested end to end on the deployed site (IPN needs a public URL).
- [ ] Switch `SSLCOMMERZ_SANDBOX=false` only after merchant approval and one real small test payment.
- [ ] Google Analytics and Clarity IDs added (optional).

## Operations
- [ ] Operations brother named, with hours.
- [ ] One-page guides: triage call script, matching rules, sending offers, recording payments, refunds, complaints, weekly payouts.
- [ ] Stop-loss numbers written down (see research report).
