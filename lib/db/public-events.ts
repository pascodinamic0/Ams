import { createClient } from "@/lib/supabase/server";

export type PublicSchoolEvent = {
  id: string;
  title: string;
  date: string;
  type: "event" | "holiday";
  purpose: "general" | "campus_visit";
  description: string | null;
  location: string | null;
  start_time: string | null;
  booking_enabled: boolean;
  booking_procedure: string | null;
};

export type EventRegistrationListItem = {
  id: string;
  event_id: string;
  event_title: string;
  event_date: string;
  event_purpose: "general" | "campus_visit";
  registrant_name: string;
  email: string;
  phone: string | null;
  party_size: number;
  notes: string | null;
  status: string;
  admission_application_id: string | null;
  student_name: string | null;
  created_at: string;
};

async function getBranchIdsForSchool(schoolId: string): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("branches").select("id").eq("school_id", schoolId);
  return (data ?? []).map((b) => b.id);
}

export async function getPublicSchoolEvents(
  schoolId: string,
  options?: { limit?: number; upcomingOnly?: boolean }
): Promise<PublicSchoolEvent[]> {
  const branchIds = await getBranchIdsForSchool(schoolId);
  if (branchIds.length === 0) return [];

  const supabase = await createClient();
  let query = supabase
    .from("events")
    .select(
      "id, title, date, type, purpose, description, location, start_time, booking_enabled, booking_procedure, public_on_website"
    )
    .in("branch_id", branchIds)
    .eq("public_on_website", true)
    .neq("purpose", "campus_visit")
    .order("date", { ascending: true });

  if (options?.upcomingOnly !== false) {
    query = query.gte("date", new Date().toISOString().slice(0, 10));
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) {
    console.error("getPublicSchoolEvents error:", error.message, error.code, error.details);
    return [];
  }

  return (data ?? []).map((event) => ({
    id: event.id,
    title: event.title,
    date: event.date,
    type: (event.type as "event" | "holiday") ?? "event",
    purpose: (event.purpose as "general" | "campus_visit") ?? "general",
    description: event.description,
    location: event.location,
    start_time: event.start_time,
    booking_enabled: event.booking_enabled ?? false,
    booking_procedure: event.booking_procedure,
  }));
}

export async function getCampusVisitSlots(
  schoolId: string,
  options?: { limit?: number }
): Promise<PublicSchoolEvent[]> {
  const branchIds = await getBranchIdsForSchool(schoolId);
  if (branchIds.length === 0) return [];

  const supabase = await createClient();
  let query = supabase
    .from("events")
    .select(
      "id, title, date, type, purpose, description, location, start_time, booking_enabled, booking_procedure"
    )
    .in("branch_id", branchIds)
    .eq("purpose", "campus_visit")
    .eq("booking_enabled", true)
    .gte("date", new Date().toISOString().slice(0, 10))
    .order("date", { ascending: true })
    .order("start_time", { ascending: true, nullsFirst: false });

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) {
    console.error("getCampusVisitSlots error:", error.message, error.code, error.details);
    return [];
  }

  return (data ?? []).map((event) => ({
    id: event.id,
    title: event.title,
    date: event.date,
    type: (event.type as "event" | "holiday") ?? "event",
    purpose: "campus_visit" as const,
    description: event.description,
    location: event.location,
    start_time: event.start_time,
    booking_enabled: true,
    booking_procedure: event.booking_procedure,
  }));
}

export async function getPublicSchoolEvent(
  schoolId: string,
  eventId: string
): Promise<PublicSchoolEvent | null> {
  const events = await getPublicSchoolEvents(schoolId, { upcomingOnly: false });
  return events.find((e) => e.id === eventId) ?? null;
}

export async function getEventRegistrations(options?: {
  schoolId?: string;
  eventId?: string;
}): Promise<EventRegistrationListItem[]> {
  const supabase = await createClient();

  let eventIds: string[] | null = null;
  if (options?.eventId) {
    eventIds = [options.eventId];
  } else if (options?.schoolId) {
    const branchIds = await getBranchIdsForSchool(options.schoolId);
    if (branchIds.length === 0) return [];
    const { data: events } = await supabase.from("events").select("id").in("branch_id", branchIds);
    eventIds = (events ?? []).map((e) => e.id);
    if (eventIds.length === 0) return [];
  }

  let query = supabase
    .from("event_registrations")
    .select(
      "id, event_id, registrant_name, email, phone, party_size, notes, status, created_at, admission_application_id, events(title, date, purpose), admission_applications(student_name)"
    )
    .order("created_at", { ascending: false });

  if (eventIds) {
    query = query.in("event_id", eventIds);
  }

  const { data, error } = await query;
  if (error) {
    console.error("getEventRegistrations error:", error.message, error.code, error.details);
    return [];
  }

  return (data ?? []).map((row) => {
    const event = row.events as { title: string; date: string; purpose: string } | null;
    const admission = row.admission_applications as { student_name: string } | null;
    return {
      id: row.id,
      event_id: row.event_id,
      event_title: event?.title ?? "Event",
      event_date: event?.date ?? "",
      event_purpose: (event?.purpose as "general" | "campus_visit") ?? "general",
      registrant_name: row.registrant_name,
      email: row.email,
      phone: row.phone,
      party_size: row.party_size,
      notes: row.notes,
      status: row.status,
      admission_application_id: row.admission_application_id,
      student_name: admission?.student_name ?? null,
      created_at: row.created_at,
    };
  });
}
