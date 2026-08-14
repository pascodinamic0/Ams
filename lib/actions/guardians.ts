"use server";

import { actionError, zodIssueError } from "@/lib/i18n/action-error";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { guardianSchema, type GuardianFormData } from "@/lib/validations";
import { formatPersonName } from "@/lib/utils";

function guardianRowFromForm(data: GuardianFormData) {
  const first_name = data.first_name.trim();
  const middle_name = data.middle_name?.trim() || null;
  const last_name = data.last_name.trim();
  const phone = data.whatsapp || data.phone || null;

  return {
    name: formatPersonName({ first_name, middle_name, last_name }),
    first_name,
    middle_name,
    last_name,
    email: data.email,
    phone,
    relation: data.relation,
    address: data.address || null,
    workplace: data.workplace || null,
  };
}

export async function createGuardian(
  input: GuardianFormData & { school_id: string }
) {
  const parsed = guardianSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.flatten().fieldErrors };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return await actionError("notAuthenticated");

  const { data, error } = await supabase
    .from("guardians")
    .insert({
      school_id: input.school_id,
      ...guardianRowFromForm(parsed.data),
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
  if (!user) return await actionError("notAuthenticated");

  const data = parsed.data;
  const row: Record<string, unknown> = {};

  if (data.first_name !== undefined) row.first_name = data.first_name.trim();
  if (data.middle_name !== undefined) row.middle_name = data.middle_name.trim() || null;
  if (data.last_name !== undefined) row.last_name = data.last_name.trim();
  if (data.email !== undefined) row.email = data.email;
  if (data.relation !== undefined) row.relation = data.relation;
  if (data.address !== undefined) row.address = data.address || null;
  if (data.workplace !== undefined) row.workplace = data.workplace || null;
  if (data.whatsapp !== undefined || data.phone !== undefined) {
    row.phone = data.whatsapp ?? data.phone ?? null;
  }

  if (
    data.first_name !== undefined ||
    data.middle_name !== undefined ||
    data.last_name !== undefined
  ) {
    const { data: existing } = await supabase
      .from("guardians")
      .select("first_name, middle_name, last_name")
      .eq("id", id)
      .single();

    row.name = formatPersonName({
      first_name: (row.first_name as string | undefined) ?? existing?.first_name,
      middle_name: (row.middle_name as string | null | undefined) ?? existing?.middle_name,
      last_name: (row.last_name as string | undefined) ?? existing?.last_name,
    });
  }

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
  return {} as { error?: string };
}

export async function deleteGuardian(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return await actionError("notAuthenticated");

  const { error } = await supabase.from("guardians").delete().eq("id", id);

  if (error) {
    console.error("deleteGuardian error:", error);
    return { error: error.message };
  }

  revalidatePath("/academic");
  revalidatePath("/academic/guardians");
  return {} as { error?: string };
}