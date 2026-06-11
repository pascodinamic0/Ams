#!/usr/bin/env node
/**
 * Applies Supabase migrations to your remote database.
 *
 * Usage: npm run db:migrate
 *
 * Requires DATABASE_URL in .env (from Supabase Dashboard > Settings > Database > Connection string > URI)
 * Or: SUPABASE_DB_PASSWORD (+ NEXT_PUBLIC_SUPABASE_URL) to build the pooler URL automatically.
 */

import { config } from "dotenv";
import pg from "pg";
import { readFileSync, readdirSync } from "node:fs";
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

async function ensureMigrationsTable(client) {
  await client.query(`
    CREATE TABLE IF NOT EXISTS public.schema_migrations (
      filename text PRIMARY KEY,
      applied_at timestamptz NOT NULL DEFAULT now()
    );
  `);
}

async function getAppliedMigrations(client) {
  const { rows } = await client.query(
    "SELECT filename FROM public.schema_migrations"
  );
  return new Set(rows.map((r) => r.filename));
}

async function main() {
  const connectionString = buildDatabaseUrl();
  if (!connectionString) {
    console.error("Error: Set DATABASE_URL or SUPABASE_DB_PASSWORD in .env");
    console.error("");
    console.error(
      "Get DATABASE_URL from: Supabase Dashboard > Project Settings > Database > Connection string (URI)"
    );
    console.error("Use the 'Transaction' pooler URL for migrations.");
    process.exit(1);
  }

  const client = new pg.Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    console.log("Connected to database.\n");

    await ensureMigrationsTable(client);
    const applied = await getAppliedMigrations(client);

    const files = readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    let ran = 0;
    for (const file of files) {
      if (applied.has(file)) {
        console.log(`Skipping ${file} (already applied)`);
        continue;
      }

      console.log(`Running ${file}...`);
      const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query(
          "INSERT INTO public.schema_migrations (filename) VALUES ($1)",
          [file]
        );
        await client.query("COMMIT");
        console.log(`  ✓ ${file}`);
        ran++;
      } catch (err) {
        await client.query("ROLLBACK");
        throw err;
      }
    }

    console.log(
      ran === 0 ? "\nNo new migrations to apply." : `\nApplied ${ran} migration(s).`
    );
  } catch (err) {
    console.error("\nMigration failed:", err.message);
    if (err.position) {
      console.error("Position:", err.position);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
