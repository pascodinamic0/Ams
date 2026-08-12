"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createEvent, deleteEvent } from "@/lib/actions/events";
import { toast } from "@/lib/toast";

export function EventForm({ branchId }: { branchId: string }) {
  const t = useTranslations("operations");
  const tc = useTranslations("common");
  const te = useTranslations("errors");
  const router = useRouter();
  const defaultBookingProcedure = t("defaultBookingProcedure");
  const defaultCampusVisitProcedure = t("defaultCampusVisitProcedure");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [location, setLocation] = useState("");
  const [type, setType] = useState<"event" | "holiday">("event");
  const [purpose, setPurpose] = useState<"general" | "campus_visit">("general");
  const [description, setDescription] = useState("");
  const [publicOnWebsite, setPublicOnWebsite] = useState(true);
  const [bookingEnabled, setBookingEnabled] = useState(false);
  const [bookingProcedure, setBookingProcedure] = useState(defaultBookingProcedure);
  const [loading, setLoading] = useState(false);

  const isHoliday = type === "holiday";
  const isCampusVisit = !isHoliday && purpose === "campus_visit";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await createEvent({
      title,
      date,
      type,
      purpose: isHoliday ? "general" : purpose,
      description: description || undefined,
      location: location || undefined,
      start_time: startTime || undefined,
      branch_id: branchId,
      public_on_website: isHoliday ? false : isCampusVisit ? false : publicOnWebsite,
      booking_enabled: isHoliday ? false : isCampusVisit ? true : bookingEnabled,
      booking_procedure: isHoliday
        ? undefined
        : isCampusVisit
          ? bookingProcedure || defaultCampusVisitProcedure
          : bookingEnabled || bookingProcedure
            ? bookingProcedure || defaultBookingProcedure
            : undefined,
    });
    setLoading(false);
    if (result.error) {
      toast.error(typeof result.error === "string" ? result.error : te("failedCreateEvent"));
      return;
    }
    toast.success(
      isCampusVisit
        ? t("campusVisitSlotCreated")
        : publicOnWebsite && !isHoliday
          ? t("eventPublished")
          : t("eventCreated")
    );
    setTitle("");
    setDate("");
    setStartTime("");
    setLocation("");
    setDescription("");
    setPurpose("general");
    setPublicOnWebsite(true);
    setBookingEnabled(false);
    setBookingProcedure(defaultBookingProcedure);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border p-4">
      <div>
        <h2 className="text-lg font-semibold">{t("addEventOrHoliday")}</h2>
        <p className="text-sm text-stone-500">
          {t("eventsMarkedForWebsite")}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <Label>{t("colTitle")}</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>
        <div>
          <Label>{tc("date")}</Label>
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div>
          <Label>{t("startTimeOptional")}</Label>
          <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </div>
        <div>
          <Label>{t("colType")}</Label>
          <select
            value={type}
            onChange={(e) => {
              const next = e.target.value as "event" | "holiday";
              setType(next);
              if (next === "holiday") setPurpose("general");
            }}
            className="w-full rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
          >
            <option value="event">{t("eventTypeEvent")}</option>
            <option value="holiday">{t("holiday")}</option>
          </select>
        </div>
        {!isHoliday && (
          <div>
            <Label>{t("purpose")}</Label>
            <select
              value={purpose}
              onChange={(e) => {
                const next = e.target.value as "general" | "campus_visit";
                setPurpose(next);
                if (next === "campus_visit") {
                  setPublicOnWebsite(false);
                  setBookingEnabled(true);
                  setBookingProcedure(defaultCampusVisitProcedure);
                  if (!title) setTitle(t("purposeCampusVisit"));
                }
              }}
              className="w-full rounded-lg border px-3 py-2 text-sm dark:border-stone-700 dark:bg-stone-900"
            >
              <option value="general">{t("generalEvent")}</option>
              <option value="campus_visit">{t("campusVisitSlot")}</option>
            </select>
          </div>
        )}
        <div className="sm:col-span-2">
          <Label>{t("locationOptional")}</Label>
          <Input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder={t("locationPlaceholder")}
          />
        </div>
        <div className="sm:col-span-2 lg:col-span-3">
          <Label>{tc("description")}</Label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder={t("eventDescriptionPlaceholder")}
          />
        </div>
      </div>

      {!isHoliday && isCampusVisit && (
        <div className="space-y-3 rounded-lg border border-dashed border-amber-200 bg-amber-50/50 p-4 dark:border-amber-900 dark:bg-amber-950/20">
          <p className="text-sm font-medium">{t("campusVisitSlotTitle")}</p>
          <p className="text-sm text-stone-600 dark:text-stone-400">
            {t("campusVisitSlotDesc")}
          </p>
          <div>
            <Label>{t("visitInstructions")}</Label>
            <Textarea
              value={bookingProcedure}
              onChange={(e) => setBookingProcedure(e.target.value)}
              rows={3}
              placeholder={defaultCampusVisitProcedure}
            />
          </div>
        </div>
      )}

      {!isHoliday && !isCampusVisit && (
        <div className="space-y-3 rounded-lg border border-dashed p-4 dark:border-stone-700">
          <p className="text-sm font-medium">{t("schoolWebsite")}</p>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={publicOnWebsite}
              onChange={(e) => setPublicOnWebsite(e.target.checked)}
              className="rounded"
            />
            {t("showOnPublicWebsite")}
          </label>
          {publicOnWebsite && (
            <>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={bookingEnabled}
                  onChange={(e) => setBookingEnabled(e.target.checked)}
                  className="rounded"
                />
                {t("allowOnlineRegistration")}
              </label>
              <div>
                <Label>
                  {bookingEnabled ? t("bookingInstructions") : t("howToAttend")}
                </Label>
                <Textarea
                  value={bookingProcedure}
                  onChange={(e) => setBookingProcedure(e.target.value)}
                  rows={3}
                  placeholder={defaultBookingProcedure}
                />
              </div>
            </>
          )}
        </div>
      )}

      <Button type="submit" disabled={loading}>
        {loading ? tc("saving") : t("addEvent")}
      </Button>
    </form>
  );
}

export function DeleteEventButton({ id }: { id: string }) {
  const t = useTranslations("operations");
  const tc = useTranslations("common");
  const te = useTranslations("errors");
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    if (!confirm(t("deleteEventConfirm"))) return;
    setLoading(true);
    const result = await deleteEvent(id);
    setLoading(false);
    if (result.error) {
      toast.error(typeof result.error === "string" ? result.error : te("failedDeleteEvent"));
      return;
    }
    toast.success(t("eventDeleted"));
    router.refresh();
  }

  return (
    <Button size="sm" variant="ghost" onClick={handleDelete} disabled={loading}>
      {tc("delete")}
    </Button>
  );
}
