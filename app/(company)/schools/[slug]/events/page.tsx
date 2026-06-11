import { notFound } from "next/navigation";
import Link from "next/link";
import { EventBookingForm } from "@/components/schools/event-booking-form";
import { getSchoolBySlug } from "@/lib/db";
import { getPublicSchoolEvents } from "@/lib/db/public-events";

function formatEventDate(date: string, time: string | null) {
  const formatted = new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  if (!time) return formatted;
  return `${formatted} at ${time.slice(0, 5)}`;
}

export default async function SchoolEventsPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const school = await getSchoolBySlug(slug);
  if (!school) notFound();

  const events = await getPublicSchoolEvents(school.id, { upcomingOnly: true });
  const primary = school.theme_primary_color ?? "#4f46e5";

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <Link
        href={`/schools/${slug}`}
        className="text-sm text-zinc-500 hover:underline"
      >
        &larr; Back to {school.name}
      </Link>
      <h1 className="mt-4 text-3xl font-bold">School events</h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Upcoming events at {school.name}. Register online where booking is available.
      </p>

      {events.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500 dark:border-zinc-700">
          No upcoming public events right now. Check back soon.
        </p>
      ) : (
        <div className="mt-10 space-y-10">
          {events.map((event) => (
            <article
              key={event.id}
              id={`event-${event.id}`}
              className="scroll-mt-24 rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
                    {event.type === "holiday" ? "Holiday" : "Event"}
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold">{event.title}</h2>
                  <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                    {formatEventDate(event.date, event.start_time)}
                  </p>
                  {event.location && (
                    <p className="mt-1 text-sm text-zinc-500">{event.location}</p>
                  )}
                </div>
              </div>
              {event.description && (
                <p className="mt-4 leading-relaxed text-zinc-700 dark:text-zinc-300">
                  {event.description}
                </p>
              )}
              {event.type === "event" && event.booking_enabled && (
                <div className="mt-6">
                  <EventBookingForm event={event} primary={primary} />
                </div>
              )}
              {event.type === "event" && !event.booking_enabled && event.booking_procedure && (
                <div className="mt-6 rounded-xl bg-zinc-50 p-4 text-sm dark:bg-zinc-900">
                  <p className="font-medium">How to attend</p>
                  <p className="mt-2 text-zinc-600 dark:text-zinc-400">{event.booking_procedure}</p>
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
