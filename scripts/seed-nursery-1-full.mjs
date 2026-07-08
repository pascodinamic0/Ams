#!/usr/bin/env node
/**
 * Seeds Nursery 1 with:
 * - 20 active students (with unique deterministic names)
 * - a linked guardian for all students (reuses parent@ams.demo auth_user_id)
 * - a timetable slot that assigns teacher@ams.demo to Nursery 1 (Mon, Period 1)
 *
 * Safe to re-run (idempotent via "seed marker" notes on students and upserts on timetable slots).
 *
 * Usage:
 *  - bun scripts/seed-nursery-1-full.mjs
 *
 * Optional env overrides:
 *  - TARGET_CLASS_NAME (default: "Nursery 1")
 *  - STUDENTS_COUNT (default: "20")
 *  - TEACHER_EMAIL (default: "teacher@ams.demo")
 *  - PARENT_EMAIL (default: "parent@ams.demo")
 */
import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });
config({ path: ".env" });

const TARGET_CLASS_NAME = process.env.TARGET_CLASS_NAME ?? "Nursery 1";
const STUDENTS_COUNT = Number(process.env.STUDENTS_COUNT ?? "20");
const TEACHER_EMAIL = process.env.TEACHER_EMAIL ?? "teacher@ams.demo";
const PARENT_EMAIL = process.env.PARENT_EMAIL ?? "parent@ams.demo";

const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? "AMSdemo2026!";
const SEED_MARKER_PREFIX = process.env.SEED_MARKER_PREFIX ?? "nursery1-seed";

const SUBJECT_NAMES = ["Mathematics", "English", "Science", "History", "Physical Education"];

function toIsoDate(date) {
  // Date -> YYYY-MM-DD
  return date.toISOString().slice(0, 10);
}

function dobForIndex(i) {
  // Nursery-friendly DOBs; not validated for age in schema.
  // Produces dates between 2019-09-01 and 2019-09-30-ish.
  const day = 1 + (i % 28);
  return `2019-09-${String(day).padStart(2, "0")}`;
}

async function ensureSchoolAndBranch(supabase) {
  // Keep it deterministic but safe: pick first approved school, then first branch in it.
  const { data: schools, error: schoolsError } = await supabase
    .from("schools")
    .select("id")
    .order("created_at", { ascending: true })
    .limit(1);

  if (schoolsError) throw new Error(`Failed to load school: ${schoolsError.message}`);
  const schoolId = schools?.[0]?.id;
  if (!schoolId) throw new Error("No school found. Create a school first.");

  const { data: branches, error: branchesError } = await supabase
    .from("branches")
    .select("id")
    .eq("school_id", schoolId)
    .order("created_at", { ascending: true })
    .limit(1);

  if (branchesError) throw new Error(`Failed to load branch: ${branchesError.message}`);
  const branchId = branches?.[0]?.id;
  if (!branchId) throw new Error("No branch found for school.");

  return { schoolId, branchId };
}

async function listAuthUserByEmail(supabase, email) {
  const { data: listed, error } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (error) throw new Error(`Failed to list users: ${error.message}`);
  const user = listed?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());
  return user ?? null;
}

