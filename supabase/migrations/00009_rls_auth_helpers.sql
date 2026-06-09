-- Fix infinite recursion in profiles RLS policies.
-- Policies that subquery profiles trigger RLS again on the same table.
-- SECURITY DEFINER helpers read profiles without re-entering RLS.

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS user_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_my_school_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT school_id FROM public.profiles WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.has_role(allowed_roles user_role[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = ANY(allowed_roles)
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_school_id() TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(user_role[]) TO authenticated;

DROP POLICY IF EXISTS "Super admin can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admin can update all profiles" ON profiles;

CREATE POLICY "Super admin can read all profiles"
  ON profiles FOR SELECT
  USING (public.is_super_admin());

CREATE POLICY "Super admin can manage all profiles"
  ON profiles FOR ALL
  USING (public.is_super_admin());
