import { createClient } from "@/lib/supabase/server";

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
