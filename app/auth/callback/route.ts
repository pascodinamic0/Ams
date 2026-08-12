import { NextResponse } from "next/server";
import { authErrorRedirectPath } from "@/lib/auth/callback-errors";
import { getAuthRedirectOrigin } from "@/lib/auth/app-url";
import { getPostAuthRedirect } from "@/lib/auth/post-auth-redirect";
import { createRouteHandlerClient } from "@/lib/supabase/route-handler";

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
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const intent = requestUrl.searchParams.get("intent");
  const redirect = requestUrl.searchParams.get("redirect");
  const origin = getAuthRedirectOrigin(request);
  const errorPath = authErrorRedirectPath(intent);

  if (tokenHash) {
    const confirm = new URL("/auth/confirm", origin);
    requestUrl.searchParams.forEach((value, key) => {
      confirm.searchParams.set(key, value);
    });
    return NextResponse.redirect(confirm);
  }

  if (!code) {
    // Implicit invite/recovery tokens live in the URL hash (server never sees them).
    // Rewrite so the browser keeps the hash instead of dropping it on a login redirect.
    const hashUrl = new URL(request.url);
    hashUrl.pathname = "/auth/hash";
    return NextResponse.rewrite(hashUrl);
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
