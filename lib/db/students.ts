import { createClient } from "@/lib/supabase/server";
import { formatPersonName } from "@/lib/utils";

export type StudentPortalProfile = {
  id: string;
  student_id: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  name: string;
  class_id: string | null;
  class_name: string | null;
  branch_id: string;
  school_id: string;
  status: string;
};

export async function getStudentByAuthUserId(
  authUserId: string
): Promise<StudentPortalProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("students")
    .select(`
      id,
      student_id,
      first_name,
      middle_name,
      last_name,
      class_id,
      branch_id,
      school_id,
      status,
      classes(name)
    `)
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("getStudentByAuthUserId error:", error);
    return null;
  }

  return {
    id: data.id,
    student_id: data.student_id,
    first_name: data.first_name,
    middle_name: data.middle_name ?? null,
    last_name: data.last_name,
    name: formatPersonName(data),
    class_id: data.class_id,
    class_name: (data.classes as { name?: string } | null)?.name ?? null,
    branch_id: data.branch_id,
    school_id: data.school_id,
    status: data.status ?? "active",
  };
}

export type StudentListItem = {
  id: string;
  student_id: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  name: string;
  photo_url: string | null;
  class_id: string | null;
  class_name: string | null;
  guardian_name: string | null;
  status: string;
};

export async function getStudents(options?: {
  search?: string;
  classId?: string;
  status?: string;
  branchId?: string;
  schoolId?: string;
}): Promise<StudentListItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from("students")
    .select(`
      id,
      student_id,
      first_name,
      middle_name,
      last_name,
      photo_url,
      status,
      class_id,
      classes(name),
      guardian_students(guardians(name))
    `)
    .order("created_at", { ascending: false });

  if (options?.branchId) {
    query = query.eq("branch_id", options.branchId);
  }
  if (options?.schoolId) {
    query = query.eq("school_id", options.schoolId);
  }
  if (options?.classId) {
    query = query.eq("class_id", options.classId);
  }
  if (options?.status) {
    query = query.eq("status", options.status);
  }
  if (options?.search) {
    const term = `%${options.search}%`;
    query = query.or(
      `first_name.ilike.${term},middle_name.ilike.${term},last_name.ilike.${term},student_id.ilike.${term}`
    );
  }

  const { data, error } = await query;

  if (error) {
    console.error("getStudents error:", error);
    return [];
  }

  return (data ?? []).map((s) => {
    const links = (s.guardian_students as Array<{ guardians: { name?: string } | null }> | null) ?? [];
    const guardianName = links[0]?.guardians?.name ?? null;
    return {
      id: s.id,
      student_id: s.student_id,
      first_name: s.first_name,
      middle_name: s.middle_name ?? null,
      last_name: s.last_name,
      name: formatPersonName(s),
      photo_url: s.photo_url ?? null,
      class_id: s.class_id,
      class_name: (s.classes as { name?: string } | null)?.name ?? null,
      guardian_name: guardianName,
      status: s.status ?? "active",
    };
  });
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
        guardians(id, name, first_name, middle_name, last_name, email, phone, relation, address, workplace)
      )
    `
    )
    .eq("id", id)
    .single();

  if (error || !data) {
    if (error) console.error("getStudentById error:", error);
    return null;
  }
  return data;
}
