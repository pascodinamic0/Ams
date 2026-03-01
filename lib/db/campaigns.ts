import { createClient } from "@/lib/supabase/server";

export type CampaignListItem = {
  id: string;
  title: string;
  body: string;
  channel: string;
  target: string;
  status: string;
  total_recipients: number;
  delivered_count: number;
  failed_count: number;
  sent_at: string | null;
  created_at: string;
  created_by_name: string;
};

export type CampaignRecipient = {
  id: string;
  campaign_id: string;
  guardian_id: string | null;
  phone: string;
  name: string | null;
  status: string;
  error: string | null;
  sent_at: string | null;
};

export type FeeReminderSettings = {
  id: string;
  school_id: string;
  grace_period_days: number;
  remind_days_before: number[];
  remind_on_due_day: boolean;
  remind_on_grace_expiry: boolean;
  morning_message_template: string;
  final_warning_template: string;
  currency_symbol: string;
  enabled: boolean;
};

export async function getCampaigns(): Promise<CampaignListItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("campaigns")
    .select(`
      id, title, body, channel, target, status,
      total_recipients, delivered_count, failed_count,
      sent_at, created_at,
      profiles(name)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getCampaigns error:", error);
    return [];
  }

  return (data ?? []).map((c) => {
    const creator = c.profiles as { name?: string } | null;
    return {
      id: c.id,
      title: c.title,
      body: c.body,
      channel: c.channel,
      target: c.target,
      status: c.status,
      total_recipients: c.total_recipients ?? 0,
      delivered_count: c.delivered_count ?? 0,
      failed_count: c.failed_count ?? 0,
      sent_at: c.sent_at,
      created_at: c.created_at,
      created_by_name: creator?.name ?? "Unknown",
    };
  });
}

export async function getCampaignRecipients(campaignId: string): Promise<CampaignRecipient[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("campaign_recipients")
    .select("*")
    .eq("campaign_id", campaignId)
    .order("created_at");

  if (error) {
    console.error("getCampaignRecipients error:", error);
    return [];
  }

  return data ?? [];
}

export async function getFeeReminderSettings(
  schoolId: string
): Promise<FeeReminderSettings | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("fee_reminder_settings")
    .select("*")
    .eq("school_id", schoolId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("getFeeReminderSettings error:", error);
    return null;
  }

  return data ?? null;
}

/** Returns all guardians with phone numbers for a campaign target. */
export async function getCampaignTargetGuardians(
  schoolId: string,
  target: string
): Promise<Array<{ guardian_id: string; name: string; phone: string }>> {
  const supabase = await createClient();

  let query = supabase
    .from("guardians")
    .select(`
      id, name, phone,
      guardian_students(
        students(school_id, class_id, classes(id, name))
      )
    `)
    .eq("school_id", schoolId)
    .not("phone", "is", null);

  const { data, error } = await query;

  if (error) {
    console.error("getCampaignTargetGuardians error:", error);
    return [];
  }

  const guardians = (data ?? []).filter((g) => !!g.phone);

  if (target === "all_parents") {
    return guardians.map((g) => ({
      guardian_id: g.id,
      name: g.name,
      phone: g.phone!,
    }));
  }

  if (target.startsWith("class:")) {
    const classId = target.replace("class:", "");
    return guardians
      .filter((g) => {
        const links = g.guardian_students as Array<{
          students?: { class_id?: string } | null;
        }> | null;
        return links?.some((l) => l.students?.class_id === classId);
      })
      .map((g) => ({ guardian_id: g.id, name: g.name, phone: g.phone! }));
  }

  return [];
}
