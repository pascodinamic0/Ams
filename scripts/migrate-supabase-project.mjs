#!/usr/bin/env node
/**
 * Migrate data between Supabase projects (public schema + auth users).
 *
 * Usage:
 *   # Export from source
 *   SOURCE_SUPABASE_URL=... SOURCE_SERVICE_ROLE_KEY=... node scripts/migrate-supabase-project.mjs export
 *
 *   # Import into target (service role required on target)
 *   TARGET_SUPABASE_URL=... TARGET_SERVICE_ROLE_KEY=... node scripts/migrate-supabase-project.mjs import
 *
 * Export writes scripts/.migration-export.json (gitignored).
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";
import { writeFileSync, readFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

config({ path: ".env.local" });
config({ path: ".env" });

const __dirname = dirname(fileURLToPath(import.meta.url));
const EXPORT_PATH = join(__dirname, ".migration-export.json");

const DEMO_PASSWORD = "AMSdemo2026!";
const MIGRATION_PASSWORD = process.env.MIGRATION_USER_PASSWORD ?? "AMSmigrate2026!";

/** Tables in FK-safe order. roles omitted ù seeded by migrations on target. */
const TABLE_ORDER = [
  "schools",
  "branches",
  "feature_toggles",
  "profiles",
  "sections",
  "classes",
  "subjects",
  "guardians",
  "students",
  "guardian_students",
  "timetable_slots",
  "curriculum",
  "admission_applications",
  "fee_structures",
  "fee_invoices",
  "fee_payments",
  "fee_reminder_settings",
  "expenses",
  "staff",
  "events",
  "event_registrations",
  "books",
  "book_issues",
  "assignments",
  "assignment_submissions",
  "grades",
  "attendance_records",
  "payroll",
  "transport_routes",
  "transport_vehicles",
  "transport_student_mapping",
  "campaigns",
  "campaign_recipients",
  "messages",
  "notifications",
  "conversations",
  "conversation_participants",
  "conversation_messages",
  "audit_logs",
];

function sourceClient() {
  const url = process.env.SOURCE_SUPABASE_URL ?? process.env.OLD_SUPABASE_URL;
  const key = process.env.SOURCE_SERVICE_ROLE_KEY ?? process.env.OLD_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Set SOURCE_SUPABASE_URL and SOURCE_SERVICE_ROLE_KEY");
    process.exit(1);
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function targetClient() {
  const url =
    process.env.TARGET_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.TARGET_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    console.error("Set TARGET_SUPABASE_URL and TARGET_SERVICE_ROLE_KEY");
    process.exit(1);
  }
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

async function listAllUsers(supabase) {
  const users = [];
  let page = 1;
  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 100,
    });
    if (error) throw error;
    users.push(...data.users);
    if (data.users.length < 100) break;
    page++;
  }
  return users;
}

async function exportData() {
  const supabase = sourceClient();
  console.log("Exporting from", process.env.SOURCE_SUPABASE_URL ?? process.env.OLD_SUPABASE_URL);

  const tables = {};
  for (const table of TABLE_ORDER) {
    const { data, error } = await supabase.from(table).select("*");
    if (error) {
      if (error.code === "PGRST205" || error.message?.includes("does not exist")) {
        console.log(`  skip ${table} (not on source)`);
        continue;
      }
      throw new Error(`${table}: ${error.message}`);
    }
    tables[table] = data ?? [];
    if (data?.length) console.log(`  ${table}: ${data.length}`);
  }

  const users = await listAllUsers(supabase);
  console.log(`  auth.users: ${users.length}`);

  const payload = {
    exportedAt: new Date().toISOString(),
    sourceUrl: process.env.SOURCE_SUPABASE_URL ?? process.env.OLD_SUPABASE_URL,
    tables,
    users: users.map((u) => ({
      id: u.id,
      email: u.email,
      email_confirmed_at: u.email_confirmed_at,
      app_metadata: u.app_metadata,
      user_metadata: u.user_metadata,
      created_at: u.created_at,
    })),
  };

  writeFileSync(EXPORT_PATH, JSON.stringify(payload, null, 2));
  console.log(`\nWrote ${EXPORT_PATH}`);
}

async function clearTargetAuth(supabase) {
  const { data } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  for (const user of data?.users ?? []) {
    const { error } = await supabase.auth.admin.deleteUser(user.id);
    if (error) throw new Error(`deleteUser ${user.email}: ${error.message}`);
    console.log(`  removed auth user ${user.email}`);
  }
}

function passwordForUser(email) {
  if (email?.toLowerCase().endsWith("@ams.demo")) return DEMO_PASSWORD;
  return MIGRATION_PASSWORD;
}

async function importAuthUsers(supabase, users) {
  console.log("\nImporting auth users...");
  for (const user of users) {
    const password = passwordForUser(user.email);
    const { data, error } = await supabase.auth.admin.createUser({
      id: user.id,
      email: user.email,
      password,
      email_confirm: !!user.email_confirmed_at || true,
      user_metadata: user.user_metadata ?? {},
      app_metadata: user.app_metadata ?? {},
    });
    if (error) {
      throw new Error(`createUser ${user.email}: ${error.message}`);
    }
    console.log(`  ${user.email} (${data.user.id})`);
  }
}

