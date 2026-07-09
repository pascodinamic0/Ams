import { createClient } from "@/lib/supabase/server";

/** Student/parent portal assignment row */
export type StudentAssignmentItem = {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  teacher_name: string | null;
  submitted_at: string | null;
  grade: number | null;
};

export type AssignmentListItem = StudentAssignmentItem;

export type GuardianAssignmentRow = StudentAssignmentItem & {
  student_id: string;
  student_name: string;
};

/** Teacher portal assignment row */
export type TeacherAssignmentListItem = {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  class_id: string;
  class_name: string;
  created_at: string;
  submission_count: number;
  graded_count: number;
};

export type AssignmentSubmissionItem = {
  id: string;
  student_id: string;
  student_name: string;
  submitted_at: string | null;
  grade: number | null;
  text_response: string | null;
};

export async function getAssignmentsForStudent(studentId: string): Promise<StudentAssignmentItem[]> {
  const supabase = await createClient();

  const { data: student, error: studentError } = await supabase
    .from("students")
    .select("class_id")
    .eq("id", studentId)
    .single();

  if (studentError || !student?.class_id) return [];

  const { data: assignments, error } = await supabase
    .from("assignments")
    .select("id, title, description, due_date, profiles(name)")
    .eq("class_id", student.class_id)
    .order("due_date", { ascending: true, nullsFirst: false });

  if (error) {
    console.error("getAssignmentsForStudent error:", error);
    return [];
  }

  const assignmentIds = (assignments ?? []).map((a) => a.id);
  const { data: submissions } = assignmentIds.length
    ? await supabase
        .from("assignment_submissions")
        .select("assignment_id, submitted_at, grade")
        .eq("student_id", studentId)
        .in("assignment_id", assignmentIds)
    : { data: [] };

  const subMap = new Map((submissions ?? []).map((s) => [s.assignment_id, s]));

  return (assignments ?? []).map((a) => {
    const sub = subMap.get(a.id);
    return {
      id: a.id,
      title: a.title,
      description: a.description,
      due_date: a.due_date,
      teacher_name: (a.profiles as { name?: string } | null)?.name ?? null,
      submitted_at: sub?.submitted_at ?? null,
      grade: sub?.grade !== null && sub?.grade !== undefined ? Number(sub.grade) : null,
    };
  });
}

export async function getUpcomingAssignmentsForStudent(
  studentId: string,
  limit = 5
): Promise<StudentAssignmentItem[]> {
  const all = await getAssignmentsForStudent(studentId);
  const now = new Date();
  return all
    .filter((a) => !a.submitted_at && (!a.due_date || new Date(a.due_date) >= now))
    .slice(0, limit);
}

export async function getAssignmentsForGuardianStudents(
  children: { id: string; name: string }[]
): Promise<GuardianAssignmentRow[]> {
  const rows: GuardianAssignmentRow[] = [];
  for (const child of children) {
    const assignments = await getAssignmentsForStudent(child.id);
    for (const a of assignments) {
      rows.push({ ...a, student_id: child.id, student_name: child.name });
    }
  }
  return rows.sort((a, b) => {
    if (!a.due_date) return 1;
    if (!b.due_date) return -1;
    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
  });
}

export async function getAssignmentsByTeacher(teacherId: string): Promise<TeacherAssignmentListItem[]> {
  const supabase = await createClient();

  const { data: assignments, error } = await supabase
    .from("assignments")
    .select("id, title, description, due_date, class_id, created_at, classes(name)")
    .eq("teacher_id", teacherId)
    .order("due_date", { ascending: true, nullsFirst: false });

  if (error) {
    console.error("getAssignmentsByTeacher error:", error);
    return [];
  }

  const assignmentIds = (assignments ?? []).map((a) => a.id);
  if (assignmentIds.length === 0) return [];

  const { data: submissions, error: subError } = await supabase
    .from("assignment_submissions")
    .select("assignment_id, grade, submitted_at")
    .in("assignment_id", assignmentIds);

  if (subError) {
    console.error("getAssignmentsByTeacher submissions error:", subError);
  }

  const stats: Record<string, { submissions: number; graded: number }> = {};
  for (const sub of submissions ?? []) {
    if (!stats[sub.assignment_id]) stats[sub.assignment_id] = { submissions: 0, graded: 0 };
    if (sub.submitted_at) stats[sub.assignment_id].submissions++;
    if (sub.grade !== null) stats[sub.assignment_id].graded++;
  }

  return (assignments ?? []).map((a) => ({
    id: a.id,
    title: a.title,
    description: a.description,
    due_date: a.due_date,
    class_id: a.class_id,
    class_name: (a.classes as { name?: string } | null)?.name ?? "Class",
    created_at: a.created_at,
    submission_count: stats[a.id]?.submissions ?? 0,
    graded_count: stats[a.id]?.graded ?? 0,
  }));
}

export async function getAssignmentSubmissions(
  assignmentId: string
): Promise<AssignmentSubmissionItem[]> {
  const supabase = await createClient();

  const { data: assignment, error: assignmentError } = await supabase
    .from("assignments")
    .select("class_id")
    .eq("id", assignmentId)
    .single();

  if (assignmentError || !assignment) return [];

  const { data: students, error: studentsError } = await supabase
    .from("students")
    .select("id, first_name, last_name")
    .eq("class_id", assignment.class_id)
    .eq("status", "active")
    .order("last_name");

  if (studentsError) {
    console.error("getAssignmentSubmissions students error:", studentsError);
    return [];
  }

  const { data: submissions, error: subError } = await supabase
    .from("assignment_submissions")
    .select("id, student_id, submitted_at, grade, text_response")
    .eq("assignment_id", assignmentId);

  if (subError) {
    console.error("getAssignmentSubmissions error:", subError);
  }

  const subMap = new Map((submissions ?? []).map((s) => [s.student_id, s]));

  return (students ?? []).map((s) => {
    const sub = subMap.get(s.id);
    return {
      id: sub?.id ?? "",
      student_id: s.id,
      student_name: `${s.first_name} ${s.last_name}`,
      submitted_at: sub?.submitted_at ?? null,
      grade: sub?.grade !== null && sub?.grade !== undefined ? Number(sub.grade) : null,
      text_response: sub?.text_response ?? null,
    };
  });
}
