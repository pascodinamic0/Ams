#!/usr/bin/env node
/**
 * Seeds a full demo dataset for every AMS module: users, academic structure,
 * students, guardians, timetable, grades/exams, report cards, assignments,
 * attendance, finance, operations, admissions, and messaging.
 *
 * Usage: bun run seed:demo-data
 *
 * Safe to re-run (idempotent upserts). Remove demo data manually when done.
 * Password for all @ams.demo accounts: AMSdemo2026!
 */

import { config } from "dotenv";
import { createClient } from "@supabase/supabase-js";

config({ path: ".env.local" });
config({ path: ".env" });

const DEMO_PASSWORD = "AMSdemo2026!";
const DEMO_MARKER = "demo-seed";

const DEMO_USERS = [
  { email: "super.admin@ams.demo", role: "super_admin", name: "Super Admin Demo", schoolScoped: false },
  { email: "academic.admin@ams.demo", role: "academic_admin", name: "Academic Admin", schoolScoped: true },
  { email: "teacher@ams.demo", role: "teacher", name: "Demo Teacher", schoolScoped: true },
  { email: "teacher2@ams.demo", role: "teacher", name: "Sarah Mitchell", schoolScoped: true },
  { email: "finance@ams.demo", role: "finance_officer", name: "Finance Officer", schoolScoped: true },
  { email: "operations@ams.demo", role: "operations_manager", name: "Operations Manager", schoolScoped: true },
  { email: "parent@ams.demo", role: "parent", name: "Demo Parent", schoolScoped: true },
  { email: "student@ams.demo", role: "student", name: "Demo Student", schoolScoped: true },
  { email: "analytics@ams.demo", role: "analytics", name: "Analytics User", schoolScoped: true },
];

const SUBJECTS = ["Mathematics", "English", "Science", "History", "Physical Education"];
const SECTIONS = ["A", "B"];
const CLASSES = [
  { key: "9A", name: "Grade 9 - A", grade: "9", section: "A" },
  { key: "9B", name: "Grade 9 - B", grade: "9", section: "B" },
  { key: "10A", name: "Grade 10 - A", grade: "10", section: "A" },
];

const EXAM_TERMS = ["Term 1", "Midterm Exam", "Term 2"];
const REPORT_TERM = "Term 1";

const DEMO_STUDENTS = [
  { key: "demo", first: "Demo", last: "Student", dob: "2010-06-15", gender: "other", classKey: "9A", authEmail: "student@ams.demo", guardianEmail: "parent@ams.demo", guardianName: "Demo Parent", relation: "guardian" },
  { key: "emma", first: "Emma", last: "Johnson", dob: "2010-03-12", gender: "female", classKey: "9A", guardianEmail: "parent@ams.demo", guardianName: "Demo Parent", relation: "mother" },
  { key: "liam", first: "Liam", last: "Chen", dob: "2010-08-22", gender: "male", classKey: "9A", guardianEmail: "liam.parent@ams.demo", guardianName: "Wei Chen", relation: "father" },
  { key: "sophia", first: "Sophia", last: "Williams", dob: "2010-11-05", gender: "female", classKey: "9A", guardianEmail: "sophia.parent@ams.demo", guardianName: "Maria Williams", relation: "mother" },
  { key: "noah", first: "Noah", last: "Brown", dob: "2010-01-18", gender: "male", classKey: "9B", guardianEmail: "noah.parent@ams.demo", guardianName: "James Brown", relation: "father" },
  { key: "ava", first: "Ava", last: "Martinez", dob: "2010-07-30", gender: "female", classKey: "9B", guardianEmail: "ava.parent@ams.demo", guardianName: "Elena Martinez", relation: "mother" },
  { key: "ethan", first: "Ethan", last: "Taylor", dob: "2009-04-14", gender: "male", classKey: "10A", guardianEmail: "ethan.parent@ams.demo", guardianName: "Robert Taylor", relation: "father" },
  { key: "mia", first: "Mia", last: "Anderson", dob: "2009-09-09", gender: "female", classKey: "10A", guardianEmail: "mia.parent@ams.demo", guardianName: "Lisa Anderson", relation: "mother" },
];

