import { createClient } from "@/lib/supabase/server";

export type CurrentProfile = {
  id: string;
  name: string | null;
  role: string;
  school_id: string | null;
  branch_id: string | null;
  email: string | null;
};

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, name, role, school_id, branch_id")
    .eq("id", user.id)
    .single();

  return {
    id: user.id,
    name: profile?.name ?? null,
    role: profile?.role ?? "student",
    school_id: profile?.school_id ?? null,
    branch_id: profile?.branch_id ?? null,
    email: user.email ?? null,
  };
}
