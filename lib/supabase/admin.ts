import { createClient } from "@supabase/supabase-js";
import { getServiceRoleConfigError } from "@/lib/supabase/env";

let loggedServiceRoleConfigError = false;

/** Server-only Supabase client with service role. Returns null if key is not configured. */
export function createAdminClient() {
  const configError = getServiceRoleConfigError();
  if (configError) {
    if (!loggedServiceRoleConfigError) {
      loggedServiceRoleConfigError = true;
      // Warn once in dev — missing key is a config gap, not a thrown runtime error.
      console.warn("createAdminClient:", configError);
    }
    return null;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function getAuthEmailsByUserIds(
  userIds: string[]
): Promise<Map<string, string>> {
  const admin = createAdminClient();
  const emails = new Map<string, string>();
  if (!admin || userIds.length === 0) return emails;

  const results = await Promise.all(
    userIds.map(async (id) => {
      const { data, error } = await admin.auth.admin.getUserById(id);
      if (error || !data.user?.email) return null;
      return [id, data.user.email] as const;
    })
  );

  for (const entry of results) {
    if (entry) emails.set(entry[0], entry[1]);
  }
  return emails;
}
