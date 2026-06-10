import { createClient } from "@/lib/supabase/server";

export type AuditLogItem = {
  id: string;
  user_id: string | null;
  user_name: string | null;
  user_email: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  created_at: string;
};

export async function getAuditLogs(options?: {
  userId?: string;
  entityType?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}): Promise<AuditLogItem[]> {
  const supabase = await createClient();
  const limit = options?.limit ?? 200;

  let query = supabase
    .from("audit_logs")
    .select("id, user_id, action, entity_type, entity_id, created_at, profiles(name)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (options?.userId) query = query.eq("user_id", options.userId);
  if (options?.entityType) query = query.eq("entity_type", options.entityType);
  if (options?.startDate) query = query.gte("created_at", options.startDate);
  if (options?.endDate) query = query.lte("created_at", `${options.endDate}T23:59:59.999Z`);

  const { data, error } = await query;
  if (error) {
    console.error("getAuditLogs error:", error);
    return [];
  }

  return (data ?? []).map((row) => ({
    id: row.id,
    user_id: row.user_id,
    user_name: (row.profiles as { name?: string } | null)?.name ?? null,
    user_email: null,
    action: row.action,
    entity_type: row.entity_type,
    entity_id: row.entity_id,
    created_at: row.created_at,
  }));
}

export async function getAuditEntityTypes(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("audit_logs")
    .select("entity_type")
    .order("entity_type");

  if (error) {
    console.error("getAuditEntityTypes error:", error);
    return [];
  }

  return [...new Set((data ?? []).map((r) => r.entity_type))];
}
