import { createClient } from "@/lib/supabase/server";

export type FeeStructureListItem = {
  id: string;
  name: string;
  amount: number;
  description: string | null;
  class_id: string | null;
  class_name: string | null;
  branch_id: string;
};

export async function getFeeStructures(
  branchId?: string
): Promise<FeeStructureListItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from("fee_structures")
    .select("id, name, amount, description, class_id, branch_id, classes(name)")
    .order("name");

  if (branchId) query = query.eq("branch_id", branchId);

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
