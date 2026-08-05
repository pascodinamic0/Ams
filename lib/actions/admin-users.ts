"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { assertRole } from "@/lib/auth/assert";
import { INVITABLE_ROLES } from "@/lib/validations/team";
import { requireAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

const updateRoleSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum([...INVITABLE_ROLES, "parent", "student", "super_admin"]),
});

export async function updateUserRole(input: {
  userId: string;
  role: string;
}): Promise<{ error?: string }> {
  const access = await assertRole(["super_admin"]);
  if (!access.ok) return { error: access.error };

  const parsed = updateRoleSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid role update" };

  if (parsed.data.userId === access.profile.id && parsed.data.role !== "super_admin") {
    return { error: "You cannot remove your own super admin role" };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role: parsed.data.role, updated_at: new Date().toISOString() })
    .eq("id", parsed.data.userId);

  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  return {};
}

export async function deleteUserAccount(userId: string): Promise<{ error?: string }> {
  const access = await assertRole(["super_admin"]);
  if (!access.ok) return { error: access.error };

  if (userId === access.profile.id) {
    return { error: "You cannot delete your own account" };
  }

  const adminResult = requireAdminClient();
  if ("error" in adminResult) return { error: adminResult.error };

  const { error } = await adminResult.client.auth.admin.deleteUser(userId);
  if (error) return { error: error.message };

  revalidatePath("/admin/users");
  return {};
}
