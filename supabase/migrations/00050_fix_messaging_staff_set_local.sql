-- SET LOCAL is not allowed inside STABLE functions (PostgreSQL).
-- Use function-level SET row_security = off instead (same pattern as 00034).

CREATE OR REPLACE FUNCTION public.is_messaging_staff()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  is_staff boolean;
BEGIN
  SELECT public.has_role(ARRAY[
    'super_admin',
    'academic_admin',
    'admin_coordinator',
    'registrar',
    'admissions_officer',
    'pedagogy_coordinator',
    'principal',
    'teacher',
    'finance_officer',
    'cashier',
    'accountant',
    'operations_manager',
    'operations_officer',
    'discipline_officer',
    'supervisor',
    'pedagogical_council_member',
    'analytics'
  ]::public.user_role[])
  INTO is_staff;

  RETURN COALESCE(is_staff, false);
END;
$$;

CREATE OR REPLACE FUNCTION public.list_messaging_staff_contacts()
RETURNS TABLE (
  profile_id uuid,
  name text,
  role public.user_role
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  my_school uuid;
BEGIN
  IF NOT (
    public.is_messaging_staff()
    OR public.has_role(ARRAY['parent']::public.user_role[])
  ) THEN
    RETURN;
  END IF;

  my_school := public.get_my_school_id();
  IF my_school IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    p.id AS profile_id,
    COALESCE(p.name, 'Staff')::text AS name,
    p.role
  FROM public.profiles p
  WHERE p.school_id = my_school
    AND p.id <> auth.uid()
    AND p.role = ANY (ARRAY[
      'super_admin',
      'academic_admin',
      'admin_coordinator',
      'registrar',
      'admissions_officer',
      'pedagogy_coordinator',
      'principal',
      'teacher',
      'finance_officer',
      'cashier',
      'accountant',
      'operations_manager',
      'operations_officer',
      'discipline_officer',
      'supervisor',
      'pedagogical_council_member',
      'analytics'
    ]::public.user_role[])
  ORDER BY COALESCE(p.name, 'Staff');
END;
$$;
