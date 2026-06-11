"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { branchSchema, type BranchFormData } from "@/lib/validations/academic";

export async function createBranch(input: BranchFormData) {
  const parsed = branchSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "super_admin") {
    return { error: "Only platform administrators can manage branches" };
  }

  const { count } = await supabase
    .from("branches")
    .select("id", { count: "exact", head: true })
    .eq("school_id", parsed.data.school_id);

  if ((count ?? 0) >= 1) {
    return {
      error: "Each school is limited to one campus. Contact platform support for multi-campus setup.",
    };
  }

  const { data, error } = await supabase
    .from("branches")
    .insert({
      name: parsed.data.name,
      school_id: parsed.data.school_id,
      address: parsed.data.address || null,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/admin/schools");
  return { data: { id: data.id } };
}

export async function deleteBranch(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("branches").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/schools");
  return {};
}
