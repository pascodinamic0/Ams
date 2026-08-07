-- Fix infinite recursion between students <-> guardian_students RLS policies.
-- students SELECT queried guardian_students; guardian_students manage queried
-- students. Break the cycle with SECURITY DEFINER helpers (row_security off),
-- matching the conversation_participants fix pattern.

CREATE OR REPLACE FUNCTION public.is_linked_guardian_of_student(p_student_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.guardian_students gs
    JOIN public.guardians g ON g.id = gs.guardian_id
    WHERE gs.student_id = p_student_id
      AND g.auth_user_id = auth.uid()
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.student_in_my_school(p_student_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.students s
    WHERE s.id = p_student_id
      AND s.school_id = public.get_my_school_id()
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_linked_guardian_of_student(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.student_in_my_school(uuid) TO authenticated;

DROP POLICY IF EXISTS "Users can read students in their school" ON public.students;
CREATE POLICY "Users can read students in their school"
  ON public.students FOR SELECT
  USING (
    school_id = public.get_my_school_id()
    OR public.is_super_admin()
    OR auth_user_id = auth.uid()
    OR public.is_linked_guardian_of_student(id)
  );

DROP POLICY IF EXISTS "Academic roles can manage guardian_students" ON public.guardian_students;
CREATE POLICY "Academic roles can manage guardian_students"
  ON public.guardian_students FOR ALL
  USING (
    public.is_super_admin()
    OR (
      public.is_academic_portal_role()
      AND public.student_in_my_school(student_id)
    )
  )
  WITH CHECK (
    public.is_super_admin()
    OR (
      public.is_academic_portal_role()
      AND public.student_in_my_school(student_id)
    )
  );
