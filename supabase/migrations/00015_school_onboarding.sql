-- School onboarding: approval workflow, owner tracking, team management policies

CREATE TYPE school_status AS ENUM ('pending', 'approved', 'suspended');

ALTER TABLE schools
  ADD COLUMN IF NOT EXISTS status school_status NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_schools_status ON schools(status);
CREATE INDEX IF NOT EXISTS idx_schools_owner ON schools(owner_id);

-- Existing schools created before this migration are treated as approved
UPDATE schools SET status = 'approved' WHERE status = 'pending' AND owner_id IS NULL;

CREATE OR REPLACE FUNCTION public.get_my_school_status()
RETURNS school_status
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT s.status
  FROM public.schools s
  INNER JOIN public.profiles p ON p.school_id = s.id
  WHERE p.id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.is_my_school_approved()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(public.get_my_school_status() = 'approved', false);
$$;

CREATE OR REPLACE FUNCTION public.is_school_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(ARRAY['academic_admin']::user_role[]);
$$;

GRANT EXECUTE ON FUNCTION public.get_my_school_status() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_my_school_approved() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_school_admin() TO authenticated;

-- Public directory: only approved schools with public site enabled
DROP POLICY IF EXISTS "Public can read enabled schools" ON schools;
CREATE POLICY "Public can read enabled schools"
  ON schools FOR SELECT
  USING (public_site_enabled = true AND status = 'approved');

-- School admins can read profiles in their school (team management)
DROP POLICY IF EXISTS "School admins can read school profiles" ON profiles;
CREATE POLICY "School admins can read school profiles"
  ON profiles FOR SELECT
  USING (
    public.is_school_admin()
    AND school_id IS NOT NULL
    AND school_id = public.get_my_school_id()
  );
