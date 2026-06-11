import { createClient } from "@/lib/supabase/server";

export type BranchListItem = {
  id: string;
  name: string;
  school_id: string;
  school_name: string | null;
  address: string | null;
};

export async function getBranches(schoolId?: string): Promise<BranchListItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from("branches")
    .select("id, name, school_id, address, schools(name)")
    .order("name");

  if (schoolId) query = query.eq("school_id", schoolId);

  const { data, error } = await query;
  if (error) {
    console.error("getBranches error:", error);
    return [];
  }

  return (data ?? []).map((b) => ({
    id: b.id,
    name: b.name,
    school_id: b.school_id,
    school_name: (b.schools as { name?: string } | null)?.name ?? null,
    address: b.address,
  }));
}

export async function getBranchById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("branches").select("*").eq("id", id).single();
  if (error) return null;
  return data;
}

/** Each school has a single campus; returns that branch when present. */
export async function getSchoolCampusId(schoolId: string): Promise<string | null> {
  const branches = await getBranches(schoolId);
  return branches[0]?.id ?? null;
}
