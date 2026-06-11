import { NextResponse } from "next/server";
import { getPostAuthRedirect } from "@/lib/auth/post-auth-redirect";
import { createClient } from "@/lib/supabase/server";

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

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const intent = requestUrl.searchParams.get("intent");
  const redirect = requestUrl.searchParams.get("redirect");
  const origin = resolveRedirectOrigin(request);

  if (!code) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(
        "Sign-in link is invalid or expired. Request a new confirmation or sign-in link."
      )}`
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("auth callback exchangeCodeForSession:", error);
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error.message)}`
    );
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent("Sign-in failed. Try again.")}`
    );
  }

  const destination = await getPostAuthRedirect({
    userId: user.id,
    redirect,
    intent,
  });

  return NextResponse.redirect(`${origin}${destination}`);
}
