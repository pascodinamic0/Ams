"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCampaignTargetGuardians } from "@/lib/db/campaigns";
import { createNotifications } from "@/lib/services/notifications";
import { sendWhatsAppBulk, interpolateTemplate } from "@/lib/services/whatsapp";
import { z } from "zod";

const campaignSchema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Message body is required"),
  channel: z.enum(["whatsapp", "sms", "in_app"]),
  target: z.string().min(1),
});

export type CampaignFormData = z.infer<typeof campaignSchema>;

export async function createCampaign(
  schoolId: string,
  input: CampaignFormData
): Promise<{ data?: { id: string }; error?: unknown }> {
  const parsed = campaignSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  if (parsed.data.channel === "sms") {
    return { error: "SMS campaigns are not available yet. Use WhatsApp or in-app alerts." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data, error } = await supabase
    .from("campaigns")
    .insert({
      school_id: schoolId,
      created_by: user.id,
      title: parsed.data.title,
      body: parsed.data.body,
      channel: parsed.data.channel,
      target: parsed.data.target,
      status: "draft",
    })
    .select("id")
    .single();

  if (error) {
    console.error("createCampaign error:", error);
    return { error: error.message };
  }

  revalidatePath("/outreach");
  return { data: { id: data.id } };
}

/**
 * Send a campaign: resolves recipients, dispatches by channel,
 * logs delivery per-recipient, and updates campaign totals.
 */
export async function sendCampaign(
  campaignId: string
): Promise<{ sent?: number; failed?: number; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: campaign, error: campErr } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", campaignId)
    .single();

  if (campErr || !campaign) return { error: "Campaign not found" };
  if (campaign.status === "sent") return { error: "Campaign already sent" };

  if (campaign.channel === "sms") {
    return { error: "SMS campaigns are not available yet. Use WhatsApp or in-app alerts." };
  }

  await supabase
    .from("campaigns")
    .update({ status: "sending" })
    .eq("id", campaignId);

  const guardians = await getCampaignTargetGuardians(campaign.school_id, campaign.target);

  const recipients =
    campaign.channel === "in_app"
      ? guardians.filter((g) => g.auth_user_id)
      : guardians.filter((g) => g.phone);

  if (recipients.length === 0) {
    await supabase
      .from("campaigns")
      .update({ status: "failed", total_recipients: 0 })
      .eq("id", campaignId);
    return {
      error:
        campaign.channel === "in_app"
          ? "No recipients with portal accounts found for this target"
          : "No recipients with phone numbers found for this target",
    };
  }

  const recipientRows = recipients.map((g) => ({
    campaign_id: campaignId,
    guardian_id: g.guardian_id,
    phone: g.phone ?? "",
    name: g.name,
    status: "pending",
  }));

  await supabase.from("campaign_recipients").insert(recipientRows);

  let delivered = 0;
  let failed = 0;

  if (campaign.channel === "in_app") {
    const notifications = recipients.map((g) => ({
      userId: g.auth_user_id!,
      title: campaign.title,
      body: interpolateTemplate(campaign.body, { guardian_name: g.name }),
    }));

    const { created, failed: notifyFailed } = await createNotifications(notifications);
    delivered = created;
    failed = notifyFailed;

    const sentAt = new Date().toISOString();
    if (notifyFailed === 0) {
      await supabase
        .from("campaign_recipients")
        .update({ status: "delivered", sent_at: sentAt })
        .eq("campaign_id", campaignId);
    } else {
      await supabase
        .from("campaign_recipients")
        .update({
          status: created > 0 ? "delivered" : "failed",
          sent_at: created > 0 ? sentAt : null,
          error: created > 0 ? null : "Failed to create notifications",
        })
        .eq("campaign_id", campaignId);
    }
  } else {
    const payloads = recipients.map((g) => ({
      id: g.guardian_id,
      phone: g.phone!,
      body: interpolateTemplate(campaign.body, {
        guardian_name: g.name,
      }),
    }));

    const results = await sendWhatsAppBulk(payloads);

    for (const result of results) {
      if (result.success) {
        delivered++;
        await supabase
          .from("campaign_recipients")
          .update({ status: "delivered", sent_at: new Date().toISOString() })
          .eq("campaign_id", campaignId)
          .eq("guardian_id", result.id!);
      } else {
        failed++;
        await supabase
          .from("campaign_recipients")
          .update({ status: "failed", error: result.error ?? "Unknown error" })
          .eq("campaign_id", campaignId)
          .eq("guardian_id", result.id!);
      }
    }
  }

  await supabase
    .from("campaigns")
    .update({
      status: "sent",
      sent_at: new Date().toISOString(),
      total_recipients: recipients.length,
      delivered_count: delivered,
      failed_count: failed,
    })
    .eq("id", campaignId);

  revalidatePath("/outreach");
  revalidatePath(`/outreach/${campaignId}`);
  revalidatePath("/notifications");
  return { sent: delivered, failed };
}

export async function deleteCampaign(id: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("campaigns").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/outreach");
  return {};
}
