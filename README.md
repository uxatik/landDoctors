# LandDoctor

Bangla-first website that connects people in Bangladesh with verified land experts at fixed, published prices. Phase 1 pilot: Savar and Gazipur.

- **Public site:** home, problem form, thank-you page, offer page, payment result, legal pages (bn at `/`, en at `/en`).
- **Staff area:** `/admin` — cases, consultants, packages, waiting list, complaints, payouts. Password + authenticator app required.
- **Stack:** Next.js 15, Tailwind v4, next-intl, Supabase (Postgres + Auth + RLS), SSLCommerz, Vercel.

Plan and decisions: `docs/plan.md`, `docs/decisions.md`, `docs/loop-log.md`. Before going live: `docs/launch-checklist.md`.

## Run it on your computer

Needs Node.js 20+.

```bash
npm install
cp .env.example .env.local   # then fill it in (see below)
npm run dev                  # http://localhost:3000
```

## Connect Supabase (first time)

1. Supabase → **SQL Editor** → paste all of `supabase/setup.sql` → **Run**.
   - Already ran an older `setup.sql`? Run the files in `supabase/updates/` in order instead.
2. Supabase → **Authentication → Sign In / Providers**: turn **off** "Allow new users to sign up". Make sure **MFA → TOTP** is enabled.
3. Fill `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `IP_HASH_SALT`, hotline and WhatsApp numbers.
4. Create staff logins:
   ```bash
   node --env-file=.env.local scripts/create-staff.mjs you@example.com "Your Name" super_admin
   node --env-file=.env.local scripts/create-staff.mjs brother@example.com "Brother Name" operations
   ```
   Each person signs in at `/admin/login` with the temporary password and sets up Google/Microsoft Authenticator.
5. In `/admin/consultants`, add your first private consultants and tick **Verified**. In `/admin/packages`, set real prices and tick **Price confirmed**.

## Tests

```bash
npm run check          # typecheck + lint + unit tests + database tests
npm run e2e            # browser tests (phone 360×740 and desktop 1280×800)
E2E_DB=1 npm run e2e   # also runs the tests that need your Supabase project
```

Database tests need Postgres 15+ installed locally (`brew install postgresql@16` on a Mac; set `PG_BIN` if it isn't on PATH). They run on a throwaway local database, never on Supabase.

For the staff sign-in tests, add to `.env.local`: `E2E_OPS_EMAIL`, `E2E_OPS_PASSWORD`, `E2E_OPS_TOTP_SECRET` (the key shown under the QR code when setting up a test operations account). For the offer page test, `E2E_OFFER_TOKEN` of an open offer.

## Payments

Off by default (`PAYMENTS_ENABLED=false`): the offer page tells customers to call. To test with SSLCommerz's sandbox, register at https://developer.sslcommerz.com, then set `SSLCOMMERZ_STORE_ID`, `SSLCOMMERZ_STORE_PASSWORD`, `SSLCOMMERZ_SANDBOX=true`, `PAYMENTS_ENABLED=true`. The IPN URL SSLCommerz calls is `<site>/api/payments/ipn`; it must be reachable from the internet, so test payments on the deployed Vercel preview, not localhost.

Payments are marked paid only after the server asks SSLCommerz's validation API, and the database checks the amount against what it asked for. Going live (`SSLCOMMERZ_SANDBOX=false`) is the founder's decision.

## Deploy to Vercel

1. Push this folder to a **private** GitHub repository.
2. Vercel → New Project → import the repository.
3. Add every variable from `.env.local` in Vercel → Settings → Environment Variables. Set `NEXT_PUBLIC_SITE_URL` to the real address.
4. Deploy.

## Design tokens

All colours, type sizes, spacing and radii come from `design/tokens.css`. Replace the values there with the Designfoli export; keep the token names.
