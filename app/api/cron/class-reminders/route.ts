/**
 * Class reminder cron ? POST /api/cron/class-reminders
 *
 * Intended to run every few minutes (Hobby Vercel only allows daily crons,
 * so call this from an external scheduler, e.g. cron-job.org).
 * Finds timetable slots starting soon and sends in-app + Web Push alerts
 * to teachers (alarm-style).
 *
 * Security: Authorization: Bearer <CRON_SECRET>
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createNotification } from "@/lib/services/notifications";
import { DEFAULT_PERIOD_TIMES } from "@/lib/timetable/shared";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** School-local clock for DRC (Kinshasa / Lubumbashi share UTC+1 or +2 seasonally; use Kinshasa). */
const SCHOOL_TZ = process.env.CLASS_REMINDER_TIMEZONE?.trim() || "Africa/Kinshasa";

function serviceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

function partsInTimeZone(date: Date, timeZone: string) {
  const fmt = new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const map: Record<string, string> = {};
  for (const part of fmt.formatToParts(date)) {
    if (part.type !== "literal") map[part.type] = part.value;
  }
  const weekdayMap: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return {
    dateStr: `${map.year}-${map.month}-${map.day}`,
    day: weekdayMap[map.weekday] ?? date.getDay(),
    minutes: Number(map.hour) * 60 + Number(map.minute),
  };
}

function parseTimeToMinutes(value: string | null | undefined): number | null {
  if (!value) return null;
  const [h, m] = value.slice(0, 5).split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

function resolveStartMinutes(period: number, startTime: string | null): number | null {
  const fromSlot = parseTimeToMinutes(startTime);
  if (fromSlot !== null) return fromSlot;
  const fallback = DEFAULT_PERIOD_TIMES[period]?.start;
  return parseTimeToMinutes(fallback ?? null);
}

export async function POST(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("CRON_SECRET not configured");
    return NextResponse.json({ error: "Cron not configured" }, { status: 500 });
  }
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
  }

  const supabase = serviceClient();
  const now = new Date();
  const { dateStr, day, minutes: nowMinutes } = partsInTimeZone(now, SCHOOL_TZ);

  const summary = {
    timezone: SCHOOL_TZ,
    date: dateStr,
    day,
    slots_checked: 0,
    reminders_sent: 0,
    skipped_already_sent: 0,
    skipped_prefs: 0,
    errors: 0,
  };

  // Weekend  no MonFri timetable
  if (day === 0 || day === 6) {
    return NextResponse.json({ message: "Weekend  no class reminders", summary });
  }

  const { data: slots, error: slotsErr } = await supabase
    .from("timetable_slots")
    .select(
      "id, class_id, day, period, teacher_id, start_time, subjects(name), classes(name)"
    )
    .eq("day", day)
    .not("teacher_id", "is", null);

  if (slotsErr) {
    console.error("class-reminders slots error:", slotsErr.message);
    return NextResponse.json({ error: slotsErr.message, summary }, { status: 500 });
  }

  if (!slots?.length) {
    return NextResponse.json({ message: "No slots today", summary });
  }

  const teacherIds = [
    ...new Set(
      slots
        .map((s) => s.teacher_id as string | null)
        .filter((id): id is string => Boolean(id))
    ),
  ];

  const { data: prefsRows } = await supabase
    .from("notification_preferences")
    .select("user_id, push_enabled, class_reminders_enabled, class_reminder_minutes")
    .in("user_id", teacherIds);

  const prefsByUser = new Map(
    (prefsRows ?? []).map((p) => [
      p.user_id as string,
      {
        push_enabled: p.push_enabled !== false,
        class_reminders_enabled: p.class_reminders_enabled !== false,
        class_reminder_minutes: Number(p.class_reminder_minutes) || 5,
      },
    ])
  );

  for (const slot of slots) {
    summary.slots_checked += 1;
    const teacherId = slot.teacher_id as string | null;
    if (!teacherId) continue;

    const prefs = prefsByUser.get(teacherId) ?? {
      push_enabled: true,
      class_reminders_enabled: true,
      class_reminder_minutes: 5,
    };

    if (!prefs.class_reminders_enabled || !prefs.push_enabled) {
      summary.skipped_prefs += 1;
      continue;
    }

    const startMinutes = resolveStartMinutes(
      Number(slot.period),
      slot.start_time as string | null
    );
    if (startMinutes === null) continue;

    const lead = prefs.class_reminder_minutes;
    const minutesUntil = startMinutes - nowMinutes;

    // Fire when within the lead window (inclusive), and not after class started
    if (minutesUntil < 0 || minutesUntil > lead) continue;

    const { data: existing } = await supabase
      .from("class_reminder_log")
      .select("id")
      .eq("slot_id", slot.id)
      .eq("teacher_id", teacherId)
      .eq("reminder_date", dateStr)
      .maybeSingle();

    if (existing) {
      summary.skipped_already_sent += 1;
      continue;
    }

    const subject =
      (slot.subjects as { name?: string } | null)?.name ?? "Class";
    const className =
      (slot.classes as { name?: string } | null)?.name ?? "your class";
    const startLabel =
      (slot.start_time as string | null)?.slice(0, 5) ??
      DEFAULT_PERIOD_TIMES[Number(slot.period)]?.start ??
      "";

    const title =
      minutesUntil <= 0
        ? `${subject} is starting now`
        : `${subject} in ${minutesUntil} min`;
    const body = `${className}  Period ${slot.period}${startLabel ? `  ${startLabel}` : ""}`;

    const { error: notifError } = await createNotification({
      userId: teacherId,
      title,
      body,
      url: "/teacher/attendance",
      tag: `class-${slot.id}-${dateStr}`,
      requireInteraction: true,
    });

    if (notifError) {
      summary.errors += 1;
      console.error("class-reminders notify error:", notifError);
      continue;
    }

    const { error: logError } = await supabase.from("class_reminder_log").insert({
      slot_id: slot.id,
      teacher_id: teacherId,
      reminder_date: dateStr,
    });

    if (logError) {
      // Unique violation = already sent by a concurrent run
      if (logError.code !== "23505") {
        summary.errors += 1;
        console.error("class-reminders log error:", logError.message);
      } else {
        summary.skipped_already_sent += 1;
      }
      continue;
    }

    summary.reminders_sent += 1;
  }

  return NextResponse.json({ ok: true, summary });
}

/** Vercel Cron invokes GET; external schedulers may use POST. */
export async function GET(req: NextRequest) {
  return POST(req);
}
