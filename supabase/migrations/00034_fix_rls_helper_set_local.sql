-- SET LOCAL is not allowed inside STABLE functions (PostgreSQL).
-- Use function-level SET row_security = off instead, so RLS helpers
-- remain STABLE and safe to call from policies during INSERT ... RETURNING.

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
