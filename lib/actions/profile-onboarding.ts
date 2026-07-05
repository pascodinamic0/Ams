"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { resolveLoginDestination } from "@/lib/auth/login-redirect";

const nameSchema = z
  .string()
  .trim()
  .min(1, "Name is required")
  .max(120, "Name is too long");

async function requireAuthenticatedProfile() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Not authenticated" as const };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, school_id, avatar_url, onboarding_completed_at")
    .eq("id", user.id)
    .single();

  if (!profile?.role) return { error: "Profile not found" as const };

  return { supabase, user, profile };
}

export async function updateProfileName(name: string) {
  const parsed = nameSchema.safeParse(name);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid name" };
  }

  const auth = await requireAuthenticatedProfile();
  if ("error" in auth) return auth;

  const { error } = await auth.supabase
    .from("profiles")
    .update({
      name: parsed.data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", auth.user.id);

  if (error) return { error: error.message };

  revalidatePath("/onboarding");
  return { data: { name: parsed.data } };
}

export async function completeProfileOnboarding() {
  const auth = await requireAuthenticatedProfile();
  if ("error" in auth) return auth;

  const { error } = await auth.supabase
    .from("profiles")
    .update({
      onboarding_completed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", auth.user.id);

  if (error) return { error: error.message };

  let schoolStatus: "pending" | "approved" | "suspended" | null = null;
  if (auth.profile.school_id) {
    const { data: school } = await auth.supabase
      .from("schools")
      .select("status")
      .eq("id", auth.profile.school_id)
      .single();
    schoolStatus = (school?.status as typeof schoolStatus) ?? null;
  }

  const destination = resolveLoginDestination({
    role: auth.profile.role,
    schoolStatus,
  });

  revalidatePath("/", "layout");
  return { data: { destination } };
}
