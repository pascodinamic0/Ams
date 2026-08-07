"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { isValidLocale, LOCALE_COOKIE, type Locale } from "@/i18n/config";

/**
 * Sets the AMS_LOCALE cookie.
 * For users belonging to a school, the school's locked locale always wins.
 */
export async function setLocale(locale: Locale) {
  if (!isValidLocale(locale)) {
    throw new Error("Invalid locale");
  }

  let nextLocale: Locale = locale;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("school_id, schools(locale)")
        .eq("id", user.id)
        .maybeSingle();

      if (profile?.school_id) {
        const school = profile.schools as
          | { locale?: string }
          | { locale?: string }[]
          | null;
        const schoolLocale = Array.isArray(school)
          ? school[0]?.locale
          : school?.locale;
        if (isValidLocale(schoolLocale)) {
          nextLocale = schoolLocale;
        }
      }
    }
  } catch {
    // Keep requested locale for visitors / registration edge cases.
  }

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE, nextLocale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  revalidatePath("/", "layout");
}
