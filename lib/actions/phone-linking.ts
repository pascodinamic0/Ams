"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdminClient } from "@/lib/supabase/admin";
import { syncAuthUserPhone } from "@/lib/auth/sync-auth-phone";
import { normalizeToE164 } from "@/lib/phone/e164";
import { actionError, zodIssueError } from "@/lib/i18n/action-error";

/**
 * Sync guardian.phone to auth.users.phone when the guardian has a portal account.
 * Called after guardian create/update so WhatsApp login works for parents.
 */
export async function syncGuardianAuthPhone(guardianId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return await actionError("notAuthenticated");

  const { data: guardian, error: guardianError } = await supabase
    .from("guardians")
    .select("id, phone, auth_user_id, school_id")
    .eq("id", guardianId)
    .single();

  if (guardianError || !guardian) {
    return await actionError("invalidInput");
  }

  if (!guardian.auth_user_id || !guardian.phone) {
    return { data: { skipped: true as const } };
  }

  const e164 = normalizeToE164(guardian.phone);
  if (!e164) {
    return await zodIssueError("invalidPhone");
  }

  const adminResult = requireAdminClient();
  if ("error" in adminResult) return { error: adminResult.error };

  const result = await syncAuthUserPhone(
    adminResult.client,
    guardian.auth_user_id,
    e164
  );
  if (result.error) return { error: result.error };

  revalidatePath("/settings");
  return { data: { synced: true as const, phone: e164 } };
}
