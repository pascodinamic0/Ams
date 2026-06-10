"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { eventSchema, type EventFormData } from "@/lib/validations/operations";

export async function createEvent(input: EventFormData) {
  const parsed = eventSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("events")
    .insert(parsed.data)
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/operations/events");
  return { data: { id: data.id } };
}

export async function updateEvent(id: string, input: EventFormData) {
  const parsed = eventSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.flatten().fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase.from("events").update(parsed.data).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/operations/events");
  return {};
}

export async function deleteEvent(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/operations/events");
  return {};
}
