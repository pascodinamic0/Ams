import { DataTable } from "@/components/ui/data-table";
import { EmptyState } from "@/components/ui/empty-state";
import { getEvents } from "@/lib/db";
import { getEventRegistrations } from "@/lib/db/public-events";
import { getCurrentProfile } from "@/lib/auth/session";
import { EventForm, DeleteEventButton } from "./events-form";
import { EventRegistrationsPanel } from "./event-registrations-panel";
import { EventsCalendar } from "./events-calendar";

export default async function EventsPage() {
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
        ? "Campus visit"
        : row.type === "holiday"
          ? "Holiday"
          : "General",
    website: row.type === "holiday" ? "—" : row.public_on_website ? "Yes" : "No",
    booking: row.booking_enabled ? "Open" : "—",
    actions: <DeleteEventButton id={String(row.id)} />,
  }));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Events & Holidays</h1>

      {branchId ? (
        <EventForm branchId={branchId} />
      ) : (
        <p className="text-sm text-slate-500">Assign a branch to your profile to add events.</p>
      )}

      <EventsCalendar events={events} />

      <div>
        <h2 className="mb-3 text-lg font-semibold">Event bookings</h2>
        <p className="mb-4 text-sm text-slate-500">
          Registrations submitted from your school&apos;s public events page.
        </p>
        <EventRegistrationsPanel registrations={registrations} />
      </div>

      <div>
        <h2 className="mb-3 text-lg font-semibold">All events</h2>
        {events.length === 0 ? (
          <EmptyState title="No events yet" description="Add school events and holidays" />
        ) : (
          <DataTable
            data={tableData}
            columns={[
              { id: "title", header: "Title", accessorKey: "title", sortable: true },
              { id: "date", header: "Date", accessorKey: "date", sortable: true },
              { id: "type", header: "Type", accessorKey: "type" },
              { id: "purpose", header: "Purpose", accessorKey: "purpose" },
              { id: "website", header: "Website", accessorKey: "website" },
              { id: "booking", header: "Booking", accessorKey: "booking" },
              { id: "description", header: "Description", accessorKey: "description" },
              { id: "actions", header: "", accessorKey: "actions" },
            ]}
          />
        )}
      </div>
    </div>
  );
}
