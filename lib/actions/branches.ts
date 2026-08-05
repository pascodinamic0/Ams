"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertRole } from "@/lib/auth/assert";
import { createClient } from "@/lib/supabase/server";
import { branchSchema, type BranchFormData } from "@/lib/validations/academic";

export async function createBranch(input: BranchFormData) {
  const parsed = branchSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const access = await assertRole(["super_admin"]);
  if (!access.ok) {
    return { error: "Only platform administrators can manage branches" };
  }

  const supabase = await createClient();
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

const updateBranchSchema = branchSchema.extend({
  id: z.string().uuid(),
});

export async function updateBranch(input: BranchFormData & { id: string }) {
  const parsed = updateBranchSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const access = await assertRole(["super_admin"]);
  if (!access.ok) {
    return { error: "Only platform administrators can manage branches" };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("branches")
    .select("id, school_id")
    .eq("id", parsed.data.id)
    .maybeSingle();

  if (!existing) return { error: "Campus not found" };
  if (existing.school_id !== parsed.data.school_id) {
    return { error: "Campus does not belong to this school" };
  }

  const { error } = await supabase
    .from("branches")
    .update({
      name: parsed.data.name,
      address: parsed.data.address || null,
    })
    .eq("id", parsed.data.id);

  if (error) return { error: error.message };
  revalidatePath("/admin/schools");
  revalidatePath(`/admin/schools/${parsed.data.school_id}`);
  return {};
}

export async function deleteBranch(id: string) {
  const access = await assertRole(["super_admin"]);
  if (!access.ok) return { error: "Only platform administrators can manage branches" };

  const supabase = await createClient();
  const { error } = await supabase.from("branches").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/schools");
  return {};
}
