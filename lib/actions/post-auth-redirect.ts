"use server";

import { getPostAuthRedirect } from "@/lib/auth/post-auth-redirect";

export async function resolvePostAuthDestination(input: {
  userId: string;
  redirect?: string | null;
  intent?: string | null;
}) {
  return getPostAuthRedirect(input);
}