// ??? Helpers ???????????????????????????????????????????????????????????????

function letterGrade(marks) {
  if (marks >= 90) return "A";
  if (marks >= 80) return "B";
  if (marks >= 70) return "C";
  if (marks >= 60) return "D";
  return "F";
}

function seededMarks(seed) {
  return 55 + ((seed * 17 + 43) % 41);
}

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function daysFromNow(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

async function upsertByMatch(supabase, table, match, payload) {
  let query = supabase.from(table).select("id");
  for (const [col, val] of Object.entries(match)) {
    query = query.eq(col, val);
  }
  const { data: existing } = await query.maybeSingle();

  if (existing?.id) {
    const { error } = await supabase.from(table).update(payload).eq("id", existing.id);
    if (error) throw error;
    return existing.id;
  }

  const { data, error } = await supabase.from(table).insert({ ...match, ...payload }).select("id").single();
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
  const payload = { id: userId, name, role, updated_at: new Date().toISOString() };
  if (schoolScoped) {
    payload.school_id = schoolId;
    payload.branch_id = branchId;
  }
  const { error } = await supabase.from("profiles").upsert(payload, { onConflict: "id" });
  if (error) throw error;
}

// ??? Seed phases ?????????????????????????????????????????????????????????????

async function ensureSchool(supabase) {
  const { data: existing } = await supabase
    .from("schools")
    .select("id, name")
    .eq("code", "GREENWOOD")
    .maybeSingle();

  if (existing) return existing;

  const { data, error } = await supabase
    .from("schools")
    .insert({
      name: "Greenwood Academy",
      code: "GREENWOOD",
      slug: "greenwood-academy",
      about: "A demo school for exploring AMS features.",
      contact_email: "info@greenwood-academy.demo",
      contact_phone: "+1-555-0100",
      address: "123 Education Lane, Demo City",
      public_site_enabled: true,
      website_template: "modern",
      status: "approved",
    })
    .select("id, name")
    .single();

  if (error) throw error;
  return data;
}

async function ensureBranch(supabase, schoolId) {
  return upsertByMatch(
    supabase,
    "branches",
    { school_id: schoolId, name: "Main Campus" },
    { address: "123 Education Lane", status: "active" }
  );
}

async function seedUsers(supabase, schoolId, branchId) {
  const userIds = {};
  for (const account of DEMO_USERS) {
    userIds[account.email] = await upsertAuthUser(supabase, {
      email: account.email,
      password: DEMO_PASSWORD,
      role: account.role,
      name: account.name,
    });
    await upsertProfile(supabase, {
      userId: userIds[account.email],
      role: account.role,
      name: account.name,
      schoolId,
      branchId,
      schoolScoped: account.schoolScoped,
    });
  }
  return userIds;
}

async function seedAcademicStructure(supabase, branchId) {
  const sectionIds = {};
  for (const name of SECTIONS) {
    sectionIds[name] = await upsertByMatch(
      supabase,
      "sections",
      { branch_id: branchId, name },
      {}
    );
  }

  const classIds = {};
  for (const cls of CLASSES) {
    classIds[cls.key] = await upsertByMatch(
      supabase,
      "classes",
      { branch_id: branchId, name: cls.name },
      { grade: cls.grade, section_id: sectionIds[cls.section], capacity: 30 }
    );
  }

  const subjectIds = {};
  for (const name of SUBJECTS) {
    subjectIds[name] = await upsertByMatch(
      supabase,
      "subjects",
      { branch_id: branchId, name },
      {}
    );
  }

  for (const cls of CLASSES) {
    for (const subjectName of SUBJECTS) {
      await upsertByMatch(
        supabase,
        "curriculum",
        { branch_id: branchId, grade: cls.grade, subject_id: subjectIds[subjectName] },
        { syllabus: `${subjectName} syllabus for Grade ${cls.grade} (${DEMO_MARKER})` }
      );
    }
  }

  return { sectionIds, classIds, subjectIds };
}

async function seedStudentsAndGuardians(supabase, schoolId, branchId, classIds, userIds) {
  const studentIds = {};
  const guardianIds = {};

  for (const s of DEMO_STUDENTS) {
    const authUserId = s.authEmail ? userIds[s.authEmail] : null;

    if (s.guardianEmail && !guardianIds[s.guardianEmail]) {
      const parentAuthId = s.guardianEmail === "parent@ams.demo" ? userIds["parent@ams.demo"] : null;
      guardianIds[s.guardianEmail] = await upsertByMatch(
        supabase,
        "guardians",
        { school_id: schoolId, email: s.guardianEmail },
        {
          name: s.guardianName,
          phone: "+15550100" + String(Object.keys(guardianIds).length + 1).padStart(2, "0"),
          relation: s.relation,
          auth_user_id: parentAuthId,
        }
      );
    }

    let studentId;
    if (authUserId) {
      studentId = await upsertByMatch(
        supabase,
        "students",
        { auth_user_id: authUserId },
        {
          school_id: schoolId,
          branch_id: branchId,
          first_name: s.first,
          last_name: s.last,
          date_of_birth: s.dob,
          gender: s.gender,
          class_id: classIds[s.classKey],
          status: "active",
          notes: s.key === "demo" ? "Demo account — no known allergies." : null,
        }
      );
    } else {
      const { data: existing } = await supabase
        .from("students")
        .select("id")
        .eq("school_id", schoolId)
        .eq("first_name", s.first)
        .eq("last_name", s.last)
        .eq("date_of_birth", s.dob)
        .maybeSingle();

      if (existing?.id) {
        await supabase
          .from("students")
          .update({ class_id: classIds[s.classKey], branch_id: branchId, status: "active" })
          .eq("id", existing.id);
        studentId = existing.id;
      } else {
        const { data, error } = await supabase
          .from("students")
          .insert({
            school_id: schoolId,
            branch_id: branchId,
            first_name: s.first,
            last_name: s.last,
            date_of_birth: s.dob,
            gender: s.gender,
            class_id: classIds[s.classKey],
            status: "active",
          })
          .select("id")
          .single();
        if (error) throw error;
        studentId = data.id;
      }
    }

    studentIds[s.key] = studentId;

    if (s.guardianEmail) {
      const { error: linkError } = await supabase.from("guardian_students").upsert(
        { guardian_id: guardianIds[s.guardianEmail], student_id: studentId },
        { onConflict: "guardian_id,student_id" }
      );
      if (linkError) throw linkError;
    }
  }

  return { studentIds, guardianIds };
}

async function seedTimetable(supabase, classIds, subjectIds, teacherId, teacher2Id) {
  const primaryClassId = classIds["9A"];
  const schedule = [
    { day: 1, period: 1, subject: "Mathematics", teacher: teacherId },
    { day: 1, period: 2, subject: "English", teacher: teacherId },
    { day: 1, period: 3, subject: "Science", teacher: teacher2Id },
    { day: 2, period: 1, subject: "History", teacher: teacherId },
    { day: 2, period: 2, subject: "Physical Education", teacher: teacher2Id },
    { day: 3, period: 1, subject: "Mathematics", teacher: teacherId },
    { day: 3, period: 2, subject: "Science", teacher: teacher2Id },
    { day: 4, period: 1, subject: "English", teacher: teacherId },
    { day: 5, period: 1, subject: "Mathematics", teacher: teacherId },
    { day: 5, period: 2, subject: "History", teacher: teacherId },
  ];

  for (const slot of schedule) {
    await upsertByMatch(
      supabase,
      "timetable_slots",
      { class_id: primaryClassId, day: slot.day, period: slot.period },
      { subject_id: subjectIds[slot.subject], teacher_id: slot.teacher }
    );
  }

  // Secondary class gets a lighter schedule from teacher2
  await upsertByMatch(
    supabase,
    "timetable_slots",
    { class_id: classIds["9B"], day: 1, period: 1 },
    { subject_id: subjectIds["English"], teacher_id: teacher2Id }
  );
}

async function seedGrades(supabase, studentIds, classIds, subjectIds) {
  let seed = 0;
  const class9A = classIds["9A"];
  const class9B = classIds["9B"];
  const class10A = classIds["10A"];

  const studentsByClass = {
    [class9A]: ["demo", "emma", "liam", "sophia"],
    [class9B]: ["noah", "ava"],
    [class10A]: ["ethan", "mia"],
  };

  for (const term of EXAM_TERMS) {
    for (const [classId, studentKeys] of Object.entries(studentsByClass)) {
      for (const studentKey of studentKeys) {
        const studentId = studentIds[studentKey];
        for (const subjectName of SUBJECTS) {
          seed += 1;
          const marks = seededMarks(seed);
          const { data: existing } = await supabase
            .from("grades")
            .select("id")
            .eq("student_id", studentId)
            .eq("subject_id", subjectIds[subjectName])
            .eq("term", term)
            .maybeSingle();

          const payload = {
            student_id: studentId,
            subject_id: subjectIds[subjectName],
            class_id: classId,
            term,
            marks,
            grade: letterGrade(marks),
          };

          if (existing?.id) {
            await supabase.from("grades").update(payload).eq("id", existing.id);
          } else {
            await supabase.from("grades").insert(payload);
          }
        }
      }
    }
  }
}

async function seedAssignments(supabase, classIds, subjectIds, teacherId, studentIds) {
  const classId = classIds["9A"];
  const assignments = [
    { title: "Algebra Problem Set 3", description: "Complete exercises 1-20 from chapter 5.", dueDays: 7 },
    { title: "Essay: My Summer", description: "Write a 500-word essay about your summer break.", dueDays: 14 },
    { title: "Science Lab Report", description: "Document your plant growth experiment results.", dueDays: -3 },
  ];

  const assignmentIds = [];
  for (const a of assignments) {
    const id = await upsertByMatch(
      supabase,
      "assignments",
      { class_id: classId, title: a.title },
      {
        teacher_id: teacherId,
        description: a.description,
        due_date: new Date(Date.now() + a.dueDays * 86400000).toISOString(),
      }
    );
    assignmentIds.push(id);
  }

  const classStudents = ["demo", "emma", "liam", "sophia"];
  for (let i = 0; i < assignmentIds.length; i++) {
    const assignmentId = assignmentIds[i];
    for (let j = 0; j < classStudents.length; j++) {
      const studentId = studentIds[classStudents[j]];
      const submitted = i < 2 || j < 3;
      const grade = submitted ? seededMarks(i * 10 + j) : null;
      const { error } = await supabase.from("assignment_submissions").upsert(
        {
          assignment_id: assignmentId,
          student_id: studentId,
          text_response: submitted ? `Submission for ${classStudents[j]} (${DEMO_MARKER})` : null,
          submitted_at: submitted ? new Date(Date.now() - (j + 1) * 86400000).toISOString() : null,
          graded_at: grade !== null ? new Date().toISOString() : null,
          grade,
        },
        { onConflict: "assignment_id,student_id" }
      );
      if (error) throw error;
    }
  }
}

async function seedAttendance(supabase, studentIds) {
  const class9AStudents = ["demo", "emma", "liam", "sophia"];
  for (let day = 1; day <= 14; day++) {
    const date = daysAgo(day);
    if (new Date(date).getDay() === 0) continue;
    for (let i = 0; i < class9AStudents.length; i++) {
      const studentId = studentIds[class9AStudents[i]];
      const status = (day + i) % 7 === 0 ? "absent" : "present";
      const { error } = await supabase.from("attendance_records").upsert(
        { student_id: studentId, date, status, period: 0 },
        { onConflict: "student_id,date,period" }
      );
      if (error) throw error;
    }
  }
}

async function seedFinance(supabase, branchId, classIds, studentIds, financeUserId) {
  const tuitionId = await upsertByMatch(
    supabase,
    "fee_structures",
    { branch_id: branchId, name: "Tuition — Term 1" },
    { amount: 2500, class_id: classIds["9A"], description: "Term 1 tuition fees" }
  );
  const transportFeeId = await upsertByMatch(
    supabase,
    "fee_structures",
    { branch_id: branchId, name: "Transport Fee" },
    { amount: 350, description: "Monthly school transport" }
  );

  const invoiceSpecs = [
    { studentKey: "demo", feeId: tuitionId, amount: 2500, paid: 2500, dueDays: -30, status: "paid" },
    { studentKey: "emma", feeId: tuitionId, amount: 2500, paid: 1000, dueDays: -5, status: "pending" },
    { studentKey: "liam", feeId: tuitionId, amount: 2500, paid: 0, dueDays: -20, status: "overdue" },
    { studentKey: "sophia", feeId: transportFeeId, amount: 350, paid: 350, dueDays: -10, status: "paid" },
  ];

  for (const inv of invoiceSpecs) {
    const studentId = studentIds[inv.studentKey];
    const dueDate = daysFromNow(inv.dueDays);
    const { data: existing } = await supabase
      .from("fee_invoices")
      .select("id")
      .eq("student_id", studentId)
      .eq("fee_structure_id", inv.feeId)
      .eq("description", `${DEMO_MARKER}: ${inv.studentKey}`)
      .maybeSingle();

    let invoiceId;
    if (existing?.id) {
      await supabase
        .from("fee_invoices")
        .update({ amount: inv.amount, amount_paid: inv.paid, due_date: dueDate, status: inv.status })
        .eq("id", existing.id);
      invoiceId = existing.id;
    } else {
      const { data, error } = await supabase
        .from("fee_invoices")
        .insert({
          student_id: studentId,
          fee_structure_id: inv.feeId,
          amount: inv.amount,
          amount_paid: inv.paid,
          due_date: dueDate,
          status: inv.status,
          description: `${DEMO_MARKER}: ${inv.studentKey}`,
        })
        .select("id")
        .single();
      if (error) throw error;
      invoiceId = data.id;
    }

    if (inv.paid > 0) {
      const { data: payExisting } = await supabase
        .from("fee_payments")
        .select("id")
        .eq("invoice_id", invoiceId)
        .eq("reference", `${DEMO_MARKER}-${inv.studentKey}`)
        .maybeSingle();

      if (!payExisting) {
        await supabase.from("fee_payments").insert({
          invoice_id: invoiceId,
          amount: inv.paid,
          method: "bank_transfer",
          reference: `${DEMO_MARKER}-${inv.studentKey}`,
          recorded_by: financeUserId,
        });
      }
    }
  }

  const expenses = [
    { category: "Utilities", amount: 1200, description: "Electricity — Main Campus", days: 5 },
    { category: "Supplies", amount: 450, description: "Classroom supplies", days: 12 },
    { category: "Maintenance", amount: 800, description: "HVAC repair", days: 20 },
  ];

  for (const exp of expenses) {
    await upsertByMatch(
      supabase,
      "expenses",
      { branch_id: branchId, category: exp.category, description: `${DEMO_MARKER}: ${exp.description}` },
      { amount: exp.amount, date: daysAgo(exp.days) }
    );
  }
}

async function seedOperations(supabase, schoolId, branchId, studentIds, userIds) {
  const teacherStaffId = await upsertByMatch(
    supabase,
    "staff",
    { school_id: schoolId, email: "teacher@ams.demo" },
    { branch_id: branchId, name: "Demo Teacher", role: "Teacher", profile_id: userIds["teacher@ams.demo"] }
  );
  const opsStaffId = await upsertByMatch(
    supabase,
    "staff",
    { school_id: schoolId, email: "operations@ams.demo" },
    { branch_id: branchId, name: "Operations Manager", role: "Operations", profile_id: userIds["operations@ams.demo"] }
  );

  await upsertByMatch(
    supabase,
    "payroll",
    { staff_id: teacherStaffId, period_start: daysAgo(30), period_end: daysAgo(1) },
    { amount: 3200, status: "paid" }
  );
  await upsertByMatch(
    supabase,
    "payroll",
    { staff_id: opsStaffId, period_start: daysAgo(30), period_end: daysAgo(1) },
    { amount: 2800, status: "pending" }
  );

  const bookId = await upsertByMatch(
    supabase,
    "books",
    { branch_id: branchId, title: "To Kill a Mockingbird", isbn: "978-0061120084" },
    { author: "Harper Lee", quantity: 12 }
  );
  await upsertByMatch(
    supabase,
    "books",
    { branch_id: branchId, title: "Introduction to Algebra" },
    { author: "AMS Press", quantity: 20 }
  );

  const { data: issueExisting } = await supabase
    .from("book_issues")
    .select("id")
    .eq("book_id", bookId)
    .eq("student_id", studentIds.demo)
    .maybeSingle();

  if (!issueExisting) {
    await supabase.from("book_issues").insert({
      book_id: bookId,
      student_id: studentIds.demo,
      due_at: daysFromNow(14),
    });
  }

  const routeId = await upsertByMatch(
    supabase,
    "transport_routes",
    { branch_id: branchId, name: "North Route" },
    { description: "Covers northern suburbs" }
  );
  const vehicleId = await upsertByMatch(
    supabase,
    "transport_vehicles",
    { route_id: routeId, name: "Bus 101" },
    { capacity: 40 }
  );

  for (const key of ["demo", "emma"]) {
    const { error } = await supabase.from("transport_student_mapping").upsert(
      { student_id: studentIds[key], vehicle_id: vehicleId },
      { onConflict: "student_id" }
    );
    if (error) throw error;
  }

  const events = [
    { title: "Parent-Teacher Conference", days: 10, type: "event", description: "Meet teachers to discuss student progress." },
    { title: "Sports Day", days: 25, type: "event", description: "Annual inter-house athletics." },
    { title: "Spring Break", days: 45, type: "holiday", description: "School closed." },
  ];

  for (const ev of events) {
    await upsertByMatch(
      supabase,
      "events",
      { branch_id: branchId, title: ev.title, date: daysFromNow(ev.days) },
      { type: ev.type, description: ev.description }
    );
  }
}

async function seedAdmissions(supabase, schoolId) {
  const applications = [
    { student_name: "Olivia Parker", guardian_name: "David Parker", guardian_email: "olivia.apply@ams.demo", class_applying: "Grade 9", status: "pending" },
    { student_name: "Marcus Lee", guardian_name: "Jennifer Lee", guardian_email: "marcus.apply@ams.demo", class_applying: "Grade 10", status: "pending" },
    { student_name: "Zoe Adams", guardian_name: "Chris Adams", guardian_email: "zoe.apply@ams.demo", class_applying: "Grade 9", status: "approved" },
  ];

  for (const app of applications) {
    await upsertByMatch(
      supabase,
      "admission_applications",
      { school_id: schoolId, student_name: app.student_name, guardian_email: app.guardian_email },
      {
        guardian_name: app.guardian_name,
        class_applying: app.class_applying,
        dob: "2011-05-15",
        gender: "other",
        source: "online",
        status: app.status,
      }
    );
  }
}

async function seedMessaging(supabase, userIds) {
  const teacherId = userIds["teacher@ams.demo"];
  const parentId = userIds["parent@ams.demo"];

  const { data: msgExisting } = await supabase
    .from("messages")
    .select("id")
    .eq("sender_id", teacherId)
    .eq("recipient_id", parentId)
    .eq("subject", "Welcome to Greenwood Academy")
    .maybeSingle();

  if (!msgExisting) {
    await supabase.from("messages").insert({
      sender_id: teacherId,
      recipient_id: parentId,
      subject: "Welcome to Greenwood Academy",
      body: "Hello! I'm Demo Teacher, your child's homeroom teacher. Feel free to reach out with any questions.",
    });
  }

  const notifications = [
    { userId: parentId, title: "Fee reminder", body: "Term 1 tuition payment is due soon." },
    { userId: userIds["student@ams.demo"], title: "New assignment", body: "Algebra Problem Set 3 has been posted." },
    { userId: teacherId, title: "Attendance submitted", body: "Today's attendance has been recorded." },
  ];

  for (const n of notifications) {
    const { data: existing } = await supabase
      .from("notifications")
      .select("id")
      .eq("user_id", n.userId)
      .eq("title", n.title)
      .maybeSingle();

    if (!existing) {
      await supabase.from("notifications").insert({
        user_id: n.userId,
        title: n.title,
        body: n.body,
        is_read: false,
      });
    }
  }
}

async function seedCampaign(supabase, schoolId, userIds) {
  await upsertByMatch(
    supabase,
    "campaigns",
    { school_id: schoolId, title: "Parent Meeting Reminder" },
    {
      created_by: userIds["operations@ams.demo"],
      body: "Reminder: Parent-Teacher conferences are next week. Please confirm your slot.",
      channel: "whatsapp",
      target: "all_parents",
      status: "draft",
    }
  );
}

// ??? Main ????????????????????????????????????????????????????????????????????

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

  console.log("Seeding demo data—\n");

  const school = await ensureSchool(supabase);
  console.log(`? School: ${school.name}`);

  const branchId = await ensureBranch(supabase, school.id);
  console.log("? Branch: Main Campus");

  const userIds = await seedUsers(supabase, school.id, branchId);
  console.log(`? ${DEMO_USERS.length} demo user accounts`);

  const { classIds, subjectIds } = await seedAcademicStructure(supabase, branchId);
  console.log(`? ${CLASSES.length} classes, ${SUBJECTS.length} subjects, curriculum`);

  const { studentIds } = await seedStudentsAndGuardians(supabase, school.id, branchId, classIds, userIds);
  console.log(`? ${DEMO_STUDENTS.length} students with guardians`);

  await seedTimetable(supabase, classIds, subjectIds, userIds["teacher@ams.demo"], userIds["teacher2@ams.demo"]);
  console.log("? Timetable (teacher classes for exams, gradebook, report cards)");

  await seedGrades(supabase, studentIds, classIds, subjectIds);
  console.log(`? Grades for ${EXAM_TERMS.join(", ")} (exams + report cards)`);

  await seedAssignments(supabase, classIds, subjectIds, userIds["teacher@ams.demo"], studentIds);
  console.log("? Assignments with submissions");

  await seedAttendance(supabase, studentIds);
  console.log("? Attendance records (last 2 weeks)");

  await seedFinance(supabase, branchId, classIds, studentIds, userIds["finance@ams.demo"]);
  console.log("? Fee structures, invoices, payments, expenses");

  await seedOperations(supabase, school.id, branchId, studentIds, userIds);
  console.log("? Staff, payroll, library, transport, events");

  await seedAdmissions(supabase, school.id);
  console.log("? Admission applications");

  await seedMessaging(supabase, userIds);
  console.log("? Messages and notifications");

  await seedCampaign(supabase, school.id, userIds);
  console.log("? Outreach campaign draft");

  console.log("\n--- Demo data ready ---");
  console.log(`School: ${school.name} (/schools/greenwood-academy)`);
  console.log(`Password (all @ams.demo accounts): ${DEMO_PASSWORD}`);
  console.log(`Report card term: ${REPORT_TERM} | Exam term example: Midterm Exam`);
  console.log("");
  for (const account of DEMO_USERS) {
    console.log(`${account.role.padEnd(22)} ${account.email}`);
  }
  console.log("\nLogin at /login — remove demo data manually when finished.");
  console.log("---\n");
}

main().catch((err) => {
  console.error("Seed failed:", err.message ?? err);
  process.exit(1);
});
