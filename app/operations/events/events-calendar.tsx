"use client";

import { Calendar } from "@/components/ui/calendar";

interface EventsCalendarProps {
  events: Array<{
    id: string;
    title: string;
    date: string;
    type: "event" | "holiday";
  }>;
}

export function EventsCalendar({ events }: EventsCalendarProps) {
  const calendarEvents = events.map((e) => ({
    date: new Date(`${e.date}T12:00:00`),
    title: e.title,
    type: e.type,
  }));

  return <Calendar events={calendarEvents} />;
}
