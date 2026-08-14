import Link from "next/link";
import type { PublicSchoolEvent } from "@/lib/db/public-events";

function formatEventDate(date: string, time: string | null, locale: string) {
  const formatted = new Date(`${date}T00:00:00`).toLocaleDateString(locale, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  if (!time) return formatted;
  return `${formatted} · ${time.slice(0, 5)}`;
}

export function PublicEventsSection({
  events,
  slug,
  primary,
  variant = "modern",
  t,
  locale,
}: {
  events: PublicSchoolEvent[];
  slug: string;
  primary: string;
  variant?: "modern" | "classic" | "minimal";
  t: (key: string) => string;
  locale: string;
}) {
  const bookable = events.filter((e) => e.type === "event").slice(0, 3);
  if (bookable.length === 0) return null;

  return (
    <section id="events" className="scroll-mt-28">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            className={
              variant === "classic"
                ? "font-serif text-2xl font-bold sm:text-3xl"
                : variant === "minimal"
                  ? "font-editorial text-xs font-medium uppercase tracking-[0.2em] text-stone-500"
                  : "text-2xl font-bold tracking-tight sm:text-3xl"
            }
            style={variant === "classic" ? { color: primary } : undefined}
          >
            {variant === "minimal" ? t("nav.events") : t("chrome.upcomingEvents")}
          </h2>
          {variant !== "minimal" && (
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-stone-600 sm:text-base">
              {t("chrome.missOpenDay")}
            </p>
          )}
        </div>
        <Link
          href={`/schools/${slug}/events`}
          className="text-sm font-medium hover:underline"
          style={{ color: primary }}
        >
          {t("chrome.viewAllEvents")}
        </Link>
      </div>
      <div
        className={
          variant === "minimal"
            ? "mt-8 space-y-8"
            : "mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 md:gap-5"
        }
      >
        {bookable.map((event) => (
          <article
            key={event.id}
            className={
              variant === "classic"
                ? "border bg-white p-5"
                : variant === "minimal"
                  ? "border-t border-stone-300/70 pt-5"
                  : "border border-stone-200 bg-white p-5"
            }
            style={variant === "classic" ? { borderColor: `${primary}30` } : undefined}
          >
            <p className="text-xs font-medium uppercase tracking-widest text-stone-400">
              {formatEventDate(event.date, event.start_time, locale)}
            </p>
            <h3
              className={
                variant === "classic"
                  ? "mt-2 font-serif text-lg font-semibold"
                  : variant === "minimal"
                    ? "mt-2 font-editorial text-lg font-semibold"
                    : "mt-2 text-lg font-semibold"
              }
            >
              {event.title}
            </h3>
            {event.location && (
              <p className="mt-1 text-sm text-stone-500">{event.location}</p>
            )}
            {event.description && (
              <p className="mt-3 line-clamp-3 text-sm text-stone-600">
                {event.description}
              </p>
            )}
            <Link
              href={`/schools/${slug}/events#event-${event.id}`}
              className="mt-4 inline-block text-sm font-medium"
              style={{ color: primary }}
            >
              {event.booking_enabled ? t("chrome.claimASpot") : t("chrome.viewDetails")}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
