import { NextResponse } from "next/server";
import {
  authErrorRedirectPath,
  resolveCallbackErrorMessage,
} from "@/lib/auth/callback-errors";
import { getPostAuthRedirect } from "@/lib/auth/post-auth-redirect";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";

function resolveRedirectOrigin(request: Request): string {
  const { origin } = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";

  if (process.env.NODE_ENV === "development") {
    return origin;
  }

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return origin;
}

function redirectWithCookies(
  from: NextResponse,
  url: string
): NextResponse {
  const redirectResponse = NextResponse.redirect(url);
  from.cookies.getAll().forEach(({ name, value, ...options }) => {
    redirectResponse.cookies.set(name, value, options);
  });
  return redirectResponse;
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const intent = requestUrl.searchParams.get("intent");
  const redirect = requestUrl.searchParams.get("redirect");
  const origin = resolveRedirectOrigin(request);
  const errorPath = authErrorRedirectPath(intent);

  if (!code) {
    const message = resolveCallbackErrorMessage(requestUrl.searchParams, {
      intent,
    });
    console.error("auth callback missing code:", {
      intent,
      error: requestUrl.searchParams.get("error"),
      error_description: requestUrl.searchParams.get("error_description"),
    });
    return NextResponse.redirect(
      `${origin}${errorPath}?error=${encodeURIComponent(message)}`
    );
  }

  const sessionResponse = NextResponse.redirect(`${origin}${errorPath}`);
  const supabase = await createRouteHandlerClient(sessionResponse);
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("auth callback exchangeCodeForSession:", error);
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

  const destination = await getPostAuthRedirect({
    userId: user.id,
    redirect,
    intent,
  });

  return redirectWithCookies(sessionResponse, `${origin}${destination}`);
}
