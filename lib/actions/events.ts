"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { eventSchema, type EventFormData } from "@/lib/validations/operations";
import { revalidateSchoolWebsiteByBranch } from "@/lib/schools/revalidate-website";

export async function createEvent(input: EventFormData) {
  const parsed = eventSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const isCampusVisit = parsed.data.purpose === "campus_visit";
  const payload = {
    ...parsed.data,
    public_on_website:
      parsed.data.type === "holiday"
        ? false
        : isCampusVisit
          ? parsed.data.public_on_website
          : parsed.data.public_on_website,
    booking_enabled:
      parsed.data.type === "holiday"
        ? false
        : isCampusVisit
          ? true
          : parsed.data.booking_enabled,
  };

  const { data, error } = await supabase
    .from("events")
    .insert(payload)
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/operations/events");
  await revalidateSchoolWebsiteByBranch(parsed.data.branch_id);
  return { data: { id: data.id } };
}

export async function updateEvent(id: string, input: EventFormData) {
  const parsed = eventSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("events")
    .select("branch_id")
    .eq("id", id)
    .single();

  const isCampusVisit = parsed.data.purpose === "campus_visit";
  const payload = {
    ...parsed.data,
    public_on_website: parsed.data.type === "holiday" ? false : parsed.data.public_on_website,
    booking_enabled:
      parsed.data.type === "holiday" ? false : isCampusVisit ? true : parsed.data.booking_enabled,
  };

  const { error } = await supabase.from("events").update(payload).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/operations/events");
  if (existing?.branch_id) {
    await revalidateSchoolWebsiteByBranch(existing.branch_id);
  }
  return {};
}

export async function deleteEvent(id: string) {
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("events")
    .select("branch_id")
    .eq("id", id)
    .single();

  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/operations/events");
  if (existing?.branch_id) {
    await revalidateSchoolWebsiteByBranch(existing.branch_id);
  }
  return {};
}
