-- Who may collect a student from school: guardian link flag + non-guardian pickup persons.
-- Also capture the same intent on admission applications before conversion.

ALTER TABLE public.guardian_students
  ADD COLUMN IF NOT EXISTS can_pickup BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN public.guardian_students.can_pickup IS
  'Whether this linked guardian is authorized to collect the student from school';

CREATE TABLE IF NOT EXISTS public.student_pickup_persons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  relationship TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_student_pickup_persons_student
  ON public.student_pickup_persons(student_id);
CREATE INDEX IF NOT EXISTS idx_student_pickup_persons_school
  ON public.student_pickup_persons(school_id);

COMMENT ON TABLE public.student_pickup_persons IS
  'Authorized non-guardian people who may collect a student from school';
COMMENT ON COLUMN public.student_pickup_persons.relationship IS
  'Relationship to the child (e.g. uncle, aunt, driver, nanny, sibling)';

ALTER TABLE public.admission_applications
  ADD COLUMN IF NOT EXISTS guardian_can_pickup BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS pickup_persons JSONB NOT NULL DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.admission_applications.guardian_can_pickup IS
  'Whether the listed guardian is authorized to pick up the child from school';
COMMENT ON COLUMN public.admission_applications.pickup_persons IS
  'JSON array of {full_name, phone, relationship, notes?} for additional authorized collectors';

ALTER TABLE public.student_pickup_persons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read student_pickup_persons in their school"
  ON public.student_pickup_persons;
CREATE POLICY "Users can read student_pickup_persons in their school"
  ON public.student_pickup_persons FOR SELECT
  USING (
    school_id = public.get_my_school_id()
    OR public.is_super_admin()
    OR public.is_linked_guardian_of_student(student_id)
  );

DROP POLICY IF EXISTS "Academic roles can manage student_pickup_persons"
  ON public.student_pickup_persons;
CREATE POLICY "Academic roles can manage student_pickup_persons"
  ON public.student_pickup_persons FOR ALL
  USING (
    public.is_super_admin()
    OR (
      public.is_academic_portal_role()
      AND school_id = public.get_my_school_id()
    )
  )
  WITH CHECK (
    public.is_super_admin()
    OR (
      public.is_academic_portal_role()
      AND school_id = public.get_my_school_id()
    )
  );
