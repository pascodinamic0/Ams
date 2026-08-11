import { createClient } from "@/lib/supabase/server";

export type FeeStructureListItem = {
  id: string;
  name: string;
  amount: number;
  description: string | null;
  class_id: string | null;
  class_name: string | null;
  branch_id: string;
  school_year: number;
};

async function resolveBranchIds(
  branchId?: string,
  schoolId?: string
): Promise<string[] | null> {
  if (branchId) return [branchId];
  if (!schoolId) return null;

  const supabase = await createClient();
  const { data } = await supabase.from("branches").select("id").eq("school_id", schoolId);
  return (data ?? []).map((b) => b.id);
}

export async function getFeeStructures(options?: {
  branchId?: string;
  schoolId?: string;
}): Promise<FeeStructureListItem[]> {
  const supabase = await createClient();
  const branchIds = await resolveBranchIds(options?.branchId, options?.schoolId);

  let query = supabase
    .from("fee_structures")
    .select(
      "id, name, amount, description, class_id, branch_id, school_year, classes(name)"
    )
    .order("school_year", { ascending: false })
    .order("name");

  if (branchIds) {
    if (branchIds.length === 0) return [];
    query = query.in("branch_id", branchIds);
  }

  const { data, error } = await query;
  if (error) {
    console.error("getFeeStructures error:", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    amount: Number(row.amount),
    description: row.description,
    class_id: row.class_id,
    class_name: (row.classes as { name?: string } | null)?.name ?? null,
    branch_id: row.branch_id,
    school_year: Number(row.school_year),
  }));
}

export async function getFeeStructureById(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("fee_structures")
    .select("*, classes(name)")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data;
}
