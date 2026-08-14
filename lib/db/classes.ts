import { createClient } from "@/lib/supabase/server";

export type ClassListItem = {
  id: string;
  name: string;
  grade: string | null;
  capacity: number | null;
  student_count: number;
  branch_id: string;
};

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
    .select("id, name, grade, capacity, branch_id")
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

  const classes = data ?? [];
  const classIds = classes.map((c) => c.id);
  const countByClass: Record<string, number> = {};

  if (classIds.length > 0) {
    const { data: students, error: studentsError } = await supabase
      .from("students")
      .select("id, class_id")
      .in("class_id", classIds)
      .eq("status", "active");

    if (studentsError) {
      console.error("getClasses students error:", studentsError);
    } else {
      for (const s of students ?? []) {
        if (s.class_id) countByClass[s.class_id] = (countByClass[s.class_id] ?? 0) + 1;
      }
    }
  }

  return classes.map((c) => ({
    id: c.id,
    name: c.name,
    grade: c.grade,
    capacity: c.capacity,
    student_count: countByClass[c.id] ?? 0,
    branch_id: c.branch_id,
  }));
}
