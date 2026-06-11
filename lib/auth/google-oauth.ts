"use client";

import { buildAuthCallbackUrl } from "@/lib/auth/app-url";
import { createClient } from "@/lib/supabase/client";

export type GoogleOAuthIntent = "login" | "register";

export async function signInWithGoogle(options?: {
  intent?: GoogleOAuthIntent;
  redirect?: string | null;
}) {
  const supabase = createClient();
  const callbackUrl = buildAuthCallbackUrl({
    intent: options?.intent,
    redirect: options?.redirect,
  });

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackUrl,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) throw error;
}
