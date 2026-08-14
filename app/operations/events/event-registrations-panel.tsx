"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("operations");
  const tc = useTranslations("common");
  const te = useTranslations("errors");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function setStatus(next: "confirmed" | "cancelled") {
    setLoading(true);
    const result = await updateEventRegistrationStatus(id, next);
    setLoading(false);
    if ("error" in result && result.error) {
      toast.error(typeof result.error === "string" ? result.error : te("failedUpdateRegistration"));
      return;
    }
    toast.success(next === "confirmed" ? t("registrationConfirmed") : t("registrationCancelled"));
    router.refresh();
  }

  if (status === "cancelled") {
    return <span className="text-xs text-stone-400">{t("cancelled")}</span>;
  }

  return (
    <div className="flex flex-wrap gap-1">
      {status !== "confirmed" && (
        <Button size="sm" variant="outline" disabled={loading} onClick={() => setStatus("confirmed")}>
          {tc("confirm")}
        </Button>
      )}
      <Button size="sm" variant="ghost" disabled={loading} onClick={() => setStatus("cancelled")}>
        {tc("cancel")}
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
  const t = useTranslations("operations");
  const tc = useTranslations("common");

  function statusLabel(status: string) {
    if (status === "cancelled") return t("cancelled");
    if (status === "confirmed") return t("confirmed");
    if (status === "pending") return tc("pending");
    return status;
  }

  if (registrations.length === 0) {
    return (
      <p className="text-sm text-stone-500">
        {t("noOnlineBookings")}
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead className="border-b bg-stone-50 dark:bg-stone-900/50">
          <tr>
            <th className="px-4 py-3 font-medium">{t("event")}</th>
            <th className="px-4 py-3 font-medium">{t("enrollment")}</th>
            <th className="px-4 py-3 font-medium">{t("registrant")}</th>
            <th className="px-4 py-3 font-medium">{t("contact")}</th>
            <th className="px-4 py-3 font-medium">{t("party")}</th>
            <th className="px-4 py-3 font-medium">{tc("status")}</th>
            <th className="px-4 py-3 font-medium">{tc("actions")}</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {registrations.map((row) => (
            <tr key={row.id}>
              <td className="px-4 py-3">
                <p className="font-medium">{row.event_title}</p>
                <p className="text-xs text-stone-500">{formatDate(row.event_date)}</p>
                {row.event_purpose === "campus_visit" && (
                  <span className="mt-1 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                    {t("purposeCampusVisit")}
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                {row.student_name ? (
                  <p className="text-sm">{row.student_name}</p>
                ) : (
                  <span className="text-xs text-stone-400">{"\u2014"}</span>
                )}
              </td>
              <td className="px-4 py-3">{row.registrant_name}</td>
              <td className="px-4 py-3">
                <p>{row.email}</p>
                {row.phone && <p className="text-xs text-stone-500">{row.phone}</p>}
                {row.notes && (
                  <p className="mt-1 text-xs text-stone-500 line-clamp-2">{row.notes}</p>
                )}
              </td>
              <td className="px-4 py-3">{row.party_size}</td>
              <td className="px-4 py-3">{statusLabel(row.status)}</td>
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
