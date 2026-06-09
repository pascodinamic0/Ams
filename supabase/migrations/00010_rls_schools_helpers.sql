-- Use SECURITY DEFINER helpers in schools/branches policies to avoid
-- re-entering profiles RLS when checking super-admin or school scope.

DROP POLICY IF EXISTS "Super admin full access to schools" ON schools;
DROP POLICY IF EXISTS "School-scoped users can read their school" ON schools;

CREATE POLICY "Super admin full access to schools"
  ON schools FOR ALL
  USING (public.is_super_admin());

CREATE POLICY "School-scoped users can read their school"
  ON schools FOR SELECT
  USING (
    id = public.get_my_school_id()
    OR public.is_super_admin()
  );

DROP POLICY IF EXISTS "Super admin full access to branches" ON branches;
DROP POLICY IF EXISTS "Users can read branches of their school" ON branches;

CREATE POLICY "Super admin full access to branches"
  ON branches FOR ALL
  USING (public.is_super_admin());

CREATE POLICY "Users can read branches of their school"
  ON branches FOR SELECT
  USING (
    school_id = public.get_my_school_id()
    OR public.is_super_admin()
  );
