-- Partial index for the finance enrollment queue.
-- Runs after 00065 commits so student_status 'pending' is usable.

CREATE INDEX IF NOT EXISTS idx_students_pending_school
  ON public.students (school_id, created_at DESC)
  WHERE status = 'pending';
