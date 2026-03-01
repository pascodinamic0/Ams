import { createClient } from "@/lib/supabase/server";

export type StudentListItem = {
  id: string;
  student_id: string | null;
  first_name: string;
  last_name: string;
  name: string;
  class_id: string | null;
  class_name: string | null;
  guardian_name: string | null;
  status: string;
};

export async function getStudents(options?: {
  search?: string;
  classId?: string;
  status?: string;
}): Promise<StudentListItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from("students")
    .select(`
      id,
      student_id,
      first_name,
      last_name,
      status,
      class_id,
      classes(name)
    `)
    .order("created_at", { ascending: false });

  if (options?.classId) {
    query = query.eq("class_id", options.classId);
  }
  if (options?.status) {
    query = query.eq("status", options.status);
  }
  if (options?.search) {
    const term = `%${options.search}%`;
    query = query.or(
      `first_name.ilike.${term},last_name.ilike.${term},student_id.ilike.${term}`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("getStudents error:", error);
    return [];
  }

  const students = data ?? [];
  const guardianIds = new Set<string>();
  for (const s of students) {
    // We'd need guardian_students join for guardian name - simplified for now
  }

  return students.map((s) => ({
    id: s.id,
    student_id: s.student_id,
    first_name: s.first_name,
    last_name: s.last_name,
    name: `${s.first_name} ${s.last_name}`,
    class_id: s.class_id,
    class_name: (s.classes as { name?: string } | null)?.name ?? null,
    guardian_name: null,
    status: s.status ?? "active",
  }));
}

export async function getStudentById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .select(
      `
      *,
      classes(name, grade),
      guardian_students(
        guardians(name, email, phone, relation)
      )
    `
    )
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data;
}
