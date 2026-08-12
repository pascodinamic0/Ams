import type { SupabaseClient, User } from "@supabase/supabase-js";
import {
  buildPasswordSetupUrl,
  getServerRequestOrigin,
} from "@/lib/auth/app-url";
import { sendInvitePasswordEmail } from "@/lib/services/email";

async function markMustSetPassword(admin: SupabaseClient, user: User) {
  const { error } = await admin.auth.admin.updateUserById(user.id, {
    app_metadata: {
      ...(user.app_metadata ?? {}),
      must_set_password: true,
    },
  });
  if (error) {
    console.error("markMustSetPassword:", error);
  }
}

/**
 * Create a one-time token_hash link and email it via Resend.
 * This avoids PKCE (admin-generated invite links have no browser verifier),
 * which is why Accept invite never reached password setup.
 */
export async function sendPasswordSetupEmail(options: {
  admin: SupabaseClient;
  email: string;
  name: string;
  role?: string;
  linkType: "invite" | "recovery";
}): Promise<{ user?: User; error?: string }> {
  const origin = await getServerRequestOrigin();
  const redirectTo = `${origin}/auth/callback?intent=invite&redirect=/reset-password`;

  const { data, error } =
    options.linkType === "invite"
      ? await options.admin.auth.admin.generateLink({
          type: "invite",
          email: options.email,
          options: {
            data: {
              name: options.name,
              role: options.role,
            },
            redirectTo,
          },
        })
      : await options.admin.auth.admin.generateLink({
          type: "recovery",
          email: options.email,
          options: { redirectTo },
        });

  if (error || !data?.user || !data.properties?.hashed_token) {
    console.error("sendPasswordSetupEmail generateLink:", error);
    return {
      error: error?.message ?? "Failed to create the invitation link",
    };
  }

  await markMustSetPassword(options.admin, data.user);

  const setupUrl = buildPasswordSetupUrl({
    origin,
    tokenHash: data.properties.hashed_token,
    type: options.linkType,
  });

  const sent = await sendInvitePasswordEmail({
    to: options.email,
    name: options.name,
    setupUrl,
  });

  if (!sent.success) {
    return {
      user: data.user,
      error: sent.error ?? "Failed to send the invitation email",
    };
  }

  return { user: data.user };
}
