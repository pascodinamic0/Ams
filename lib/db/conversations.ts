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
  last_message_sender_id: string | null;
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

export type StaffContact = {
  profile_id: string;
  name: string;
  role: string;
  student_id: string | null;
  student_name: string | null;
  context: string;
};

function computeUnread(
  lastMessageAt: string | null,
  lastMessageSenderId: string | null,
  lastReadAt: string | null | undefined,
  currentUserId: string
): boolean {
  if (!lastMessageAt || !lastMessageSenderId) return false;
  if (lastMessageSenderId === currentUserId) return false;
  if (!lastReadAt) return true;
  return lastMessageAt > lastReadAt;
}

export async function getConversations(): Promise<ConversationListItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

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
      conversation_messages(body, created_at, sender_id),
      conversation_participants(profile_id, last_read_at)
    `)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("getConversations error:", error.message, error.code, error.details, error.hint);
    return [];
  }

  return (data ?? []).map((c) => {
    const student = c.students as { first_name?: string; last_name?: string } | null;
    const creator = c.profiles as { name?: string } | null;
    const msgs = (c.conversation_messages ?? []) as Array<{
      body: string;
      created_at: string;
      sender_id: string;
    }>;
    const lastMsg = msgs.sort((a, b) => b.created_at.localeCompare(a.created_at))[0];

    const participants = (c.conversation_participants ?? []) as Array<{
      profile_id: string;
      last_read_at: string | null;
    }>;
    const myParticipant = participants.find((p) => p.profile_id === user.id);
    const lastReadAt = myParticipant?.last_read_at ?? null;

    return {
      id: c.id,
      title: c.title ?? (student ? `${student.first_name} ${student.last_name}` : "Conversation"),
      student_id: c.student_id,
      student_name: student ? `${student.first_name} ${student.last_name}`.trim() : null,
      created_by: c.created_by,
      created_by_name: creator?.name ?? "Unknown",
      last_message: lastMsg?.body ?? null,
      last_message_at: lastMsg?.created_at ?? null,
      last_message_sender_id: lastMsg?.sender_id ?? null,
      created_at: c.created_at,
      unread: computeUnread(
        lastMsg?.created_at ?? null,
        lastMsg?.sender_id ?? null,
        lastReadAt,
        user.id
      ),
    };
  });
}

export async function getUnreadConversationCount(): Promise<number> {
  const conversations = await getConversations();
  return conversations.filter((c) => c.unread).length;
}

export async function getConversationById(id: string): Promise<ConversationDetail | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
        .select(`profile_id, last_read_at, profiles(name, role)`)
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

  const lastMessage = messages[messages.length - 1];
  const myParticipant = (parts ?? []).find((p) => p.profile_id === user?.id) as
    | { last_read_at: string | null }
    | undefined;

  return {
    id: conv.id,
    title: conv.title ?? (student ? `${student.first_name} ${student.last_name}` : "Conversation"),
    student_id: conv.student_id,
    student_name: student ? `${student.first_name} ${student.last_name}`.trim() : null,
    created_by: conv.created_by,
    created_by_name: creator?.name ?? "Unknown",
    last_message: lastMessage?.body ?? null,
    last_message_at: lastMessage?.created_at ?? null,
    last_message_sender_id: lastMessage?.sender_id ?? null,
    created_at: conv.created_at,
    unread: user
      ? computeUnread(
          lastMessage?.created_at ?? null,
          lastMessage?.sender_id ?? null,
          myParticipant?.last_read_at,
          user.id
        )
      : false,
    messages,
    participants,
  };
}

/** Find an existing thread with the same student and participant set. */
export async function findExistingConversation(
  studentId: string | null | undefined,
  participantProfileIds: string[],
  creatorId: string
): Promise<string | null> {
  const supabase = await createClient();
  const targetParticipants = new Set([creatorId, ...participantProfileIds]);

  let query = supabase
    .from("conversations")
    .select(`id, student_id, conversation_participants(profile_id)`);

  if (studentId) {
    query = query.eq("student_id", studentId);
  }

  const { data, error } = await query;
  if (error) {
    console.error("findExistingConversation error:", error.message);
    return null;
  }

  for (const conv of data ?? []) {
    if (studentId && conv.student_id !== studentId) continue;
    if (!studentId && conv.student_id) continue;

    const participants = new Set(
      ((conv.conversation_participants ?? []) as Array<{ profile_id: string }>).map(
        (p) => p.profile_id
      )
    );

    if (
      participants.size === targetParticipants.size &&
      [...targetParticipants].every((id) => participants.has(id))
    ) {
      return conv.id as string;
    }
  }

  return null;
}

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
    guardians: {
      id: string;
      name: string;
      phone?: string;
      relation: string;
      auth_user_id?: string;
    } | null;
    students: {
      id: string;
      first_name: string;
      last_name: string;
      classes?: { name: string } | null;
    } | null;
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

/** Staff contacts a parent can message: class teachers + school messaging staff. */
export async function getStaffContactsForParent(): Promise<StaffContact[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: guardian } = await supabase
    .from("guardians")
    .select("id, school_id")
    .eq("auth_user_id", user.id)
    .single();

  if (!guardian) return [];

  const { data: links } = await supabase
    .from("guardian_students")
    .select(`
      student_id,
      students(id, first_name, last_name, class_id, classes(name))
    `)
    .eq("guardian_id", guardian.id);

  type StudentLink = {
    student_id: string;
    students: {
      id: string;
      first_name: string;
      last_name: string;
      class_id: string | null;
      classes: { name: string } | null;
    } | null;
  };

  const studentLinks = (links ?? []) as unknown as StudentLink[];
  const contacts: StaffContact[] = [];
  const seen = new Set<string>();

  function addContact(contact: StaffContact) {
    const key = `${contact.profile_id}:${contact.student_id ?? "general"}`;
    if (seen.has(key)) return;
    seen.add(key);
    contacts.push(contact);
  }

  for (const link of studentLinks) {
    const student = link.students;
    if (!student) continue;

    const studentName = `${student.first_name} ${student.last_name}`.trim();
    const className = student.classes?.name ?? "Class";

    if (student.class_id) {
      const { data: slots } = await supabase
        .from("timetable_slots")
        .select(`teacher_id, profiles(name, role)`)
        .eq("class_id", student.class_id)
        .not("teacher_id", "is", null);

      for (const slot of slots ?? []) {
        const teacherId = slot.teacher_id as string;
        const profile = slot.profiles as { name?: string; role?: string } | null;
        if (teacherId === user.id) continue;
        addContact({
          profile_id: teacherId,
          name: profile?.name ?? "Teacher",
          role: profile?.role ?? "teacher",
          student_id: student.id,
          student_name: studentName,
          context: `${className} · ${studentName}`,
        });
      }
    }
  }

  const { data: staffProfiles } = await supabase
    .from("profiles")
    .select("id, name, role")
    .eq("school_id", guardian.school_id)
    .in("role", ["super_admin", "academic_admin", "teacher"])
    .neq("id", user.id);

  for (const profile of staffProfiles ?? []) {
    addContact({
      profile_id: profile.id,
      name: profile.name ?? "Staff",
      role: profile.role ?? "teacher",
      student_id: null,
      student_name: null,
      context: "School staff",
    });
  }

  return contacts.sort((a, b) => a.name.localeCompare(b.name));
}
