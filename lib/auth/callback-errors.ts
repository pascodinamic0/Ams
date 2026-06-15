const OAUTH_ERROR_MESSAGES: Record<string, string> = {
  access_denied: "Sign-in was cancelled. Please try again.",
  invalid_request:
    "Sign-in could not start. The redirect URL may not be allowed in Supabase Auth settings.",
  unauthorized_client:
    "This app is not authorized for sign-in. Check Google OAuth and Supabase provider settings.",
  server_error: "The sign-in provider returned an error. Please try again in a few minutes.",
  temporarily_unavailable:
    "Sign-in is temporarily unavailable. Please try again later.",
};

export function resolveCallbackErrorMessage(
  searchParams: URLSearchParams,
  options?: { intent?: string | null }
): string {
  const oauthError = searchParams.get("error");
  const oauthDescription = searchParams.get("error_description");

  if (oauthError) {
    if (oauthDescription?.trim()) {
      return oauthDescription.replace(/\+/g, " ").trim();
    }
    return (
      OAUTH_ERROR_MESSAGES[oauthError] ??
      `Sign-in failed (${oauthError}). Please try again.`
    );
  }

  if (options?.intent === "register") {
    return (
      "Registration could not be completed. The callback URL may be missing from " +
      "Supabase Auth ? URL Configuration (add your site URL with /auth/callback, " +
      "including ?intent=register or use a /** wildcard). Then try again."
    );
  }

  return (
    "Sign-in link is invalid or expired. Request a new confirmation or sign-in link."
  );
}

export function authErrorRedirectPath(intent?: string | null): string {
  return intent === "register" ? "/register" : "/login";
}
