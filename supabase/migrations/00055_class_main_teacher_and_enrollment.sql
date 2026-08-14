-- Main teacher on classes, class_id on admission applications, public class listing for enroll page

ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS main_teacher_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_classes_main_teacher ON public.classes(main_teacher_id);

ALTER TABLE public.admission_applications
  ADD COLUMN IF NOT EXISTS class_id UUID REFERENCES public.classes(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_admission_applications_class ON public.admission_applications(class_id);

-- Public school websites can list classes (names + capacity) for enrollment
CREATE POLICY "Public can read classes of public schools"
  ON public.classes FOR SELECT
  USING (
    branch_id IN (
      SELECT b.id
      FROM public.branches b
      JOIN public.schools s ON s.id = b.school_id
      WHERE s.public_site_enabled = true
        AND s.status = 'approved'
    )
  );
