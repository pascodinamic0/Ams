-- Allow multiple subjects per timetable cell and optional custom times
ALTER TABLE timetable_slots
  ADD COLUMN IF NOT EXISTS start_time TIME,
  ADD COLUMN IF NOT EXISTS end_time TIME;

ALTER TABLE timetable_slots
  DROP CONSTRAINT IF EXISTS timetable_slots_class_id_day_period_key;

CREATE INDEX IF NOT EXISTS idx_timetable_slots_class_day_period
  ON timetable_slots(class_id, day, period);

CREATE INDEX IF NOT EXISTS idx_timetable_slots_class_day_time
  ON timetable_slots(class_id, day, start_time);
