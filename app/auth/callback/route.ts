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
    // A rewrite from this route handler 500s on Vercel; a 302 would drop the hash.
    // Serve a tiny page that keeps search + hash and continues on /auth/hash.
    return new NextResponse(
      `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Continuing</title>
    <script>
      (function () {
        var search = window.location.search || "";
        var hash = window.location.hash || "";
        window.location.replace("/auth/hash" + search + hash);
      })();
    </script>
  </head>
  <body></body>
</html>`,
      {
        status: 200,
        headers: {
          "content-type": "text/html; charset=utf-8",
          "cache-control": "no-store",
        },
      }
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
