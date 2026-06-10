import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type CreateNotificationInput = {
  userId: string;
  title: string;
  body?: string | null;
};

async function getInsertClient() {
  const admin = createAdminClient();
  if (admin) return admin;
  return createClient();
}

/** Insert a notification for a user (uses service role when available). */
export async function createNotification(
  input: CreateNotificationInput
): Promise<{ id?: string; error?: string }> {
  const client = await getInsertClient();

  const { data, error } = await client
    .from("notifications")
    .insert({
      user_id: input.userId,
      title: input.title,
      body: input.body ?? null,
      is_read: false,
    })
    .select("id")
    .single();

  if (error) {
    console.error("createNotification error:", error.message);
    return { error: error.message };
  }

  return { id: data.id };
}

/** Bulk-insert notifications (skips empty user ids). */
export async function createNotifications(
  inputs: CreateNotificationInput[]
): Promise<{ created: number; failed: number }> {
  const rows = inputs.filter((n) => n.userId);
  if (rows.length === 0) return { created: 0, failed: 0 };

  const client = await getInsertClient();
  const { data, error } = await client
    .from("notifications")
    .insert(
      rows.map((n) => ({
        user_id: n.userId,
        title: n.title,
        body: n.body ?? null,
        is_read: false,
      }))
    )
    .select("id");

  if (error) {
    console.error("createNotifications error:", error.message);
    return { created: 0, failed: rows.length };
  }

  return { created: data?.length ?? 0, failed: rows.length - (data?.length ?? 0) };
}

/** Notify all guardians with portal accounts linked to a student. */
export async function notifyStudentGuardians(
  studentId: string,
  notification: { title: string; body?: string }
): Promise<void> {
  const admin = createAdminClient();
  if (!admin) return;

  const { data: links } = await admin
    .from("guardian_students")
    .select("guardians(auth_user_id)")
    .eq("student_id", studentId);

  const userIds = new Set<string>();
  for (const link of links ?? []) {
    const guardian = link.guardians as { auth_user_id?: string | null } | null;
    if (guardian?.auth_user_id) userIds.add(guardian.auth_user_id);
  }

  if (userIds.size === 0) return;

  await createNotifications(
    [...userIds].map((userId) => ({
      userId,
      title: notification.title,
      body: notification.body,
    }))
  );
}
