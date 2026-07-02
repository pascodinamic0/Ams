import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getEvents } from "@/lib/db";
import { getEventRegistrations } from "@/lib/db/public-events";
import { getCurrentProfile } from "@/lib/auth/session";
import { getTranslations } from "next-intl/server";
import { EventForm, DeleteEventButton } from "./events-form";
import { EventRegistrationsPanel } from "./event-registrations-panel";
import { EventsCalendar } from "./events-calendar";

export default async function EventsPage() {
  const t = await getTranslations("operations");
  const tc = await getTranslations("common");
  const profile = await getCurrentProfile();
  const scope = {
    schoolId: profile?.school_id ?? undefined,
    branchId: profile?.branch_id ?? undefined,
  };

  const events = await getEvents(scope);
  const registrations = await getEventRegistrations({
    schoolId: profile?.school_id ?? undefined,
  });
  const branchId = profile?.branch_id ?? "";
  const tableData = events.map((row) => ({
    ...row,
    purpose:
      row.purpose === "campus_visit"
        ? t("purposeCampusVisit")
        : row.type === "holiday"
          ? t("purposeHoliday")
          : t("purposeGeneral"),
    website: row.type === "holiday" ? tc("emptyDash") : row.public_on_website ? tc("yes") : tc("no"),
    booking: row.booking_enabled ? t("bookingOpen") : tc("emptyDash"),
    actions: <DeleteEventButton id={String(row.id)} />,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("eventsTitle")}</h1>

      {branchId ? (
        <EventForm branchId={branchId} />
      ) : (
        <p className="text-sm text-stone-500">{t("assignBranchEvents")}</p>
      )}

      <EventsCalendar events={events} />

      <div>
        <h2 className="mb-3 text-lg font-semibold">{t("eventBookings")}</h2>
        <p className="mb-4 text-sm text-stone-500">
          {t("eventBookingsDesc")}
        </p>
        <EventRegistrationsPanel registrations={registrations} />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">{t("allEvents")}</h2>
        {events.length === 0 ? (
          <EmptyState title={t("noEvents")} description={t("noEventsDesc")} />
        ) : (
          <DataTable
            data={tableData}
            columns={[
              { id: "title", header: t("colTitle"), accessorKey: "title", sortable: true },
              { id: "date", header: tc("date"), accessorKey: "date", sortable: true },
              { id: "type", header: t("colType"), accessorKey: "type" },
              { id: "purpose", header: t("colPurpose"), accessorKey: "purpose" },
              { id: "website", header: t("colWebsite"), accessorKey: "website" },
              { id: "booking", header: t("colBooking"), accessorKey: "booking" },
              { id: "description", header: tc("description"), accessorKey: "description" },
              { id: "actions", header: "", accessorKey: "actions" },
            ]}
          />
        )}
      </div>
    </div>
  );
}
