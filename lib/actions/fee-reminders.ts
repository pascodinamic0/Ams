"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const reminderSettingsSchema = z.object({
  grace_period_days: z.number().int().min(0).max(365),
  remind_days_before: z.array(z.number().int().min(1)).max(10),
  remind_on_due_day: z.boolean(),
  remind_on_grace_expiry: z.boolean(),
  morning_message_template: z.string().min(10),
  final_warning_template: z.string().min(10),
  currency_symbol: z.string().min(1).max(5),
  enabled: z.boolean(),
});

export type ReminderSettingsInput = z.infer<typeof reminderSettingsSchema>;

export async function saveReminderSettings(
  schoolId: string,
  input: ReminderSettingsInput
): Promise<{ error?: string }> {
  const parsed = reminderSettingsSchema.safeParse(input);
  if (!parsed.success) {
    const firstError = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
    return { error: firstError ?? "Invalid settings" };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("fee_reminder_settings")
    .upsert(
      {
        school_id: schoolId,
        ...parsed.data,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "school_id" }
    );

  if (error) {
    console.error("saveReminderSettings error:", error);
    return { error: error.message };
  }

  revalidatePath("/finance/fee-reminders");
  return {};
}
