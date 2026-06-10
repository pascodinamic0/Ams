import { createClient } from "@/lib/supabase/server";

export type NotificationItem = {
  id: string;
  title: string;
  body: string | null;
  is_read: boolean;
  created_at: string;
};

export async function getNotifications(): Promise<NotificationItem[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("notifications")
    .select("id, title, body, is_read, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(
      "getNotifications error:",
      error.message,
      error.code,
      error.details,
      error.hint
    );
    return [];
  }

  return data ?? [];
}

export async function getUnreadNotificationCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return 0;

  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  if (error) {
    console.error("getUnreadNotificationCount error:", error.message);
    return 0;
  }

  return count ?? 0;
}
