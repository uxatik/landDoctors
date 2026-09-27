// Creates a staff login and gives it a role. Run on your own computer (needs internet):
//   node --env-file=.env.local scripts/create-staff.mjs founder@example.com "Founder Name" super_admin
//   node --env-file=.env.local scripts/create-staff.mjs ops@example.com "Brother Name" operations
// Prints a one-time temporary password. The person signs in, then sets up the authenticator app.
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const [email, name, role = "operations"] = process.argv.slice(2);
if (!email || !name || !["operations", "super_admin"].includes(role)) {
  console.error('Usage: node --env-file=.env.local scripts/create-staff.mjs <email> "<name>" <operations|super_admin>');
  process.exit(1);
}
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local");
  process.exit(1);
}

const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const password = randomBytes(12).toString("base64url");

let userId;
const { data: created, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
if (error) {
  if (!/already/i.test(error.message)) {
    console.error("Could not create user:", error.message);
    process.exit(1);
  }
  const { data: list } = await admin.auth.admin.listUsers({ perPage: 1000 });
  userId = list.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())?.id;
  console.log("User already exists; updating their staff role only.");
} else {
  userId = created.user.id;
}
if (!userId) {
  console.error("User not found.");
  process.exit(1);
}

const { error: staffError } = await admin.from("staff").upsert({ user_id: userId, name, role, active: true });
if (staffError) {
  console.error("Could not save staff role:", staffError.message);
  process.exit(1);
}
console.log(`\n${name} <${email}> is now ${role}.`);
if (!error) console.log(`Temporary password (shown once, share privately): ${password}\n`);
