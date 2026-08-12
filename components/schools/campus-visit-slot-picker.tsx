"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { bookCampusVisitSlot } from "@/lib/actions/event-registrations";
import type { PublicSchoolEvent } from "@/lib/db/public-events";
import { toast } from "@/lib/toast";

function formatSlotDate(date: string, time: string | null, locale: string, atTime: (values: { date: string; time: string }) => string) {
  const formatted = new Date(`${date}T00:00:00`).toLocaleDateString(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  if (!time) return formatted;
  return atTime({ date: formatted, time: time.slice(0, 5) });
}

export function CampusVisitSlotPicker({
  slots,
  admissionApplicationId,
  guardianName,
  guardianEmail,
  guardianPhone,
  studentName,
  schoolName,
  schoolAddress,
  slug,
  primary,
}: {
  slots: PublicSchoolEvent[];
  admissionApplicationId: string;
  guardianName: string;
  guardianEmail: string;
  guardianPhone: string;
  studentName: string;
  schoolName: string;
  schoolAddress: string | null;
  slug: string;
  primary: string;
}) {
  const t = useTranslations("schools.visit");
  const te = useTranslations("schools.enrollment");
  const tf = useTranslations("schools.forms");
  const locale = useLocale();
  const [selectedId, setSelectedId] = useState<string | null>(slots[0]?.id ?? null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState<{
    eventTitle: string;
    eventDate: string;
    registrationId: string;
  } | null>(null);

  const selected = slots.find((s) => s.id === selectedId);

  async function handleBook() {
    if (!selected) return;
    setLoading(true);
    const result = await bookCampusVisitSlot({
      event_id: selected.id,
      admission_application_id: admissionApplicationId,
      guardian_email: guardianEmail,
      registrant_name: guardianName,
      email: guardianEmail,
      phone: guardianPhone || undefined,
      party_size: 1,
      notes: notes || undefined,
    });
    setLoading(false);

    if (result.error) {
      const message =
        typeof result.error === "string" ? result.error : t("couldNotBookSlot");
      toast.error(message);
      return;
    }

    setBooked({
      eventTitle: result.data?.eventTitle ?? selected.title,
      eventDate: selected.date,
      registrationId: result.data?.id ?? "",
    });
    toast.success(t("campusVisitBooked"));
  }

  if (booked) {
    return (
      <div className="mx-auto max-w-xl">
        <h1 className="text-2xl font-bold">{t("youreAllSet")}</h1>
        <p className="mt-2 text-stone-600 dark:text-stone-400">
          {t("scheduledAt", { schoolName })}
        </p>
        <div className="mt-6 space-y-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-950/40">
          <p className="text-sm">
            {t("applicationReference")}{" "}
            <span className="font-mono font-semibold">{admissionApplicationId}</span>
          </p>
          <p className="text-sm">
            <span className="font-medium">{t("campusVisit")}</span> {booked.eventTitle}
          </p>
          <p className="text-sm">
            <span className="font-medium">{t("when")}</span>{" "}
            {formatSlotDate(booked.eventDate, selected?.start_time ?? null, locale, (v) => t("atTime", v))}
          </p>
          {selected?.location && (
            <p className="text-sm">
              <span className="font-medium">{t("where")}</span> {selected.location}
            </p>
          )}
          {schoolAddress && (
            <p className="text-sm">
              <span className="font-medium">{t("schoolAddress")}</span> {schoolAddress}
            </p>
          )}
          {selected?.booking_procedure && (
            <p className="text-sm leading-relaxed text-stone-700 dark:text-stone-300">
              {selected.booking_procedure}
            </p>
          )}
          <p className="text-sm text-stone-600 dark:text-stone-400">
            {t("bringId", { studentName })}
          </p>
        </div>
        <Link
          href={`/schools/${slug}`}
          className="mt-6 inline-block text-sm font-medium hover:underline"
          style={{ color: primary }}
        >
          {te("backToSchoolWebsite")}
        </Link>
      </div>
    );
  }

  if (slots.length === 0) {
    return null;
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-bold">{t("bookYourCampusVisit")}</h1>
      <p className="mt-2 text-stone-600 dark:text-stone-400">
        {t("chooseTime", { schoolName, studentName })}
      </p>
      <p className="mt-1 text-sm text-stone-500">
        {t("applicationReference")} <span className="font-mono">{admissionApplicationId}</span>
      </p>

      <div className="mt-6 space-y-3">
        {slots.map((slot) => (
          <label
            key={slot.id}
            className={`flex cursor-pointer gap-4 rounded-xl border p-4 transition-colors ${
              selectedId === slot.id
                ? "border-primary-400 bg-primary-light dark:border-primary-700 dark:bg-primary-light/30"
                : "border-stone-200 hover:border-stone-300 dark:border-stone-800"
            }`}
          >
            <input
              type="radio"
              name="campus_slot"
              value={slot.id}
              checked={selectedId === slot.id}
              onChange={() => setSelectedId(slot.id)}
              className="mt-1"
            />
            <div className="flex-1">
              <p className="font-medium">{slot.title}</p>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
                {formatSlotDate(slot.date, slot.start_time, locale, (v) => t("atTime", v))}
              </p>
              {slot.location && (
                <p className="mt-1 text-sm text-stone-500">{slot.location}</p>
              )}
              {slot.description && (
                <p className="mt-2 text-sm text-stone-500">{slot.description}</p>
              )}
            </div>
          </label>
        ))}
      </div>

      <div className="mt-6">
        <Label>{t("notesForAdmissions")}</Label>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          placeholder={tf("accessibilityNotes")}
          className="mt-1"
        />
      </div>

      <div className="mt-8 flex flex-wrap justify-between gap-3">
        <Link
          href={`/schools/${slug}`}
          className="text-sm text-stone-500 hover:underline"
        >
          {t("skipForNow")}
        </Link>
        <Button
          type="button"
          onClick={handleBook}
          disabled={loading || !selected}
          style={{ backgroundColor: primary }}
        >
          {loading ? t("booking") : t("confirmCampusVisit")}
        </Button>
      </div>
    </div>
  );
}
