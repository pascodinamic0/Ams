import type { SupabaseClient } from "@supabase/supabase-js";
import { isValidE164 } from "@/lib/phone/e164";

/**
 * Set a verified phone on an auth user (admin only).
 * Used when linking guardian portal phones for WhatsApp OTP login.
 */
export async function syncAuthUserPhone(
  admin: SupabaseClient,
  userId: string,
  phone: string
): Promise<{ error?: string }> {
  if (!isValidE164(phone)) {
    return { error: "invalidPhone" };
  }

  const { error } = await admin.auth.admin.updateUserById(userId, {
    phone,
    phone_confirm: true,
  });

  if (error) {
    console.error("syncAuthUserPhone:", error);
    return { error: error.message };
  }

  return {};
}
