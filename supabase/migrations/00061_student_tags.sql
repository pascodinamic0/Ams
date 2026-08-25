-- Enrollment follow-up tags on students (e.g. follow_up, incomplete_docs, fee_hold)

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';

CREATE INDEX IF NOT EXISTS idx_students_tags ON students USING GIN (tags);

COMMENT ON COLUMN students.tags IS
  'Enrollment labels such as follow_up, incomplete_docs, fee_hold for admin tracking.';
