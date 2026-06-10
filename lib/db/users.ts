import { createClient } from "@/lib/supabase/server";
import { getAuthEmailsByUserIds } from "@/lib/supabase/admin";

export type UserListItem = {
  id: string;
  email: string;
  name: string | null;
  role: string;
  school_name: string | null;
};

export async function getUsers(options?: {
  search?: string;
}): Promise<UserListItem[]> {
  const supabase = await createClient();
  let query = supabase
    .from("profiles")
    .select(`
      id,
      name,
      role,
      school_id,
      schools(name)
    `)
    .order("name");

  if (options?.search) {
    const term = `%${options.search}%`;
    query = query.or(`name.ilike.${term}`);
  }

  const { data: profiles, error } = await query;

  if (error) {
    console.error("getUsers error:", error);
    return [];
  }

  const ids = (profiles ?? []).map((p) => p.id);
  const emails = await getAuthEmailsByUserIds(ids);

  return (profiles ?? []).map((p) => ({
    id: p.id,
    email: emails.get(p.id) ?? "",
    name: p.name,
    role: p.role ?? "student",
    school_name: (p.schools as { name?: string } | null)?.name ?? null,
  }));
}

export async function getSchoolTeamMembers(
  schoolId: string
): Promise<UserListItem[]> {
  const supabase = await createClient();
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select(`
      id,
      name,
      role,
      school_id,
      schools(name)
    `)
    .eq("school_id", schoolId)
    .neq("role", "student")
    .neq("role", "parent")
    .order("name");

  if (error) {
    console.error("getSchoolTeamMembers error:", error);
    return [];
  }

  const ids = (profiles ?? []).map((p) => p.id);
  const emails = await getAuthEmailsByUserIds(ids);

  return (profiles ?? []).map((p) => ({
    id: p.id,
    email: emails.get(p.id) ?? "",
    name: p.name,
    role: p.role ?? "student",
    school_name: (p.schools as { name?: string } | null)?.name ?? null,
  }));
}
