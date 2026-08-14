import { createClient } from "@/lib/supabase/server";

export type ClassListItem = {
  id: string;
  name: string;
  grade: string | null;
  capacity: number | null;
  student_count: number;
  branch_id: string;
  main_teacher_id: string | null;
};

export type PublicClassListItem = {
  id: string;
  name: string;
  grade: string | null;
  capacity: number | null;
  student_count: number;
  seats_remaining: number | null;
  is_full: boolean;
};

async function attachStudentCounts<T extends { id: string }>(
  classes: T[]
): Promise<(T & { student_count: number })[]> {
  const classIds = classes.map((c) => c.id);
  const countByClass: Record<string, number> = {};

  if (classIds.length > 0) {
    const supabase = await createClient();
    const { data: students, error: studentsError } = await supabase
      .from("students")
      .select("id, class_id")
      .in("class_id", classIds)
      .eq("status", "active");

    if (studentsError) {
      console.error("attachStudentCounts error:", studentsError);
    } else {
      for (const s of students ?? []) {
        if (s.class_id) countByClass[s.class_id] = (countByClass[s.class_id] ?? 0) + 1;
      }
    }
  }

  return classes.map((c) => ({
    ...c,
    student_count: countByClass[c.id] ?? 0,
  }));
}

export async function getClasses(
  branchIdOrOptions?: string | { branchId?: string; schoolId?: string }
): Promise<ClassListItem[]> {
  const branchId =
    typeof branchIdOrOptions === "string"
      ? branchIdOrOptions
      : branchIdOrOptions?.branchId;
  const schoolId =
    typeof branchIdOrOptions === "string"
      ? undefined
      : branchIdOrOptions?.schoolId;

  const supabase = await createClient();
  let query = supabase
    .from("classes")
    .select("id, name, grade, capacity, branch_id, main_teacher_id")
    .order("name");

  if (branchId) {
    query = query.eq("branch_id", branchId);
  } else if (schoolId) {
    const { data: branches } = await supabase
      .from("branches")
      .select("id")
      .eq("school_id", schoolId);
    const branchIds = (branches ?? []).map((b) => b.id);
    if (branchIds.length === 0) return [];
    query = query.in("branch_id", branchIds);
  }

  const { data, error } = await query;
  if (error) {
    console.error("getClasses error:", error);
    return [];
  }

  const withCounts = await attachStudentCounts(data ?? []);

  return withCounts.map((c) => ({
    id: c.id,
    name: c.name,
    grade: c.grade,
    capacity: c.capacity,
    student_count: c.student_count,
    branch_id: c.branch_id,
    main_teacher_id: c.main_teacher_id ?? null,
  }));
}

/** Public class list for school enrollment page (no student names). */
export async function getPublicClassesForSchool(
  schoolId: string
): Promise<PublicClassListItem[]> {
  const classes = await getClasses({ schoolId });

  return classes.map((c) => {
    const seatsRemaining =
      c.capacity != null ? Math.max(0, c.capacity - c.student_count) : null;
    const isFull = c.capacity != null && c.student_count >= c.capacity;

    return {
      id: c.id,
      name: c.name,
      grade: c.grade,
      capacity: c.capacity,
      student_count: c.student_count,
      seats_remaining: seatsRemaining,
      is_full: isFull,
    };
  });
}
