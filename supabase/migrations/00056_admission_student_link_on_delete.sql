-- Link converted admissions to the student they created.
-- Deleting that student then removes the candidature from the queue.

ALTER TABLE public.admission_applications
  ADD COLUMN IF NOT EXISTS student_id UUID REFERENCES public.students(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX IF NOT EXISTS idx_admission_applications_student
  ON public.admission_applications(student_id)
  WHERE student_id IS NOT NULL;

COMMENT ON COLUMN public.admission_applications.student_id IS
  'Student created when this application was approved. Cascades away if the student is deleted.';

-- Backfill approved applications that still have a matching student.
WITH ranked AS (
  SELECT
    a.id AS application_id,
    s.id AS student_id,
    row_number() OVER (PARTITION BY s.id ORDER BY a.created_at DESC) AS rn_student,
    row_number() OVER (PARTITION BY a.id ORDER BY s.created_at DESC) AS rn_app
  FROM public.admission_applications a
  JOIN public.students s
    ON s.school_id = a.school_id
   AND lower(
     regexp_replace(
       btrim(
         concat_ws(
           ' ',
           NULLIF(btrim(s.first_name), ''),
           NULLIF(btrim(s.middle_name), ''),
           NULLIF(btrim(s.last_name), '')
         )
       ),
       '\s+',
       ' ',
       'g'
     )
   ) = lower(regexp_replace(btrim(a.student_name), '\s+', ' ', 'g'))
  WHERE a.status = 'approved'
    AND a.student_id IS NULL
)
UPDATE public.admission_applications a
SET student_id = ranked.student_id
FROM ranked
WHERE a.id = ranked.application_id
  AND ranked.rn_student = 1
  AND ranked.rn_app = 1;

-- Drop approved applications whose student was already deleted.
DELETE FROM public.admission_applications a
WHERE a.status = 'approved'
  AND a.student_id IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.students s
    WHERE s.school_id = a.school_id
      AND lower(
        regexp_replace(
          btrim(
            concat_ws(
              ' ',
              NULLIF(btrim(s.first_name), ''),
              NULLIF(btrim(s.middle_name), ''),
              NULLIF(btrim(s.last_name), '')
            )
          ),
          '\s+',
          ' ',
          'g'
        )
      ) = lower(regexp_replace(btrim(a.student_name), '\s+', ' ', 'g'))
  );

CREATE OR REPLACE FUNCTION public.delete_admission_applications_for_student()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  normalized_name text;
BEGIN
  normalized_name := lower(
    regexp_replace(
      btrim(
        concat_ws(
          ' ',
          NULLIF(btrim(OLD.first_name), ''),
          NULLIF(btrim(OLD.middle_name), ''),
          NULLIF(btrim(OLD.last_name), '')
        )
      ),
      '\s+',
      ' ',
      'g'
    )
  );

  DELETE FROM public.admission_applications
  WHERE school_id = OLD.school_id
    AND (
      student_id = OLD.id
      OR (
        student_id IS NULL
        AND status = 'approved'
        AND lower(regexp_replace(btrim(student_name), '\s+', ' ', 'g')) = normalized_name
      )
    );

  RETURN OLD;
END;
$$;

DROP TRIGGER IF EXISTS delete_student_admissions ON public.students;
CREATE TRIGGER delete_student_admissions
  BEFORE DELETE ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.delete_admission_applications_for_student();

REVOKE ALL ON FUNCTION public.delete_admission_applications_for_student() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.delete_admission_applications_for_student() FROM anon, authenticated;
