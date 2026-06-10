import { createClient } from "@/lib/supabase/server";

export type LinkedStudent = {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  student_id: string | null;
  class_id: string | null;
  class_name: string | null;
  branch_id: string;
  status: string;
};

export type GuardianProfile = {
  id: string;
  name: string;
  email: string;
  school_id: string;
};

export type GuardianRecord = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  relation: string;
  address: string | null;
  workplace: string | null;
  school_id: string;
};

export async function getGuardianById(id: string): Promise<GuardianRecord | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("guardians")
    .select("id, name, email, phone, relation, address, workplace, school_id")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("getGuardianById error:", error);
    return null;
  }
  return data;
}

export async function getGuardianByAuthUserId(
  authUserId: string
): Promise<GuardianProfile | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("guardians")
    .select("id, name, email, school_id")
    .eq("auth_user_id", authUserId)
    .maybeSingle();

  if (error || !data) {
    if (error) console.error("getGuardianByAuthUserId error:", error);
    return null;
  }
  return data;
}

export async function getLinkedStudentsForGuardian(
  guardianId: string
): Promise<LinkedStudent[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("guardian_students")
    .select(`
      students(
        id,
        first_name,
        last_name,
        student_id,
        class_id,
        branch_id,
        status,
        classes(name)
      )
    `)
    .eq("guardian_id", guardianId);

  if (error) {
    console.error("getLinkedStudentsForGuardian error:", error);
    return [];
  }

  return (data ?? [])
    .map((link) => {
      const s = link.students as unknown as {
        id: string;
        first_name: string;
        last_name: string;
        student_id: string | null;
        class_id: string | null;
        branch_id: string;
        status: string;
        classes: { name?: string } | null;
      } | null;
      if (!s) return null;
      return {
        id: s.id,
        first_name: s.first_name,
        last_name: s.last_name,
        name: `${s.first_name} ${s.last_name}`,
        student_id: s.student_id,
        class_id: s.class_id,
        class_name: s.classes?.name ?? null,
        branch_id: s.branch_id,
        status: s.status ?? "active",
      };
    })
    .filter((s): s is LinkedStudent => s !== null);
}

export type GuardianListItem = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  relation: string;
  student_names: string;
};

export async function getGuardians(options?: {
  search?: string;
}): Promise<GuardianListItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from("guardians")
    .select(`
      id,
      name,
      email,
      phone,
      relation
    `)
    .order("name");

  if (options?.search) {
    const term = `%${options.search}%`;
    query = query.or(`name.ilike.${term},email.ilike.${term},phone.ilike.${term}`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("getGuardians error:", error);
    return [];
  }

  const guardians = data ?? [];

  // Fetch linked students for each guardian
  const result: GuardianListItem[] = [];
  for (const g of guardians) {
    const { data: links } = await supabase
      .from("guardian_students")
      .select("students(first_name, last_name)")
      .eq("guardian_id", g.id);
    const studentNames = (links ?? []).map((l: unknown) => {
      const s = (l as { students?: { first_name?: string; last_name?: string } }).students;
      return s ? `${s.first_name ?? ""} ${s.last_name ?? ""}`.trim() : "";
    }).filter(Boolean);
    result.push({
      id: g.id,
      name: g.name,
      email: g.email,
      phone: g.phone,
      relation: g.relation ?? "guardian",
      student_names: studentNames.join(", ") || "—",
    });
  }
  return result;
}