async function importTables(supabase, tables) {
  console.log("\nImporting public tables...");
  for (const table of TABLE_ORDER) {
    const rows = tables[table];
    if (!rows?.length) continue;

    const { error } = await supabase.from(table).insert(rows);
    if (error) {
      throw new Error(`${table}: ${error.message}`);
    }
    console.log(`  ${table}: ${rows.length}`);
  }
}

async function importData() {
  if (!existsSync(EXPORT_PATH)) {
    console.error(`Missing ${EXPORT_PATH}. Run export first.`);
    process.exit(1);
  }

  const payload = JSON.parse(readFileSync(EXPORT_PATH, "utf8"));
  const supabase = targetClient();
  console.log(
    "Importing into",
    process.env.TARGET_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  );

  await clearTargetAuth(supabase);
  await importAuthUsers(supabase, payload.users);
  await importTables(supabase, payload.tables);

  console.log("\nMigration complete.");
  console.log(
    `Non-demo accounts use temporary password: ${MIGRATION_PASSWORD} (change after login).`
  );
  console.log(`Demo @ams.demo accounts use: ${DEMO_PASSWORD}`);
}

/** Escape string for SQL literal */
function sqlLiteral(value) {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "boolean") return value ? "TRUE" : "FALSE";
  if (typeof value === "number") return String(value);
  if (typeof value === "object") return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`;
  return `'${String(value).replace(/'/g, "''")}'`;
}

function generateAuthSql(users) {
  const lines = [
    "-- Clear existing auth users on target",
    "DELETE FROM auth.identities;",
    "DELETE FROM auth.users;",
    "",
  ];

  for (const user of users) {
    const password = passwordForUser(user.email);
    const appMeta = JSON.stringify(user.app_metadata ?? { provider: "email", providers: ["email"] });
    const userMeta = JSON.stringify(user.user_metadata ?? {});
    lines.push(`-- ${user.email}`);
    lines.push(`INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at, confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  ${sqlLiteral(user.id)}::uuid,
  'authenticated',
  'authenticated',
  ${sqlLiteral(user.email)},
  extensions.crypt(${sqlLiteral(password)}, extensions.gen_salt('bf')),
  ${user.email_confirmed_at ? sqlLiteral(user.email_confirmed_at) + "::timestamptz" : "now()"},
  ${sqlLiteral(appMeta)}::jsonb,
  ${sqlLiteral(userMeta)}::jsonb,
  ${sqlLiteral(user.created_at)}::timestamptz,
  now(),
  '', '', '', ''
);`);
    lines.push(`INSERT INTO auth.identities (
  id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  ${sqlLiteral(user.id)}::uuid,
  jsonb_build_object('sub', ${sqlLiteral(user.id)}, 'email', ${sqlLiteral(user.email)}),
  'email',
  ${sqlLiteral(user.id)},
  now(), now(), now()
);`);
    lines.push("");
  }
  return lines.join("\n");
}

function generateTableSql(tables) {
  const lines = ["-- Public tables (truncate children first)", "TRUNCATE TABLE"];
  const populated = TABLE_ORDER.filter((t) => tables[t]?.length);
  lines.push(
    populated.reverse().join(", ") + " RESTART IDENTITY CASCADE;",
    ""
  );
  // re-reverse for insert order
  for (const table of TABLE_ORDER) {
    const rows = tables[table];
    if (!rows?.length) continue;
    lines.push(`-- ${table} (${rows.length})`);
    for (const row of rows) {
      const cols = Object.keys(row);
      const vals = cols.map((c) => {
        const v = row[c];
        if (v === null || v === undefined) return "NULL";
        if (typeof v === "boolean") return v ? "TRUE" : "FALSE";
        if (typeof v === "number") return String(v);
        if (typeof v === "object") return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
        return `'${String(v).replace(/'/g, "''")}'`;
      });
      lines.push(
        `INSERT INTO ${table} (${cols.join(", ")}) VALUES (${vals.join(", ")}) ON CONFLICT DO NOTHING;`
      );
    }
    lines.push("");
  }
  return lines.join("\n");
}

function generateSql() {
  if (!existsSync(EXPORT_PATH)) {
    console.error(`Missing ${EXPORT_PATH}. Run export first.`);
    process.exit(1);
  }
  const payload = JSON.parse(readFileSync(EXPORT_PATH, "utf8"));
  const sql = [
    "BEGIN;",
    generateAuthSql(payload.users),
    generateTableSql(payload.tables),
    "COMMIT;",
  ].join("\n");
  process.stdout.write(sql);
}

const cmd = process.argv[2];
if (cmd === "export") {
  await exportData();
} else if (cmd === "import") {
  await importData();
} else if (cmd === "sql") {
  generateSql();
} else {
  console.error("Usage: migrate-supabase-project.mjs export|import|sql");
  process.exit(1);
}
