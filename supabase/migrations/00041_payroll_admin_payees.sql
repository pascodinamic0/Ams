-- Finance-owned admin payees on payroll: link school admin profiles to staff,
-- and allow finance managers to set their monthly pay amounts.

ALTER TABLE public.staff
  ADD COLUMN IF NOT EXISTS is_admin_payee BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS idx_staff_school_profile
  ON public.staff (school_id, profile_id)
  WHERE profile_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_staff_admin_payee
  ON public.staff (school_id)
  WHERE is_admin_payee = true;

-- Finance managers can create/update admin payee staff rows for their school,
-- and update monthly salary for any staff in their school.
DROP POLICY IF EXISTS "Finance roles can manage payroll staff amounts" ON public.staff;
CREATE POLICY "Finance roles can manage payroll staff amounts"
  ON public.staff FOR ALL
  USING (
    public.is_finance_manager_role()
    AND (
      school_id = public.get_my_school_id()
      OR public.has_role(ARRAY['super_admin']::public.user_role[])
    )
  )
  WITH CHECK (
    public.is_finance_manager_role()
    AND (
      school_id = public.get_my_school_id()
      OR public.has_role(ARRAY['super_admin']::public.user_role[])
    )
  );

-- Keep operations from changing pay amounts on admin payees synced from profiles.
CREATE OR REPLACE FUNCTION public.prevent_ops_admin_payee_salary_override()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
BEGIN
  IF TG_OP = 'UPDATE'
    AND OLD.is_admin_payee = true
    AND NEW.monthly_salary IS DISTINCT FROM OLD.monthly_salary
    AND NOT public.is_finance_manager_role()
  THEN
    RAISE EXCEPTION 'Only finance can set pay amounts for school admins';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS staff_protect_admin_payee_salary ON public.staff;
CREATE TRIGGER staff_protect_admin_payee_salary
  BEFORE UPDATE ON public.staff
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_ops_admin_payee_salary_override();

-- Finance can list school admin profiles for payroll (profiles RLS otherwise blocks this).
CREATE OR REPLACE FUNCTION public.list_payroll_admin_profiles(p_school_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  role public.user_role,
  branch_id UUID,
  avatar_url TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
BEGIN
  IF NOT public.is_finance_manager_role() THEN
    RAISE EXCEPTION 'Only finance can list payroll admin profiles';
  END IF;

  IF NOT public.has_role(ARRAY['super_admin']::public.user_role[])
    AND public.get_my_school_id() IS DISTINCT FROM p_school_id
  THEN
    RAISE EXCEPTION 'You can only list admins for your school';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.name,
    p.role,
    p.branch_id,
    p.avatar_url
  FROM public.profiles p
  WHERE p.school_id = p_school_id
    AND p.role IN (
      'academic_admin',
      'admin_coordinator',
      'registrar',
      'admissions_officer',
      'pedagogy_coordinator',
      'principal',
      'finance_officer',
      'accountant',
      'operations_manager',
      'operations_officer',
      'discipline_officer',
      'supervisor',
      'pedagogical_council_member'
    )
  ORDER BY p.name;
END;
$$;

GRANT EXECUTE ON FUNCTION public.list_payroll_admin_profiles(UUID) TO authenticated;
