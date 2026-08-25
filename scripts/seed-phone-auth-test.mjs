#!/usr/bin/env node
/**
 * Link a test phone on auth.users for WhatsApp/phone login testing.
 *
 * Usage:
 *   bun run seed:phone-auth-test
 *   bun run seed:phone-auth-test -- parent@ams.demo +243822000001
 *
 * Hosted Supabase: prepares the user; OTP send still needs Twilio Verify in dashboard.
 * Local Supabase:  with [auth.sms.test_otp] in config.toml, OTP is always 123456 (free).
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });
config({ path: ".env" });

const DEFAULT_EMAIL = "parent@ams.demo";
const DEFAULT_PHONE = "+243822000001";
const LOCAL_TEST_OTP = "123456";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const email = process.argv[2] ?? DEFAULT_EMAIL;
const phone = process.argv[3] ?? DEFAULT_PHONE;

const supabase = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: listed, error: listError } = await supabase.auth.admin.listUsers({
  perPage: 1000,
});
if (listError) {
  console.error("listUsers:", listError.message);
  process.exit(1);
}

const user = listed?.users?.find(
  (u) => u.email?.toLowerCase() === email.toLowerCase()
);

if (!user) {
  console.error(`No auth user for ${email}. Create one first (e.g. bun run seed:demo-users).`);
  process.exit(1);
}

const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, {
  phone,
  phone_confirm: true,
});

if (updateError) {
  console.error("updateUserById:", updateError.message);
  process.exit(1);
}

console.log(`Linked ${phone} to ${email} (${user.id})`);

const isLocal =
  url.includes("127.0.0.1") || url.includes("localhost") || url.includes(":54321");

if (isLocal) {
  console.log(`
Free local test:
  1. supabase start  (if not running)
  2. Open /login ? Phone tab
  3. Number: ${phone}
  4. OTP: ${LOCAL_TEST_OTP}  (from supabase/config.toml test_otp)
`);
} else {
  console.log(`
Hosted project (${url}):
  Phone is linked, but OTP delivery needs Twilio Verify in Supabase Dashboard.
  Until Twilio is funded, use local Supabase for free end-to-end tests:

  supabase start
  # Point NEXT_PUBLIC_SUPABASE_URL to local API from \`supabase status\`
  bun run seed:phone-auth-test -- ${email} ${phone}
  # /login ? Phone ? ${phone} ? OTP ${LOCAL_TEST_OTP}
`);
}
