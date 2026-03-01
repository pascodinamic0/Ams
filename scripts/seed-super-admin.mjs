#!/usr/bin/env node
/**
 * Creates a super admin user.
 *
 * Usage:
 *   npm run seed:super-admin                    # Uses default: Pascodinamic00@gmail.com
 *   npm run seed:super-admin -- new@email.com   # Create super admin with different email
 *
 * Requires: SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in .env
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "node:crypto";

config({ path: ".env.local" });
config({ path: ".env" });

const DEFAULT_EMAIL = "pascodinamic00@gmail.com";
const EMAIL = process.argv[2] || DEFAULT_EMAIL;

function generatePassword() {
  const chars = "abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = randomBytes(16);
  let s = "";
  for (let i = 0; i < 16; i++) {
    s += chars[bytes[i] % chars.length];
  }
  return s;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error("Error: Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env");
    console.error("Copy .env.example to .env and fill in your Supabase credentials.");
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const password = generatePassword();

  const { error } = await supabase.auth.admin.createUser({
    email: EMAIL,
    password,
    email_confirm: true,
    user_metadata: {
      role: "super_admin",
      name: "Super Admin",
    },
  });

  if (error) {
    if (error.message.includes("already been registered")) {
      console.log("User already exists. Updating profile to super_admin...");
      const { data: existing } = await supabase.auth.admin.listUsers();
      const user = existing?.users?.find((u) => u.email === EMAIL);
      if (user) {
        await supabase.from("profiles").upsert(
          { id: user.id, role: "super_admin", updated_at: new Date().toISOString() },
          { onConflict: "id" }
        );
        console.log("Profile updated. Use the forgot-password flow to set a new password.");
      }
    } else {
      console.error("Error:", error.message);
      process.exit(1);
    }
    return;
  }

  console.log("\n--- Super Admin created ---");
  console.log("Email:", EMAIL);
  console.log("Password:", password);
  console.log("\nLogin at /login and change your password in Settings.");
  console.log("---\n");
}

main();
