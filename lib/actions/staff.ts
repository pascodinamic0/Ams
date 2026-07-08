"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { staffSchema, type StaffFormData } from "@/lib/validations/operations";

export async function createStaff(input: StaffFormData) {
  const parsed = staffSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const payload = {
    ...parsed.data,
    email: parsed.data.email || null,
    branch_id: parsed.data.branch_id || null,
    department: parsed.data.department || null,
    photo_url: parsed.data.photo_url || null,
  };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("staff")
    .insert(payload)
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/operations/staff");
  return { data: { id: data.id } };
}

export async function updateStaff(id: string, input: StaffFormData) {
  const parsed = staffSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const payload = {
    ...parsed.data,
    email: parsed.data.email || null,
    branch_id: parsed.data.branch_id || null,
    department: parsed.data.department || null,
    photo_url: parsed.data.photo_url || null,
  };

  const supabase = await createClient();
  const { error } = await supabase.from("staff").update(payload).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/operations/staff");
  return {};
}

export async function deleteStaff(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("staff").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/operations/staff");
  return {};
}
