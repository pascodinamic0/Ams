"use server";

import { revalidatePath } from "next/cache";
import { findExistingConversation } from "@/lib/db/conversations";
import { createNotifications } from "@/lib/services/notifications";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const newConversationSchema = z.object({
  student_id: z.string().uuid().optional(),
  title: z.string().optional(),
  participant_profile_ids: z.array(z.string().uuid()).min(1, "At least one participant required"),
  initial_message: z.string().min(1, "First message cannot be empty"),
});

export type NewConversationInput = z.infer<typeof newConversationSchema>;

export type SentMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  body: string;
  created_at: string;
};

export async function createConversation(
  schoolId: string,
  input: NewConversationInput
): Promise<{ data?: { id: string; existing?: boolean }; error?: unknown }> {
  const parsed = newConversationSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const existingId = await findExistingConversation(
    parsed.data.student_id ?? null,
    parsed.data.participant_profile_ids,
    user.id
  );

  if (existingId) {
    const sendResult = await sendMessage(existingId, parsed.data.initial_message);
    if (sendResult.error) {
      return { error: sendResult.error };
    }
    revalidatePath("/messages");
    return { data: { id: existingId, existing: true } };
  }

  const { data: conv, error: convErr } = await supabase
    .from("conversations")
    .insert({
      school_id: schoolId,
      created_by: user.id,
      student_id: parsed.data.student_id ?? null,
      title: parsed.data.title ?? null,
    })
    .select("id")
    .single();

  if (convErr || !conv) {
    console.error("createConversation error:", convErr);
    return { error: convErr?.message ?? "Failed to create conversation" };
  }

  const allParticipants = Array.from(new Set([user.id, ...parsed.data.participant_profile_ids]));

  const { error: partErr } = await supabase.from("conversation_participants").insert(
    allParticipants.map((pid) => ({
      conversation_id: conv.id,
      profile_id: pid,
    }))
  );

  if (partErr) {
    console.error("createConversation participants error:", partErr);
    return { error: partErr.message };
  }

  const sendResult = await sendMessage(conv.id, parsed.data.initial_message);
  if (sendResult.error) {
    return { error: sendResult.error };
  }

  revalidatePath("/messages");
  return { data: { id: conv.id } };
}

export async function sendMessage(
  conversationId: string,
  body: string
): Promise<{ data?: SentMessage; error?: string }> {
  if (!body.trim()) return { error: "Message cannot be empty" };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: inserted, error } = await supabase
    .from("conversation_messages")
    .insert({
      conversation_id: conversationId,
      sender_id: user.id,
      body: body.trim(),
    })
    .select(`id, conversation_id, sender_id, body, created_at, profiles(name)`)
    .single();

  if (error || !inserted) {
    console.error("sendMessage error:", error);
    return { error: error?.message ?? "Failed to send message" };
  }

  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  const senderProfile = inserted.profiles as { name?: string } | null;
  const senderName = senderProfile?.name ?? "Someone";
  const message: SentMessage = {
    id: inserted.id,
    conversation_id: inserted.conversation_id,
    sender_id: inserted.sender_id,
    sender_name: senderName,
    body: inserted.body,
    created_at: inserted.created_at,
  };

  const { data: participants } = await supabase
    .from("conversation_participants")
    .select("profile_id")
    .eq("conversation_id", conversationId);

  const recipientIds = (participants ?? [])
    .map((p) => p.profile_id)
    .filter((id) => id !== user.id);

  if (recipientIds.length > 0) {
    const preview = body.trim().length > 80 ? `${body.trim().slice(0, 80)}…` : body.trim();
    await createNotifications(
      recipientIds.map((userId) => ({
        userId,
        title: `New message from ${senderName}`,
        body: preview,
      }))
    );
  }

  revalidatePath("/messages");
  revalidatePath(`/messages/${conversationId}`);
  revalidatePath("/notifications");
  return { data: message };
}

export async function markConversationRead(conversationId: string): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const now = new Date().toISOString();

  const { data: existing } = await supabase
    .from("conversation_participants")
    .select("profile_id")
    .eq("conversation_id", conversationId)
    .eq("profile_id", user.id)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("conversation_participants")
      .update({ last_read_at: now })
      .eq("conversation_id", conversationId)
      .eq("profile_id", user.id);
  } else {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    const messagingStaff = ["super_admin", "academic_admin", "teacher"].includes(
      profile?.role ?? ""
    );
    if (messagingStaff) {
      await supabase.from("conversation_participants").insert({
        conversation_id: conversationId,
        profile_id: user.id,
        last_read_at: now,
      });
    }
  }

  revalidatePath("/messages");
  revalidatePath(`/messages/${conversationId}`);
}

export async function fetchUnreadConversationCount(): Promise<number> {
  const { getUnreadConversationCount } = await import("@/lib/db/conversations");
  return getUnreadConversationCount();
}
