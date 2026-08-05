"use server";

import { revalidatePath } from "next/cache";
import { MESSAGING_STAFF_ROLES } from "@/lib/auth/rbac";
import {
  assertConversationParticipant,
  canAccessSchool,
  getAuthedProfile,
} from "@/lib/auth/assert";
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

  const profile = await getAuthedProfile();
  if (!profile) return { error: "Not authenticated" };
  if (!canAccessSchool(profile, schoolId)) {
    return { error: "You can only create conversations for your school" };
  }

  const isParent = profile.role === "parent";
  const isStudent = profile.role === "student";
  const isStaff = MESSAGING_STAFF_ROLES.includes(profile.role);
  if (!isParent && !isStaff && !isStudent) {
    return { error: "Not authorized to start conversations" };
  }

  const supabase = await createClient();

  // Validate participants belong to the same school (or are guardians of that school).
  const participantIds = parsed.data.participant_profile_ids;
  if (participantIds.length > 0) {
    const { data: participantProfiles } = await supabase
      .from("profiles")
      .select("id, school_id, role")
      .in("id", participantIds);

    const found = new Set((participantProfiles ?? []).map((p) => p.id));
    if (participantIds.some((id) => !found.has(id))) {
      return { error: "One or more participants were not found" };
    }

    const crossSchool = (participantProfiles ?? []).some(
      (p) => p.school_id && p.school_id !== schoolId && p.role !== "super_admin"
    );
    if (crossSchool) {
      return { error: "Participants must belong to the same school" };
    }
  }

  let studentAuthUserId: string | null = null;
  if (parsed.data.student_id) {
    const { data: student } = await supabase
      .from("students")
      .select("id, school_id, auth_user_id")
      .eq("id", parsed.data.student_id)
      .maybeSingle();
    if (!student || student.school_id !== schoolId) {
      return { error: "Student not found in this school" };
    }
    studentAuthUserId = student.auth_user_id ?? null;

    if (isStudent && student.auth_user_id !== profile.id) {
      return { error: "Students can only start conversations about themselves" };
    }
  } else if (isStudent) {
    return { error: "Student conversations must include the student record" };
  }

  const existingId = await findExistingConversation(
    parsed.data.student_id ?? null,
    parsed.data.participant_profile_ids,
    profile.id
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
      created_by: profile.id,
      student_id: parsed.data.student_id ?? null,
      title: parsed.data.title ?? null,
    })
    .select("id")
    .single();

  if (convErr || !conv) {
    console.error("createConversation error:", convErr);
    return { error: convErr?.message ?? "Failed to create conversation" };
  }

  const allParticipants = Array.from(
    new Set([
      profile.id,
      ...parsed.data.participant_profile_ids,
      ...(studentAuthUserId ? [studentAuthUserId] : []),
    ])
  );

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

  const access = await assertConversationParticipant(conversationId);
  if (!access.ok) return { error: access.error };

  // Staff who are not yet participants may not send until they join via mark-read
  // only for same-school staff; parents must already be participants.
  if (!access.isParticipant && access.profile.role === "parent") {
    return { error: "Not a participant in this conversation" };
  }

  const supabase = await createClient();

  if (!access.isParticipant && MESSAGING_STAFF_ROLES.includes(access.profile.role)) {
    const { error: joinErr } = await supabase.from("conversation_participants").insert({
      conversation_id: conversationId,
      profile_id: access.profile.id,
    });
    if (joinErr) {
      console.error("sendMessage auto-join error:", joinErr);
      return { error: "Could not join conversation" };
    }
  }

  const { data: inserted, error } = await supabase
    .from("conversation_messages")
    .insert({
      conversation_id: conversationId,
      sender_id: access.profile.id,
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
    .filter((id) => id !== access.profile.id);

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
  const access = await assertConversationParticipant(conversationId);
  if (!access.ok) return;

  const supabase = await createClient();
  const now = new Date().toISOString();

  if (access.isParticipant) {
    await supabase
      .from("conversation_participants")
      .update({ last_read_at: now })
      .eq("conversation_id", conversationId)
      .eq("profile_id", access.profile.id);
  } else if (MESSAGING_STAFF_ROLES.includes(access.profile.role)) {
    // Same-school messaging staff can join when opening a thread.
    await supabase.from("conversation_participants").insert({
      conversation_id: conversationId,
      profile_id: access.profile.id,
      last_read_at: now,
    });
  }

  revalidatePath("/messages");
  revalidatePath(`/messages/${conversationId}`);
}

export async function fetchUnreadConversationCount(): Promise<number> {
  const { getUnreadConversationCount } = await import("@/lib/db/conversations");
  return getUnreadConversationCount();
}
