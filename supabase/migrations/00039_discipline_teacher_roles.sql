-- Discipline desk is limited to teacher-level accounts.
CREATE OR REPLACE FUNCTION public.is_discipline_workspace_role()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(ARRAY[
    'super_admin',
    'teacher',
    'discipline_officer',
    'supervisor'
  ]::public.user_role[]);
$$;
