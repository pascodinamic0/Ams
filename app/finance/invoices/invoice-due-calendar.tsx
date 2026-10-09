"use client";

import { useMemo, useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { enUS, fr } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { formatMoney } from "@/lib/currency";

export type DueCalendarInvoice = {
  id: string;
  studentName: string;
  studentId: string;
  className: string | null;
  dueDate: string;
  balance: number;
};

function parseDueDate(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function startOfToday() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function dayKey(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function pickInitialFocus(invoices: DueCalendarInvoice[], today: Date) {
  const dates = invoices
    .map((invoice) => parseDueDate(invoice.dueDate))
    .filter((date): date is Date => date !== null);

  const late = dates
    .filter((date) => date.getTime() < today.getTime())
    .sort((a, b) => b.getTime() - a.getTime());
  if (late[0]) return late[0];

  const upcoming = dates
    .filter((date) => date.getTime() >= today.getTime())
    .sort((a, b) => a.getTime() - b.getTime());
  return upcoming[0] ?? today;
}

export function InvoiceDueCalendar({
  invoices,
  currencyCode,
}: {
  invoices: DueCalendarInvoice[];
  currencyCode: string;
}) {
  const t = useTranslations("finance");
  const tc = useTranslations("common");
  const localeCode = useLocale();
  const dateLocale = localeCode === "fr" ? fr : enUS;
  const today = useMemo(() => startOfToday(), []);
  const initialFocus = useMemo(
    () => pickInitialFocus(invoices, today),
    [invoices, today]
  );
  const [month, setMonth] = useState(() => startOfMonth(initialFocus));
  const [selectedKey, setSelectedKey] = useState(() => dayKey(initialFocus));

  const byDay = useMemo(() => {
    const map = new Map<string, DueCalendarInvoice[]>();
    for (const invoice of invoices) {
      const due = parseDueDate(invoice.dueDate);
      if (!due) continue;
      const key = dayKey(due);
      const list = map.get(key);
      if (list) list.push(invoice);
      else map.set(key, [invoice]);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.studentName.localeCompare(b.studentName));
    }
    return map;
  }, [invoices]);

  const days = useMemo(() => {
    const monthStart = startOfMonth(month);
    return eachDayOfInterval({
      start: startOfWeek(monthStart, { locale: dateLocale }),
      end: endOfWeek(endOfMonth(monthStart), { locale: dateLocale }),
    });
  }, [month, dateLocale]);

  const weekdays = useMemo(() => {
    const start = startOfWeek(today, { locale: dateLocale });
    return eachDayOfInterval({
      start,
      end: endOfWeek(start, { locale: dateLocale }),
    });
  }, [today, dateLocale]);

  const selected = parseDueDate(selectedKey) ?? today;
  const selectedInvoices = byDay.get(selectedKey) ?? [];
  const selectedIsLate = selected.getTime() < today.getTime();
  const monthLateCount = days.filter((day) => {
    if (!isSameMonth(day, month)) return false;
    if (day.getTime() >= today.getTime()) return false;
    return (byDay.get(dayKey(day))?.length ?? 0) > 0;
  }).length;

  const money = (value: number) => formatMoney(value, currencyCode);

  return (
    <section className="rounded-xl border border-stone-200 bg-white p-4 dark:border-stone-700 dark:bg-stone-900 print:hidden">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-stone-900 dark:text-white">
            {t("dueCalendarTitle")}
          </h2>
          <p className="mt-1 max-w-xl text-sm text-stone-500">
            {t("dueCalendarSubtitle")}
          </p>
        </div>
        <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
          {monthLateCount > 0
            ? t("dueCalendarMonthLate", { count: monthLateCount })
            : t("dueCalendarMonthClear")}
        </p>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(16rem,0.8fr)]">
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-sm font-medium capitalize">
              {format(month, "MMMM yyyy", { locale: dateLocale })}
            </p>
            <div className="flex gap-1">
              <button
                type="button"
                aria-label={t("dueCalendarPrev")}
                onClick={() => setMonth((current) => addMonths(current, -1))}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label={t("dueCalendarNext")}
                onClick={() => setMonth((current) => addMonths(current, 1))}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-stone-600 hover:bg-stone-100 dark:text-stone-300 dark:hover:bg-stone-800"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="mb-3 flex gap-4 text-xs text-stone-500">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              {t("dueCalendarLate")}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-stone-400" />
              {t("dueCalendarDue")}
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-stone-500">
            {weekdays.map((day) => (
              <div key={dayKey(day)} className="py-1">
                {format(day, "EEE", { locale: dateLocale })}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {days.map((day) => {
              const key = dayKey(day);
              const count = byDay.get(key)?.length ?? 0;
              const late = day.getTime() < today.getTime() && count > 0;
              const due = count > 0 && !late;
              const inMonth = isSameMonth(day, month);
              const isSelected = key === selectedKey;
              const isToday = key === dayKey(today);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelectedKey(key)}
                  aria-pressed={isSelected}
                  className={`flex min-h-12 flex-col items-center justify-center rounded-lg text-sm ${
                    isSelected
                      ? "bg-stone-900 text-white dark:bg-stone-100 dark:text-stone-900"
                      : late
                        ? "bg-amber-50 text-amber-900 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-200"
                        : due
                          ? "bg-stone-100 text-stone-900 hover:bg-stone-200 dark:bg-stone-800 dark:text-stone-100"
                          : "hover:bg-stone-50 dark:hover:bg-stone-800/60"
                  } ${inMonth ? "" : "opacity-40"}`}
                >
                  <span className={isToday && !isSelected ? "font-semibold underline" : ""}>
                    {format(day, "d")}
                  </span>
                  {count > 0 ? (
                    <span
                      className={`mt-0.5 text-[10px] font-medium ${
                        isSelected ? "" : late ? "text-amber-700 dark:text-amber-300" : "text-stone-500"
                      }`}
                    >
                      {count}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-stone-200 p-3 dark:border-stone-700">
          <p className="text-sm font-medium">
            {format(selected, "PPP", { locale: dateLocale })}
          </p>
          {selectedInvoices.length > 0 && selectedIsLate ? (
            <p className="mt-1 text-xs font-medium text-amber-700 dark:text-amber-400">
              {t("dueCalendarLate")}
            </p>
          ) : null}
          {selectedInvoices.length === 0 ? (
            <p className="mt-3 text-sm text-stone-500">{t("dueCalendarNothing")}</p>
          ) : (
            <ul className="mt-3 max-h-80 space-y-2 overflow-y-auto">
              {selectedInvoices.map((invoice) => (
                <li
                  key={invoice.id}
                  className="rounded-md border border-stone-100 px-3 py-2 dark:border-stone-800"
                >
                  <p className="text-sm font-medium">{invoice.studentName}</p>
                  <p className="text-xs text-stone-500">
                    {invoice.studentId || tc("emptyDash")}
                    {invoice.className ? ` · ${invoice.className}` : ""}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-amber-700 dark:text-amber-400">
                    {money(invoice.balance)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
