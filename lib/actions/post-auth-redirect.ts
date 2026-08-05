"use server";

import { getPostAuthRedirect } from "@/lib/auth/post-auth-redirect";
import { createClient } from "@/lib/supabase/server";

export async function resolvePostAuthDestination(input: {
  userId: string;
  redirect?: string | null;
  intent?: string | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== input.userId) {
    return "/login";
  }

  return getPostAuthRedirect(input);
}
