import Link from "next/link";
import type { PublicSchoolEvent } from "@/lib/db/public-events";

function formatEventDate(date: string, time: string | null) {
  const formatted = new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  if (!time) return formatted;
  return `${formatted} at ${time.slice(0, 5)}`;
}

export function PublicEventsSection({
  events,
  slug,
  primary,
}: {
  events: PublicSchoolEvent[];
  slug: string;
  primary: string;
}) {
  const bookable = events.filter((e) => e.type === "event").slice(0, 3);
  if (bookable.length === 0) return null;

  return (
    <section id="events" className="scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Upcoming events</h2>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            School events you can attend or register for online.
          </p>
        </div>
        <Link
          href={`/schools/${slug}/events`}
          className="text-sm font-medium hover:underline"
          style={{ color: primary }}
        >
          View all events
        </Link>
      </div>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {bookable.map((event) => (
          <article
            key={event.id}
            className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950"
          >
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
              {formatEventDate(event.date, event.start_time)}
            </p>
            <h3 className="mt-2 text-lg font-semibold">{event.title}</h3>
            {event.location && (
              <p className="mt-1 text-sm text-zinc-500">{event.location}</p>
            )}
            {event.description && (
              <p className="mt-3 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">
                {event.description}
              </p>
            )}
            <Link
              href={`/schools/${slug}/events#event-${event.id}`}
              className="mt-4 inline-block text-sm font-medium"
              style={{ color: primary }}
            >
              {event.booking_enabled ? "Book your spot" : "View details"}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
