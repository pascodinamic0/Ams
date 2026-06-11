#!/usr/bin/env node
/**
 * Apply a single migration file to the remote database.
 *
 * Usage:
 *   node scripts/apply-migration.mjs 00015_school_onboarding.sql
 *
 * Requires DATABASE_URL or SUPABASE_DB_PASSWORD in .env / .env.local
 */

import { config } from "dotenv";
import pg from "pg";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

config({ path: ".env.local" });
config({ path: ".env" });

const __dirname = dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_DIR = join(__dirname, "..", "supabase", "migrations");

function getProjectRef() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const match = url?.match(/https:\/\/([^.]+)\.supabase\.co/);
  return match?.[1] ?? null;
}

function buildDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;

  const password = process.env.SUPABASE_DB_PASSWORD;
  const ref = getProjectRef();
  if (!password || !ref) return null;

  const region = process.env.SUPABASE_DB_REGION ?? "eu-central-1";
  return `postgresql://postgres.${ref}:${encodeURIComponent(password)}@aws-0-${region}.pooler.supabase.com:6543/postgres`;
}

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error("Usage: node scripts/apply-migration.mjs <migration-file.sql>");
    process.exit(1);
  }

  const connectionString = buildDatabaseUrl();
  if (!connectionString) {
    console.error(
      "Error: Set DATABASE_URL or SUPABASE_DB_PASSWORD (+ NEXT_PUBLIC_SUPABASE_URL) in .env"
    );
    process.exit(1);
  }

  const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log(`Applying ${file}...`);
    await client.query(sql);
    console.log(`? ${file}`);
  } catch (err) {
    console.error(`\nFailed: ${err.message}`);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
