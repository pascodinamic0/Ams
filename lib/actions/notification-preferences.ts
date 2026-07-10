"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type NotificationPreferences = {
  push_enabled: boolean;
  class_reminders_enabled: boolean;
  class_reminder_minutes: number;
};

const DEFAULTS: NotificationPreferences = {
  push_enabled: true,
  class_reminders_enabled: true,
  class_reminder_minutes: 5,
};

export async function getNotificationPreferences(): Promise<NotificationPreferences> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return DEFAULTS;

  const { data } = await supabase
    .from("notification_preferences")
    .select("push_enabled, class_reminders_enabled, class_reminder_minutes")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) return DEFAULTS;

  return {
    push_enabled: data.push_enabled ?? true,
    class_reminders_enabled: data.class_reminders_enabled ?? true,
    class_reminder_minutes: data.class_reminder_minutes ?? 5,
  };
}

export async function updateNotificationPreferences(
  input: Partial<NotificationPreferences>
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const current = await getNotificationPreferences();
  const next = {
    user_id: user.id,
    push_enabled: input.push_enabled ?? current.push_enabled,
    class_reminders_enabled:
      input.class_reminders_enabled ?? current.class_reminders_enabled,
    class_reminder_minutes:
      input.class_reminder_minutes ?? current.class_reminder_minutes,
    updated_at: new Date().toISOString(),
  };

  if (next.class_reminder_minutes < 1 || next.class_reminder_minutes > 60) {
    return { error: "Reminder lead time must be between 1 and 60 minutes" };
  }

  const { error } = await supabase
    .from("notification_preferences")
    .upsert(next, { onConflict: "user_id" });

  if (error) {
    console.error("updateNotificationPreferences:", error.message);
    return { error: error.message };
  }

  revalidatePath("/settings");
  return {};
}

export async function getPushSubscriptionCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count } = await supabase
    .from("push_subscriptions")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  return count ?? 0;
}
