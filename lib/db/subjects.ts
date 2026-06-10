import { createClient } from "@/lib/supabase/server";

export type SubjectListItem = {
  id: string;
  name: string;
  branch_id: string;
};

export async function getSubjects(branchId?: string): Promise<SubjectListItem[]> {
  const supabase = await createClient();
  let query = supabase.from("subjects").select("id, name, branch_id").order("name");
  if (branchId) query = query.eq("branch_id", branchId);

  const { data, error } = await query;
  if (error) {
    console.error("getSubjects error:", error);
    return [];
  }
  return data ?? [];
}
