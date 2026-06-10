import { createClient } from "@/lib/supabase/server";

export type ClassListItem = {
  id: string;
  name: string;
  grade: string | null;
  capacity: number | null;
  section_name: string | null;
  branch_id: string;
};

export async function getClasses(branchId?: string): Promise<ClassListItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from("classes")
    .select("id, name, grade, capacity, branch_id, sections(name)")
    .order("name");

  if (branchId) query = query.eq("branch_id", branchId);

  const { data, error } = await query;
  if (error) {
    console.error("getClasses error:", error);
    return [];
  }

  return (data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    grade: c.grade,
    capacity: c.capacity,
    branch_id: c.branch_id,
    section_name: (c.sections as { name?: string } | null)?.name ?? null,
  }));
}
