import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import {
  authErrorRedirectPath,
  resolveCallbackErrorMessage,
} from "@/lib/auth/callback-errors";
import { getAuthRedirectOrigin } from "@/lib/auth/app-url";
import { getPostAuthRedirect } from "@/lib/auth/post-auth-redirect";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";

const OTP_TYPES = new Set<EmailOtpType>([
  "invite",
  "recovery",
  "signup",
  "email",
  "magiclink",
  "email_change",
]);

function redirectWithCookies(from: NextResponse, url: string): NextResponse {
  const redirectResponse = NextResponse.redirect(url);
  from.cookies.getAll().forEach(({ name, value, ...options }) => {
    redirectResponse.cookies.set(name, value, options);
  });
  return redirectResponse;
}

function isSafeNextPath(value: string | null): value is string {
  return Boolean(value && value.startsWith("/") && !value.startsWith("//"));
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const typeParam = requestUrl.searchParams.get("type");
  const nextParam = requestUrl.searchParams.get("next");
  const origin = getAuthRedirectOrigin(request);
  const type = OTP_TYPES.has(typeParam as EmailOtpType)
    ? (typeParam as EmailOtpType)
    : null;
  const intent = type === "invite" ? "invite" : type === "signup" ? "register" : null;
  const errorPath = authErrorRedirectPath(intent);

  if (!tokenHash || !type) {
    const message = resolveCallbackErrorMessage(requestUrl.searchParams, {
      intent,
    });
    return NextResponse.redirect(
      `${origin}${errorPath}?error=${encodeURIComponent(message)}`
    );
  }

  const sessionResponse = NextResponse.redirect(`${origin}${errorPath}`);
  const supabase = await createRouteHandlerClient(sessionResponse);
  const { error } = await supabase.auth.verifyOtp({
    type,
    token_hash: tokenHash,
  });

  if (error) {
    console.error("auth confirm verifyOtp:", error);
    return redirectWithCookies(
      sessionResponse,
      `${origin}${errorPath}?error=${encodeURIComponent(error.message)}`
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirectWithCookies(
      sessionResponse,
      `${origin}${errorPath}?error=${encodeURIComponent("Sign-in failed. Try again.")}`
    );
  }

  const destination =
    type === "invite" || type === "recovery"
      ? isSafeNextPath(nextParam)
        ? nextParam
        : "/reset-password"
      : await getPostAuthRedirect({
          userId: user.id,
          intent,
        });

  return redirectWithCookies(sessionResponse, `${origin}${destination}`);
}
