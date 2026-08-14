-- Student DELETE is academic-admin (school) or super_admin (platform) only.
-- Other academic portal roles keep INSERT/UPDATE for onboarding and records.

DROP POLICY IF EXISTS "Academic roles can manage students" ON public.students;

CREATE POLICY "Academic roles can insert students"
  ON public.students FOR INSERT
  WITH CHECK (public.is_academic_portal_role());

CREATE POLICY "Academic roles can update students"
  ON public.students FOR UPDATE
  USING (public.is_academic_portal_role())
  WITH CHECK (public.is_academic_portal_role());

CREATE POLICY "Academic admins can delete students"
  ON public.students FOR DELETE
  USING (
    public.is_super_admin()
    OR (
      public.has_role(ARRAY['academic_admin']::public.user_role[])
      AND school_id = public.get_my_school_id()
    )
  );
