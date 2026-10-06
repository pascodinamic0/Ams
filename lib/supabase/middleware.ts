import { createServerClient } from "@supabase/ssr";
import { type User } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { clearAuthHeaders } from "@/lib/auth/request-auth";
import { supabaseFetch } from "@/lib/supabase/fetch";
import { readCookieSession } from "@/lib/supabase/session-cookie";

export async function updateSession(request: NextRequest): Promise<{
  response: NextResponse;
  user: User | null;
}> {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  clearAuthHeaders(requestHeaders);

  let supabaseResponse = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  const cookieSession = readCookieSession(request.cookies.getAll());
  if (cookieSession.status === "anonymous") {
    return { response: supabaseResponse, user: null };
  }
  if (cookieSession.status === "fresh") {
    return { response: supabaseResponse, user: cookieSession.user };
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return { response: supabaseResponse, user: null };
  }

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      global: { fetch: supabaseFetch },
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request: {
              headers: requestHeaders,
            },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return { response: supabaseResponse, user };
  } catch {
    return { response: supabaseResponse, user: null };
  }
}
