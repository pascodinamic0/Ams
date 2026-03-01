import { createClient } from "@/lib/supabase/server";

export type ConversationListItem = {
  id: string;
  title: string;
  student_id: string | null;
  student_name: string | null;
  created_by: string;
  created_by_name: string;
  last_message: string | null;
  last_message_at: string | null;
  created_at: string;
  unread: boolean;
};

export type ConversationMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  body: string;
  created_at: string;
};

export type ConversationDetail = ConversationListItem & {
  messages: ConversationMessage[];
  participants: Array<{ profile_id: string; name: string; role: string }>;
};

export async function getConversations(options?: {
  school_id?: string;
}): Promise<ConversationListItem[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("conversations")
    .select(`
      id,
      title,
      student_id,
      created_by,
      created_at,
      updated_at,
      students(first_name, last_name),
      profiles!conversations_created_by_fkey(name),
      conversation_messages(body, created_at)
    `)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("getConversations error:", error.message, error.code, error.details, error.hint);
    return [];
  }

  return (data ?? []).map((c) => {
    const student = c.students as { first_name?: string; last_name?: string } | null;
    const creator = c.profiles as { name?: string } | null;
    const msgs = (c.conversation_messages ?? []) as Array<{ body: string; created_at: string }>;
    const lastMsg = msgs.sort((a, b) => b.created_at.localeCompare(a.created_at))[0];

    return {
      id: c.id,
      title: c.title ?? (student ? `${student.first_name} ${student.last_name}` : "Conversation"),
      student_id: c.student_id,
      student_name: student ? `${student.first_name} ${student.last_name}`.trim() : null,
      created_by: c.created_by,
      created_by_name: creator?.name ?? "Unknown",
      last_message: lastMsg?.body ?? null,
      last_message_at: lastMsg?.created_at ?? null,
      created_at: c.created_at,
      unread: false,
    };
  });
}

export async function getConversationById(id: string): Promise<ConversationDetail | null> {
  const supabase = await createClient();

  const [{ data: conv, error: convErr }, { data: msgs, error: msgsErr }, { data: parts }] =
    await Promise.all([
      supabase
        .from("conversations")
        .select(`
          id, title, student_id, created_by, created_at, updated_at,
          students(first_name, last_name),
          profiles!conversations_created_by_fkey(name)
        `)
        .eq("id", id)
        .single(),
      supabase
        .from("conversation_messages")
        .select(`id, conversation_id, sender_id, body, created_at, profiles(name)`)
        .eq("conversation_id", id)
        .order("created_at", { ascending: true }),
      supabase
        .from("conversation_participants")
        .select(`profile_id, profiles(name, role)`)
        .eq("conversation_id", id),
    ]);

  if (convErr || !conv) {
    console.error("getConversationById error:", convErr);
    return null;
  }

  const student = conv.students as { first_name?: string; last_name?: string } | null;
  const creator = conv.profiles as { name?: string } | null;

  const messages: ConversationMessage[] = (msgs ?? []).map((m) => {
    const sender = m.profiles as { name?: string } | null;
    return {
      id: m.id,
      conversation_id: m.conversation_id,
      sender_id: m.sender_id,
      sender_name: sender?.name ?? "Unknown",
      body: m.body,
      created_at: m.created_at,
    };
  });

  const participants = (parts ?? []).map((p) => {
    const profile = p.profiles as { name?: string; role?: string } | null;
    return {
      profile_id: p.profile_id,
      name: profile?.name ?? "Unknown",
      role: profile?.role ?? "unknown",
    };
  });

  if (msgsErr) console.error("getConversationMessages error:", msgsErr);

  return {
    id: conv.id,
    title: conv.title ?? (student ? `${student.first_name} ${student.last_name}` : "Conversation"),
    student_id: conv.student_id,
    student_name: student ? `${student.first_name} ${student.last_name}`.trim() : null,
    created_by: conv.created_by,
    created_by_name: creator?.name ?? "Unknown",
    last_message: messages[messages.length - 1]?.body ?? null,
    last_message_at: messages[messages.length - 1]?.created_at ?? null,
    created_at: conv.created_at,
    unread: false,
    messages,
    participants,
  };
}

export type GuardianContact = {
  guardian_id: string;
  name: string;
  phone: string | null;
  relation: string;
  student_id: string;
  student_name: string;
  class_name: string;
  profile_id: string | null;
};

/** Returns all parent/guardian contacts grouped under their students' class, for the chat contact list. */
export async function getGuardianContacts(): Promise<GuardianContact[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("guardian_students")
    .select(`
      guardian_id,
      student_id,
      guardians!guardian_students_guardian_id_fkey(id, name, phone, relation, auth_user_id),
      students!guardian_students_student_id_fkey(id, first_name, last_name, classes!students_class_id_fkey(name))
    `)
    .order("guardian_id");

  if (error) {
    console.error("getGuardianContacts error:", error.message, error.code, error.details, error.hint);
    return [];
  }

  type ContactRow = {
    guardian_id: string;
    student_id: string;
    guardians: { id: string; name: string; phone?: string; relation: string; auth_user_id?: string } | null;
    students: { id: string; first_name: string; last_name: string; classes?: { name: string } | null } | null;
  };

  return ((data ?? []) as unknown as ContactRow[]).map((row) => {
    const g = row.guardians;
    const s = row.students;

    return {
      guardian_id: g?.id ?? row.guardian_id,
      name: g?.name ?? "Unknown",
      phone: g?.phone ?? null,
      relation: g?.relation ?? "guardian",
      student_id: s?.id ?? row.student_id,
      student_name: s ? `${s.first_name} ${s.last_name}`.trim() : "Unknown Student",
      class_name: s?.classes?.name ?? "No Class",
      profile_id: g?.auth_user_id ?? null,
    };
  });
}
