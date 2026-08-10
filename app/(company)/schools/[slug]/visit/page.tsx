import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { EventBookingForm } from "@/components/schools/event-booking-form";
import { SchoolInnerPage } from "@/components/schools/school-inner-page";
import { getSchoolBySlug } from "@/lib/db";
import { getCampusVisitSlots } from "@/lib/db/public-events";

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

export default async function SchoolVisitPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const school = await getSchoolBySlug(slug);
  if (!school) notFound();

  const t = await getTranslations("schools.visit");
  const slots = await getCampusVisitSlots(school.id);
  const primary = school.theme_primary_color ?? "#0d9488";

  return (
    <SchoolInnerPage
      school={school}
      title={t("title")}
      description={t("description", { schoolName: school.name })}
      backHref={`/schools/${slug}`}
      backLabel={t("backToSchool", { schoolName: school.name })}
    >
      {slots.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 p-10 text-center dark:border-stone-700 dark:bg-stone-900/40">
          <p className="font-medium text-stone-800 dark:text-stone-200">{t("emptyTitle")}</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-stone-600 dark:text-stone-400">
            {t("emptyDescription")}
          </p>
          {school.address && (
            <p className="mt-5 text-sm text-stone-600 dark:text-stone-400">
              {t("contactHint")}: {school.address}
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {slots.map((slot) => (
            <article
              key={slot.id}
              id={`visit-${slot.id}`}
              className="scroll-mt-24 rounded-2xl border border-stone-200 bg-white p-6 shadow-sm dark:border-stone-800 dark:bg-stone-950"
            >
              <div>
                <p className="text-xs font-medium uppercase tracking-widest text-stone-400">
                  {t("slotLabel")}
                </p>
                <h2 className="mt-1 text-2xl font-semibold">{slot.title}</h2>
                <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
                  {formatEventDate(slot.date, slot.start_time)}
                </p>
                {slot.location && (
                  <p className="mt-1 text-sm text-stone-500">{slot.location}</p>
                )}
              </div>
              {slot.description && (
                <p className="mt-4 leading-relaxed text-stone-700 dark:text-stone-300">
                  {slot.description}
                </p>
              )}
              <div className="mt-6">
                <EventBookingForm event={slot} primary={primary} />
              </div>
            </article>
          ))}
        </div>
      )}
    </SchoolInnerPage>
  );
}
