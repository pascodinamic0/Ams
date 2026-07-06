import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { type NextResponse } from "next/server";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

/** Supabase client for route handlers; persists auth cookies on the response. */
export async function createRouteHandlerClient(response: NextResponse) {
  const cookieStore = await cookies();
  const { url, anonKey } = getSupabasePublicEnv();

  return createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
          response.cookies.set(name, value, options);
        });
      },
    },
  });
}
