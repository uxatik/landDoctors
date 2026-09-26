# Connecting your Supabase project

My build workspace can't reach supabase.co (blocked by its network rules), so these steps are done on your Mac. About 10 minutes.

## 1. Create the database tables (once)
1. Open https://supabase.com/dashboard/project/ahvvroxpnxjyzjptrrxu → **SQL Editor** → **New query**.
2. Open `supabase/setup.sql` from this folder in a text editor, copy everything, paste it in, press **Run**.
3. You should see "Success. No rows returned". Check **Table Editor**: you should see tables like `cases`, `packages` (with 3 rows), `waitlist`.

Run it only once. If you already ran an older version, run the files in `supabase/updates/` instead. If it fails part-way, nothing is saved (it runs as one transaction). Send me the error text.

## 2. Fill in `.env.local` (in this folder)
```
NEXT_PUBLIC_SUPABASE_URL=https://ahvvroxpnxjyzjptrrxu.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<Project Settings → API Keys → anon / publishable>
SUPABASE_SERVICE_ROLE_KEY=<service_role / secret — needed later for payments>
IP_HASH_SALT=<any random text, 20+ characters>
NEXT_PUBLIC_HOTLINE=+8801XXXXXXXXX
NEXT_PUBLIC_WHATSAPP=+8801XXXXXXXXX
```
Never paste these into the chat and never commit this file (it is already ignored by git).

## 3. Try it on your Mac
Needs Node.js 20 or newer (`node -v` in Terminal).
```
cd ~/Desktop/landDoctors
npm install
npm run dev
```
Open http://localhost:3000/help, fill the form, press পাঠান. You should land on a page showing a case number like LD-0001. In Supabase → Table Editor → `cases` the row appears.

## 4. Run the full test suite against Supabase (optional)
```
npx playwright install chromium
E2E_DB=1 npm run e2e
```

## 5. Create staff logins
```
node --env-file=.env.local scripts/create-staff.mjs you@example.com "Your Name" super_admin
```
Then open http://localhost:3000/admin/login, sign in with the temporary password, and scan the QR code with Google Authenticator. Also in Supabase → Authentication, turn **off** new sign-ups.
