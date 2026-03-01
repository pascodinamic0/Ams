#!/usr/bin/env node
/**
 * Applies Supabase migrations to your remote database.
 *
 * Usage: npm run db:migrate
 *
 * Requires: DATABASE_URL in .env (from Supabase Dashboard > Settings > Database > Connection string > URI)
 * Or: SUPABASE_DB_PASSWORD (we'll build the URL from your project)
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

async function main() {
  let connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("Error: Set DATABASE_URL in .env");
    console.error("");
    console.error("Get it from: Supabase Dashboard > Project Settings > Database > Connection string (URI)");
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

    const files = readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const file of files) {
      console.log(`Running ${file}...`);
      const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
      await client.query(sql);
      console.log(`  ✓ ${file}`);
    }

    console.log("\nMigrations complete.");
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
