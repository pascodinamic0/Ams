"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { guardianSchema, type GuardianFormData } from "@/lib/validations";

export async function createGuardian(
  input: GuardianFormData & { school_id: string }
) {
  const parsed = guardianSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const phone = parsed.data.whatsapp || parsed.data.phone || null;

  const { data, error } = await supabase
    .from("guardians")
    .insert({
      school_id: input.school_id,
      name: parsed.data.name,
      email: parsed.data.email,
      phone,
      relation: parsed.data.relation,
      address: parsed.data.address || null,
      workplace: parsed.data.workplace || null,
    })
    .select("id")
    .single();

  if (error) {
    console.error("createGuardian error:", error);
    return { error: error.message };
  }

  revalidatePath("/academic");
  revalidatePath("/academic/guardians");
  return { data: { id: data.id } };
}

export async function updateGuardian(
  id: string,
  updates: Partial<GuardianFormData>
) {
  const parsed = guardianSchema.partial().safeParse(updates);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { whatsapp, phone, ...rest } = parsed.data;
  const row = {
    ...rest,
    ...(whatsapp !== undefined || phone !== undefined
      ? { phone: whatsapp ?? phone ?? null }
      : {}),
  };

  const { error } = await supabase
    .from("guardians")
    .update(row)
    .eq("id", id);

  if (error) {
    console.error("updateGuardian error:", error);
    return { error: error.message };
  }

  revalidatePath("/academic");
  revalidatePath("/academic/students");
  return {};
}

export async function deleteGuardian(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("guardians").delete().eq("id", id);

  if (error) {
    console.error("deleteGuardian error:", error);
    return { error: error.message };
  }

  revalidatePath("/academic");
  revalidatePath("/academic/guardians");
  return {};
}
