-- Expand payroll team sync to all school staff (not only admins),
-- and make monthly pay amounts finance-owned for every staff row.

CREATE OR REPLACE FUNCTION public.list_payroll_team_profiles(p_school_id UUID)
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
    RAISE EXCEPTION 'Only finance can list payroll team profiles';
  END IF;

  IF NOT public.has_role(ARRAY['super_admin']::public.user_role[])
    AND public.get_my_school_id() IS DISTINCT FROM p_school_id
  THEN
    RAISE EXCEPTION 'You can only list staff for your school';
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
    AND p.role IS NOT NULL
    AND p.role NOT IN ('student', 'parent', 'super_admin')
  ORDER BY p.name;
END;
$$;

GRANT EXECUTE ON FUNCTION public.list_payroll_team_profiles(UUID) TO authenticated;

-- Keep old function name as a thin wrapper for compatibility.
CREATE OR REPLACE FUNCTION public.list_payroll_admin_profiles(p_school_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  role public.user_role,
  branch_id UUID,
  avatar_url TEXT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  SELECT * FROM public.list_payroll_team_profiles(p_school_id);
$$;

-- Only finance may change monthly_salary for any staff member.
CREATE OR REPLACE FUNCTION public.prevent_ops_admin_payee_salary_override()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
BEGIN
  IF TG_OP = 'UPDATE'
    AND NEW.monthly_salary IS DISTINCT FROM OLD.monthly_salary
    AND NOT public.is_finance_manager_role()
  THEN
    RAISE EXCEPTION 'Only finance can set staff pay amounts';
  END IF;
  RETURN NEW;
END;
$$;
