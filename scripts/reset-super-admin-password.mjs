#!/usr/bin/env node
/**
 * Resets the super admin password and prints the new one.
 * Run: node scripts/reset-super-admin-password.mjs
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";

config({ path: ".env.local" });
config({ path: ".env" });

const EMAIL = "pascodinamic00@gmail.com";

function generatePassword() {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnopqrstuvwxyz";
  const digits = "23456789";
  const special = "!@#$%";
  const all = upper + lower + digits + special;
  const bytes = randomBytes(20);
  let pwd = "";
  // Guarantee at least one of each category
  pwd += upper[bytes[0] % upper.length];
  pwd += lower[bytes[1] % lower.length];
  pwd += digits[bytes[2] % digits.length];
  pwd += special[bytes[3] % special.length];
  for (let i = 4; i < 16; i++) {
    pwd += all[bytes[i] % all.length];
  }
  // Shuffle
  return pwd.split("").sort(() => 0.5 - Math.random()).join("");
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (listError) { console.error(listError.message); process.exit(1); }

  const user = users.find((u) => u.email?.toLowerCase() === EMAIL.toLowerCase());
  if (!user) {
    console.error(`User ${EMAIL} not found. Run: npm run seed:super-admin`);
    process.exit(1);
  }

  const newPassword = generatePassword();

  const { error } = await supabase.auth.admin.updateUserById(user.id, {
    password: newPassword,
  });

  if (error) { console.error("Error updating password:", error.message); process.exit(1); }

  console.log("\n========================================");
  console.log("  Super Admin Credentials");
  console.log("========================================");
  console.log(`  Email   : ${EMAIL}`);
  console.log(`  Password: ${newPassword}`);
  console.log("========================================");
  console.log("\n  Login at /login");
  console.log("  Change password in Settings → Security");
  console.log("========================================\n");
}

main();
