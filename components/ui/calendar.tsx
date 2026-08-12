"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { format, isSameMonth } from "date-fns";
import { enUS, fr } from "date-fns/locale";
import { useLocale, useTranslations } from "next-intl";
import "react-day-picker/style.css";

interface CalendarEvent {
  date: Date;
  title: string;
  type?: "event" | "holiday";
}

interface CalendarProps {
  events?: CalendarEvent[];
  onDateClick?: (date: Date) => void;
  onMonthChange?: (date: Date) => void;
}

export function Calendar({
  events = [],
  onDateClick,
  onMonthChange,
}: CalendarProps) {
  const t = useTranslations("common");
  const localeCode = useLocale();
  const dateLocale = localeCode === "fr" ? fr : enUS;
  const [month, setMonth] = useState(new Date());
  const [view, setView] = useState<"calendar" | "list">("calendar");

  const eventsThisMonth = events.filter((e) =>
    isSameMonth(e.date, month)
  );

  return (
    <div className="rounded-lg border border-stone-200 bg-white dark:border-stone-800 dark:bg-stone-950">
      <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3 dark:border-stone-800">
        <h3 className="font-medium">{format(month, "MMMM yyyy", { locale: dateLocale })}</h3>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setView("calendar")}
            className={`rounded px-3 py-1 text-sm ${view === "calendar" ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900" : ""}`}
          >
            {t("calendarView")}
          </button>
          <button
            type="button"
            onClick={() => setView("list")}
            className={`rounded px-3 py-1 text-sm ${view === "list" ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900" : ""}`}
          >
            {t("listView")}
          </button>
        </div>
      </div>
      {view === "calendar" ? (
        <DayPicker
          mode="single"
          month={month}
          locale={dateLocale}
          onMonthChange={(d) => {
            setMonth(d);
            onMonthChange?.(d);
          }}
          onSelect={(d) => d && onDateClick?.(d)}
          className="p-4"
        />
      ) : (
        <div className="divide-y divide-stone-200 p-4 dark:divide-stone-800">
          {eventsThisMonth.length === 0 ? (
            <p className="py-4 text-sm text-stone-500">{t("noEventsThisMonth")}</p>
          ) : (
            eventsThisMonth.map((evt, i) => (
              <div key={i} className="py-3">
                <span className="text-sm font-medium">{evt.title}</span>
                <span className="ml-2 text-xs text-stone-500">
                  {format(evt.date, "PPP", { locale: dateLocale })}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
