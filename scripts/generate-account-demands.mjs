#!/usr/bin/env node
/**
 * Create account-level fee demands for every active student under a school.
 *
 * Usage:
 *   bun scripts/generate-account-demands.mjs
 *   bun scripts/generate-account-demands.mjs --school "Greenfield Academy"
 *   bun scripts/generate-account-demands.mjs --school greenfield-academy --fee "Tuition — Term 1"
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY in .env / .env.local
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });
config({ path: ".env" });

function argValue(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx === -1) return null;
  return process.argv[idx + 1] ?? null;
}

const schoolQuery = argValue("--school") ?? "Greenfield Academy";
const feeQuery = argValue("--fee") ?? null;
const dueDays = Number(argValue("--due-days") ?? "14");
const skipExisting = !process.argv.includes("--force");

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error(
      "Error: Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env"
    );
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  let schoolQueryBuilder = supabase.from("schools").select("id, name, slug, code");
  if (schoolQuery.includes("-") && !schoolQuery.includes(" ")) {
    schoolQueryBuilder = schoolQueryBuilder.eq("slug", schoolQuery);
  } else if (schoolQuery === schoolQuery.toUpperCase()) {
    schoolQueryBuilder = schoolQueryBuilder.eq("code", schoolQuery);
  } else {
    schoolQueryBuilder = schoolQueryBuilder.ilike("name", schoolQuery);
  }

  const { data: school, error: schoolError } = await schoolQueryBuilder.maybeSingle();
  if (schoolError) throw schoolError;
  if (!school) {
    console.error(`School not found for query: ${schoolQuery}`);
    process.exit(1);
  }

  const { data: branches, error: branchError } = await supabase
    .from("branches")
    .select("id")
    .eq("school_id", school.id);
  if (branchError) throw branchError;
  const branchIds = (branches ?? []).map((b) => b.id);
  if (branchIds.length === 0) {
    console.error(`No branches found for ${school.name}`);
    process.exit(1);
  }

  let feeQueryBuilder = supabase
    .from("fee_structures")
    .select("id, name, amount, branch_id")
    .in("branch_id", branchIds)
    .order("name");
  if (feeQuery) {
    feeQueryBuilder = feeQueryBuilder.ilike("name", `%${feeQuery}%`);
  }

  const { data: feeStructures, error: feeError } = await feeQueryBuilder;
  if (feeError) throw feeError;
  if (!feeStructures?.length) {
    console.error(`No fee structures found for ${school.name}`);
    process.exit(1);
  }

  // Prefer tuition-named structure, else first
  const fee =
    feeStructures.find((f) => /tuition|scolarité|frais/i.test(f.name)) ??
    feeStructures[0];

  const { data: students, error: studentsError } = await supabase
    .from("students")
    .select("id, first_name, last_name, student_id, status")
    .eq("school_id", school.id)
    .eq("status", "active");
  if (studentsError) throw studentsError;

  if (!students?.length) {
    console.error(`No active student accounts under ${school.name}`);
    process.exit(1);
  }

  const dueDate = daysFromNow(dueDays);
  const studentIds = students.map((s) => s.id);

  let toCreate = studentIds;
  let skipped = 0;

  if (skipExisting) {
    const { data: existing } = await supabase
      .from("fee_invoices")
      .select("student_id")
      .eq("fee_structure_id", fee.id)
      .in("student_id", studentIds)
      .in("status", ["pending", "overdue"]);

    const already = new Set((existing ?? []).map((r) => r.student_id));
    toCreate = studentIds.filter((id) => !already.has(id));
    skipped = studentIds.length - toCreate.length;
  }

  console.log(`School: ${school.name} (${school.slug})`);
  console.log(`Fee structure: ${fee.name} (${fee.amount})`);
  console.log(`Active accounts: ${students.length}`);
  console.log(`Due date: ${dueDate}`);
  console.log(`To create: ${toCreate.length} | Skip existing: ${skipped}`);

  if (toCreate.length === 0) {
    console.log("Nothing to create — all accounts already have an open demand.");
    return;
  }

  const rows = toCreate.map((studentId) => ({
    student_id: studentId,
    fee_structure_id: fee.id,
    amount: Number(fee.amount),
    amount_paid: 0,
    due_date: dueDate,
    status: "pending",
    description: `Account-level demand: ${fee.name}`,
  }));

  const { data: inserted, error: insertError } = await supabase
    .from("fee_invoices")
    .insert(rows)
    .select("id");

  if (insertError) throw insertError;

  console.log(
    `Created ${inserted?.length ?? toCreate.length} account-level demand(s) for ${school.name}.`
  );
}

main().catch((err) => {
  console.error("Failed:", err.message ?? err);
  process.exit(1);
});
