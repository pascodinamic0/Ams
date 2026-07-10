-- Web Push subscriptions, per-user notification preferences, and class-reminder dedupe

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  p256dh TEXT NOT NULL,
  auth TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT push_subscriptions_endpoint_key UNIQUE (endpoint)
);

CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user
  ON push_subscriptions(user_id);

CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  push_enabled BOOLEAN NOT NULL DEFAULT true,
  class_reminders_enabled BOOLEAN NOT NULL DEFAULT true,
  class_reminder_minutes INTEGER NOT NULL DEFAULT 5
    CHECK (class_reminder_minutes >= 1 AND class_reminder_minutes <= 60),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS class_reminder_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_id UUID NOT NULL REFERENCES timetable_slots(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reminder_date DATE NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT class_reminder_log_unique UNIQUE (slot_id, teacher_id, reminder_date)
);

CREATE INDEX IF NOT EXISTS idx_class_reminder_log_date
  ON class_reminder_log(reminder_date);

ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_reminder_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own push subscriptions"
  ON push_subscriptions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own push subscriptions"
  ON push_subscriptions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own push subscriptions"
  ON push_subscriptions FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own push subscriptions"
  ON push_subscriptions FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "Users can read own notification preferences"
  ON notification_preferences FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own notification preferences"
  ON notification_preferences FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own notification preferences"
  ON notification_preferences FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- class_reminder_log is written by service role / cron only
CREATE POLICY "Users can read own class reminder log"
  ON class_reminder_log FOR SELECT
  USING (teacher_id = auth.uid());
