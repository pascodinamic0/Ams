import { createClient } from "@/lib/supabase/server";

export type SectionListItem = {
  id: string;
  name: string;
  branch_id: string;
};

export async function getSections(branchId?: string): Promise<SectionListItem[]> {
  const supabase = await createClient();
  let query = supabase.from("sections").select("id, name, branch_id").order("name");
  if (branchId) query = query.eq("branch_id", branchId);

  const { data, error } = await query;
  if (error) {
    console.error("getSections error:", error);
    return [];
  }
  return data ?? [];
}
