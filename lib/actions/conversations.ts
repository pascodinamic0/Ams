"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const newConversationSchema = z.object({
  student_id: z.string().uuid().optional(),
  title: z.string().optional(),
  participant_profile_ids: z.array(z.string().uuid()).min(1, "At least one participant required"),
  initial_message: z.string().min(1, "First message cannot be empty"),
});

export type NewConversationInput = z.infer<typeof newConversationSchema>;

export async function createConversation(
  schoolId: string,
  input: NewConversationInput
): Promise<{ data?: { id: string }; error?: unknown }> {
  const parsed = newConversationSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

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

  // Add the creator + all participants
  const allParticipants = Array.from(
    new Set([user.id, ...parsed.data.participant_profile_ids])
  );

  await supabase.from("conversation_participants").insert(
    allParticipants.map((pid) => ({
      conversation_id: conv.id,
      profile_id: pid,
    }))
  );

  // Insert initial message
  await supabase.from("conversation_messages").insert({
    conversation_id: conv.id,
    sender_id: user.id,
    body: parsed.data.initial_message,
  });

  // Update updated_at
  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conv.id);

  revalidatePath("/messages");
  return { data: { id: conv.id } };
}

export async function sendMessage(
  conversationId: string,
  body: string
): Promise<{ error?: string }> {
  if (!body.trim()) return { error: "Message cannot be empty" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("conversation_messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    body: body.trim(),
  });

  if (error) {
    console.error("sendMessage error:", error);
    return { error: error.message };
  }

  // Bump conversation updated_at for sorting
  await supabase
    .from("conversations")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", conversationId);

  revalidatePath(`/messages/${conversationId}`);
  return {};
}

export async function markConversationRead(
  conversationId: string
): Promise<void> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  await supabase
    .from("conversation_participants")
    .update({ last_read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .eq("profile_id", user.id);
}
