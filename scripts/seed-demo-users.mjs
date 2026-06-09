#!/usr/bin/env node
/**
 * Creates demo accounts for every AMS user role.
 *
 * Usage: npm run seed:demo-users
 *
 * Requires: SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL in .env
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });
config({ path: ".env" });

const DEMO_PASSWORD = "AMSdemo2026!";

const DEMO_USERS = [
  { email: "super.admin@ams.demo", role: "super_admin", name: "Super Admin Demo", schoolScoped: false },
  { email: "academic.admin@ams.demo", role: "academic_admin", name: "Academic Admin", schoolScoped: true },
  { email: "teacher@ams.demo", role: "teacher", name: "Demo Teacher", schoolScoped: true },
  { email: "finance@ams.demo", role: "finance_officer", name: "Finance Officer", schoolScoped: true },
  { email: "operations@ams.demo", role: "operations_manager", name: "Operations Manager", schoolScoped: true },
  { email: "parent@ams.demo", role: "parent", name: "Demo Parent", schoolScoped: true },
  { email: "student@ams.demo", role: "student", name: "Demo Student", schoolScoped: true },
  { email: "analytics@ams.demo", role: "analytics", name: "Analytics User", schoolScoped: true },
];

async function ensureBranch(supabase, schoolId) {
  const { data: existing } = await supabase
    .from("branches")
    .select("id")
    .eq("school_id", schoolId)
    .limit(1)
    .maybeSingle();

  if (existing?.id) return existing.id;

  const { data, error } = await supabase
    .from("branches")
    .insert({
      school_id: schoolId,
      name: "Main Campus",
      address: "Main Campus",
      status: "active",
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

async function upsertAuthUser(supabase, { email, password, role, name }) {
  const { data: listed } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const existing = listed?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());

  if (existing) {
    const { error } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      user_metadata: { role, name },
    });
    if (error) throw error;
    return existing.id;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { role, name },
  });
  if (error) throw error;
  return data.user.id;
}

async function upsertProfile(supabase, { userId, role, name, schoolId, branchId, schoolScoped }) {
  const payload = {
    id: userId,
    name,
    role,
    updated_at: new Date().toISOString(),
  };

  if (schoolScoped) {
    payload.school_id = schoolId;
    payload.branch_id = branchId;
  }

  const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });
  if (error) throw error;
}

async function ensureRow(supabase, table, matchColumn, matchValue, payload) {
  const { data: existing } = await supabase
    .from(table)
    .select("id")
    .eq(matchColumn, matchValue)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await supabase.from(table).update(payload).eq("id", existing.id);
    if (error) throw error;
    return existing.id;
  }

  const { data, error } = await supabase.from(table).insert(payload).select("id").single();
  if (error) throw error;
  return data.id;
}

async function linkStudentAndParent(supabase, { schoolId, branchId, studentUserId, parentUserId }) {
  const studentId = await ensureRow(supabase, "students", "auth_user_id", studentUserId, {
    school_id: schoolId,
    branch_id: branchId,
    first_name: "Demo",
    last_name: "Student",
    date_of_birth: "2010-06-15",
    gender: "other",
    status: "active",
    auth_user_id: studentUserId,
  });

  const guardianId = await ensureRow(supabase, "guardians", "auth_user_id", parentUserId, {
    school_id: schoolId,
    name: "Demo Parent",
    email: "parent@ams.demo",
    phone: "+1234567890",
    relation: "guardian",
    auth_user_id: parentUserId,
  });

  const { error: linkError } = await supabase.from("guardian_students").upsert(
    { guardian_id: guardianId, student_id: studentId },
    { onConflict: "guardian_id,student_id" }
  );
  if (linkError) throw linkError;
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.error("Error: Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env");
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: school, error: schoolError } = await supabase
    .from("schools")
    .select("id, name")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (schoolError) throw schoolError;
  if (!school) {
    console.error("No school found. Create a school in /admin/schools first.");
    process.exit(1);
  }

  const branchId = await ensureBranch(supabase, school.id);
  const userIds = {};

  for (const account of DEMO_USERS) {
    userIds[account.role] = await upsertAuthUser(supabase, {
      email: account.email,
      password: DEMO_PASSWORD,
      role: account.role,
      name: account.name,
    });

    await upsertProfile(supabase, {
      userId: userIds[account.role],
      role: account.role,
      name: account.name,
      schoolId: school.id,
      branchId,
      schoolScoped: account.schoolScoped,
    });
  }

  await linkStudentAndParent(supabase, {
    schoolId: school.id,
    branchId,
    studentUserId: userIds.student,
    parentUserId: userIds.parent,
  });

  console.log("\n--- Demo accounts ready ---");
  console.log(`School: ${school.name}`);
  console.log(`Password (all accounts): ${DEMO_PASSWORD}`);
  console.log("");
  for (const account of DEMO_USERS) {
    console.log(`${account.role.padEnd(20)} ${account.email}`);
  }
  console.log("\nLogin at /login");
  console.log("---\n");
}

main().catch((err) => {
  console.error("Seed failed:", err.message ?? err);
  process.exit(1);
});