async function upsertSubject(supabase, branchId, name) {
  const { data: existing } = await supabase
    .from("subjects")
    .select("id")
    .eq("branch_id", branchId)
    .eq("name", name)
    .limit(1)
    .maybeSingle();

  if (existing?.id) return existing.id;

  const { data, error } = await supabase
    .from("subjects")
    .insert({ branch_id: branchId, name })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function ensureClassWithOptionalSection(supabase, branchId, className) {
  const { data: existing } = await supabase
    .from("classes")
    .select("id,name,grade,section_id")
    .eq("branch_id", branchId)
    .ilike("name", className)
    .limit(1)
    .maybeSingle();

  if (existing?.id) return existing.id;

  // Create a default section if none exists. (section_id is optional, but this keeps UI prettier.)
  const { data: sectionExisting } = await supabase
    .from("sections")
    .select("id,name")
    .eq("branch_id", branchId)
    .eq("name", "A")
    .maybeSingle();

  let sectionId = sectionExisting?.id ?? null;
  if (!sectionId) {
    const { data: sectionData, error: sectionError } = await supabase
      .from("sections")
      .insert({ branch_id: branchId, name: "A" })
      .select("id")
      .single();
    if (sectionError) throw sectionError;
    sectionId = sectionData.id;
  }

  const { data, error } = await supabase
    .from("classes")
    .insert({
      branch_id: branchId,
      name: className,
      grade: "Nursery",
      section_id: sectionId,
      capacity: 30,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function ensureGuardianForParentAuth(supabase, schoolId, parentAuthUserId) {
  const { data: existing } = await supabase
    .from("guardians")
    .select("id,auth_user_id")
    .eq("auth_user_id", parentAuthUserId)
    .maybeSingle();

  if (existing?.id) return existing.id;

  // guardians.email is NOT NULL; use parent email.
  const { data, error } = await supabase
    .from("guardians")
    .insert({
      school_id: schoolId,
      name: "Nursery 1 Parent",
      email: PARENT_EMAIL,
      phone: null,
      relation: "guardian",
      auth_user_id: parentAuthUserId,
    })
    .select("id")
    .single();
  if (error) throw error;
  return data.id;
}

async function upsertStudentBySeedNotes({
  supabase,
  schoolId,
  branchId,
  classId,
  firstName,
  lastName,
  dob,
  gender,
  notes,
}) {
  const { data: existing } = await supabase
    .from("students")
    .select("id")
    .eq("school_id", schoolId)
    .eq("branch_id", branchId)
    .eq("class_id", classId)
    .eq("notes", notes)
    .maybeSingle();

  if (existing?.id) {
    const { error } = await supabase
      .from("students")
      .update({
        first_name: firstName,
        last_name: lastName,
        date_of_birth: dob,
        gender: gender ?? null,
        status: "active",
      })
      .eq("id", existing.id);
    if (error) throw error;
    return existing.id;
  }

  const { data, error } = await supabase
    .from("students")
    .insert({
      school_id: schoolId,
      branch_id: branchId,
      class_id: classId,
      first_name: firstName,
      last_name: lastName,
      date_of_birth: dob,
      gender: gender ?? null,
      status: "active",
      notes,
    })
    .select("id")
    .single();

  if (error) throw error;
  return data.id;
}

async function upsertTimetableSlot(supabase, { classId, teacherProfileId, subjectId, day, period, startTime, endTime }) {
  // Note: 00016 drops the UNIQUE constraint for (class_id, day, period),
  // so we can't use upsert with onConflict. Do a manual select + update/insert.
  const { data: existingRows, error: existingError } = await supabase
    .from("timetable_slots")
    .select("id")
    .eq("class_id", classId)
    .eq("day", day)
    .eq("period", period);

  if (existingError) throw existingError;

  if (existingRows && existingRows.length > 0) {
    const { error: updateError } = await supabase
      .from("timetable_slots")
      .update({
        subject_id: subjectId,
        teacher_id: teacherProfileId,
        start_time: startTime ?? null,
        end_time: endTime ?? null,
      })
      .eq("class_id", classId)
      .eq("day", day)
      .eq("period", period);
    if (updateError) throw updateError;
    return;
  }

  const { error: insertError } = await supabase.from("timetable_slots").insert({
    class_id: classId,
    day,
    period,
    subject_id: subjectId,
    teacher_id: teacherProfileId,
    start_time: startTime ?? null,
    end_time: endTime ?? null,
  });
  if (insertError) throw insertError;
}

async function linkGuardianToStudent(supabase, guardianId, studentId) {
  const { error } = await supabase
    .from("guardian_students")
    .upsert(
      { guardian_id: guardianId, student_id: studentId },
      { onConflict: "guardian_id,student_id" }
    );
  if (error) throw error;
}

let phase = "start";

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env/.env.local");
  }

  const supabase = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  phase = "load school+branch";
  const { schoolId, branchId } = await ensureSchoolAndBranch(supabase);

  phase = "find teacher auth user";
  const teacherAuthUser = await listAuthUserByEmail(supabase, TEACHER_EMAIL);
  if (!teacherAuthUser?.id) throw new Error(`Teacher auth user not found for ${TEACHER_EMAIL}`);

  phase = "find parent auth user";
  const parentAuthUser = await listAuthUserByEmail(supabase, PARENT_EMAIL);
  if (!parentAuthUser?.id) throw new Error(`Parent auth user not found for ${PARENT_EMAIL}`);

  const teacherProfileId = teacherAuthUser.id;

  phase = "ensure class Nursery 1 exists";
  const classId = await ensureClassWithOptionalSection(supabase, branchId, TARGET_CLASS_NAME);

  // Ensure subjects exist for timetable assignment.
  phase = "ensure subjects";
  const subjectIdsByName = {};
  for (const name of SUBJECT_NAMES) {
    subjectIdsByName[name] = await upsertSubject(supabase, branchId, name);
  }

  // Assign teacher to this class (at least one slot so teacher "My Classes" shows it).
  phase = "upsert timetable slot (Mon/P1)";
  const subjectId = subjectIdsByName["Mathematics"] ?? Object.values(subjectIdsByName)[0];
  await upsertTimetableSlot(supabase, {
    classId,
    teacherProfileId,
    subjectId,
    day: 1, // Mon
    period: 1,
    startTime: "08:00",
    endTime: "08:45",
  });

  phase = "ensure guardian for parent auth user";
  const guardianId = await ensureGuardianForParentAuth(supabase, schoolId, parentAuthUser.id);

  const firstNames = ["Liam", "Emma", "Noah", "Olivia", "Ava", "Lucas", "Mia", "Elijah", "Sophia", "Leo"];
  const lastNames = ["Smith", "Johnson", "Brown", "Williams", "Jones", "Garcia", "Miller", "Davis", "Taylor", "Anderson"];

  const createdStudentIds = [];
  for (let i = 1; i <= STUDENTS_COUNT; i++) {
    phase = `upsert student ${i}/${STUDENTS_COUNT}`;
    const seedNotes = `${SEED_MARKER_PREFIX}-${TARGET_CLASS_NAME}-${String(i).padStart(2, "0")}`;

    const firstName = firstNames[(i - 1) % firstNames.length];
    const lastName = lastNames[(i * 3) % lastNames.length];
    const gender = i % 2 === 0 ? "female" : "male";
    const dob = dobForIndex(i);

    const studentId = await upsertStudentBySeedNotes({
      supabase,
      schoolId,
      branchId,
      classId,
      firstName,
      lastName,
      dob,
      gender,
      notes: seedNotes,
    });
    createdStudentIds.push(studentId);

    await linkGuardianToStudent(supabase, guardianId, studentId);
  }

  // Final sanity check count
  const { data: studentsCountData, error: countError } = await supabase
    .from("students")
    .select("id", { count: "exact" })
    .eq("class_id", classId)
    .eq("status", "active");
  if (countError) throw countError;
  const activeCount = Array.isArray(studentsCountData) ? studentsCountData.length : null;

  console.log("Nursery 1 full seed complete");
  console.log(`- class: ${TARGET_CLASS_NAME} (${classId})`);
  console.log(`- students requested: ${STUDENTS_COUNT}`);
  console.log(`- linked students created/upserted: ${createdStudentIds.length}`);
  console.log(`- active students in class (current query): ${activeCount ?? "(unknown)"}`);
  console.log(`- teacher assigned: ${TEACHER_EMAIL} -> Mon/P1 (Math)`);
  console.log(`- parent guardian linked: ${PARENT_EMAIL} (${guardianId})`);
}

main().catch((err) => {
  console.error("Seed failed:", err?.message ?? err);
  if (err?.stack) console.error(err.stack);
  console.error("Phase:", phase);
  process.exit(1);
});

