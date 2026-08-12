"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requireAdminClient } from "@/lib/supabase/admin";
import { getDashboardForRole } from "@/lib/auth/rbac";

const passwordSchema = z.string().min(8, "Password must be at least 8 characters");

export async function completePasswordSetup(password: string) {
  const parsed = passwordSchema.safeParse(password);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid password" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error:
        "This invite link is invalid or expired. Ask your admin to send a new invitation.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data });
  if (error) {
    return { error: error.message };
  }

  const adminResult = requireAdminClient();
  if ("client" in adminResult) {
    const { error: metaError } = await adminResult.client.auth.admin.updateUserById(
      user.id,
      {
        app_metadata: {
          ...(user.app_metadata ?? {}),
          must_set_password: false,
        },
      }
    );
    if (metaError) {
      console.error("completePasswordSetup app_metadata:", metaError);
    }

    const { error: flagError } = await adminResult.client
      .from("profiles")
      .update({
        password_setup_required: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);
    if (flagError) {
      console.error("completePasswordSetup password_setup_required:", flagError);
    }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, onboarding_completed_at")
    .eq("id", user.id)
    .single();

  await supabase.auth.refreshSession();

  const destination = !profile?.onboarding_completed_at
    ? "/onboarding"
    : getDashboardForRole(profile?.role);

  return { data: { destination } };
}
