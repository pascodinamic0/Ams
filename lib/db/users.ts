import { createClient } from "@/lib/supabase/server";

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

  // Profiles don't have email - we need auth.users. Supabase doesn't expose auth.users to anon.
  // We can use a join if we have a view, or we store email in profiles.
  // The schema has profiles without email. For now, use name as display and fetch email from a custom RPC or store it in profiles.
  // Simplest: add email to profiles via a trigger from auth.users, or use a database function.
  // For initial implementation, we'll show name and role. Email would require server-side admin API.
  const result: UserListItem[] = (profiles ?? []).map((p) => ({
    id: p.id,
    email: "", // Would need auth.users join - not exposed to client
    name: p.name,
    role: p.role ?? "student",
    school_name: (p.schools as { name?: string } | null)?.name ?? null,
  }));

  return result;
}
