"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { updateEventRegistrationStatus } from "@/lib/actions/event-registrations";
import type { EventRegistrationListItem } from "@/lib/db/public-events";
import { toast } from "@/lib/toast";

function RegistrationActions({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function setStatus(next: "confirmed" | "cancelled") {
    setLoading(true);
    const result = await updateEventRegistrationStatus(id, next);
    setLoading(false);
    if (result.error) {
      toast.error("Failed to update registration");
      return;
    }
    toast.success(next === "confirmed" ? "Registration confirmed" : "Registration cancelled");
    router.refresh();
  }

  if (status === "cancelled") {
    return <span className="text-xs text-slate-400">Cancelled</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {status !== "confirmed" && (
        <Button size="sm" variant="outline" disabled={loading} onClick={() => setStatus("confirmed")}>
          Confirm
        </Button>
      )}
      <Button size="sm" variant="ghost" disabled={loading} onClick={() => setStatus("cancelled")}>
        Cancel
      </Button>
    </div>
  );
}

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function EventRegistrationsPanel({
  registrations,
}: {
  registrations: EventRegistrationListItem[];
}) {
  if (registrations.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No online bookings yet. Enable booking on events or create campus visit slots for enrollment.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b bg-slate-50 dark:bg-slate-900/50">
          <tr>
            <th className="px-4 py-3 font-medium">Event</th>
            <th className="px-4 py-3 font-medium">Enrollment</th>
            <th className="px-4 py-3 font-medium">Registrant</th>
            <th className="px-4 py-3 font-medium">Contact</th>
            <th className="px-4 py-3 font-medium">Party</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {registrations.map((row) => (
            <tr key={row.id}>
              <td className="px-4 py-3">
                <p className="font-medium">{row.event_title}</p>
                <p className="text-xs text-slate-500">{formatDate(row.event_date)}</p>
                {row.event_purpose === "campus_visit" && (
                  <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                    Campus visit
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                {row.student_name ? (
                  <p className="text-sm">{row.student_name}</p>
                ) : (
                  <span className="text-xs text-slate-400">—</span>
                )}
              </td>
              <td className="px-4 py-3">{row.registrant_name}</td>
              <td className="px-4 py-3">
                <p>{row.email}</p>
                {row.phone && <p className="text-xs text-slate-500">{row.phone}</p>}
                {row.notes && (
                  <p className="mt-1 text-xs text-slate-500 line-clamp-2">{row.notes}</p>
                )}
              </td>
              <td className="px-4 py-3">{row.party_size}</td>
              <td className="px-4 py-3 capitalize">{row.status}</td>
              <td className="px-4 py-3">
                <RegistrationActions id={row.id} status={row.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
