import { createClient } from "@/lib/supabase/server";

export type EventListItem = {
  id: string;
  title: string;
  date: string;
  type: "event" | "holiday";
  purpose: "general" | "campus_visit";
  description: string | null;
  location: string | null;
  start_time: string | null;
  public_on_website: boolean;
  booking_enabled: boolean;
};

async function resolveBranchIds(
  branchId?: string,
  schoolId?: string
): Promise<string[] | null> {
  if (branchId) return [branchId];
  if (!schoolId) return null;

  const supabase = await createClient();
  const { data } = await supabase.from("branches").select("id").eq("school_id", schoolId);
  return (data ?? []).map((b) => b.id);
}

export async function getEvents(options?: {
  branchId?: string;
  schoolId?: string;
  month?: string;
  fromDate?: string;
  limit?: number;
}): Promise<EventListItem[]> {
  const supabase = await createClient();
  const branchIds = await resolveBranchIds(options?.branchId, options?.schoolId);

  let query = supabase
    .from("events")
    .select(
      "id, title, date, type, purpose, description, location, start_time, public_on_website, booking_enabled"
    )
    .order("date", { ascending: true });

  if (branchIds) {
    if (branchIds.length === 0) return [];
    query = query.in("branch_id", branchIds);
  }

  if (options?.fromDate) {
    query = query.gte("date", options.fromDate);
  }

  if (options?.month) {
    const [year, month] = options.month.split("-").map(Number);
    const start = `${year}-${String(month).padStart(2, "0")}-01`;
    const endDate = new Date(year, month, 0);
    const end = endDate.toISOString().slice(0, 10);
    query = query.gte("date", start).lte("date", end);
  }

  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) {
    console.error("getEvents error:", error);
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
    public_on_website: event.public_on_website ?? true,
    booking_enabled: event.booking_enabled ?? false,
  }));
}

export async function getUpcomingEventsCount(options?: {
  branchId?: string;
  schoolId?: string;
  days?: number;
}) {
  const events = await getEvents(options);
  const today = new Date().toISOString().slice(0, 10);
  const horizon = new Date();
  horizon.setDate(horizon.getDate() + (options?.days ?? 30));
  const end = horizon.toISOString().slice(0, 10);

  return events.filter((e) => e.date >= today && e.date <= end).length;
}
