-- Owner-only feature switches, in-app release inbox, notification deep links.

ALTER TABLE notifications ADD COLUMN IF NOT EXISTS url TEXT;

CREATE TABLE IF NOT EXISTS platform_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO platform_settings (key, value)
VALUES ('owner_email', 'pascodinamic00@gmail.com')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_platform_owner()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.id = auth.uid()
      AND p.role = 'super_admin'
  )
  AND lower(coalesce(auth.jwt() ->> 'email', '')) = lower(
    coalesce(
      (SELECT value FROM public.platform_settings WHERE key = 'owner_email'),
      ''
    )
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_platform_owner() TO authenticated;

DROP POLICY IF EXISTS "Super admin can manage feature_toggles" ON feature_toggles;
DROP POLICY IF EXISTS "Read feature toggles" ON feature_toggles;
DROP POLICY IF EXISTS "Platform owner inserts feature toggles" ON feature_toggles;
DROP POLICY IF EXISTS "Platform owner updates feature toggles" ON feature_toggles;
DROP POLICY IF EXISTS "Platform owner deletes feature toggles" ON feature_toggles;

CREATE POLICY "Read feature toggles"
  ON feature_toggles FOR SELECT
  TO authenticated
  USING (
    public.is_super_admin()
    OR (
      public.get_my_school_id() IS NOT NULL
      AND key LIKE 'school:' || public.get_my_school_id()::text || ':%'
    )
  );

CREATE POLICY "Platform owner inserts feature toggles"
  ON feature_toggles FOR INSERT
  TO authenticated
  WITH CHECK (public.is_platform_owner());

CREATE POLICY "Platform owner updates feature toggles"
  ON feature_toggles FOR UPDATE
  TO authenticated
  USING (public.is_platform_owner())
  WITH CHECK (public.is_platform_owner());

CREATE POLICY "Platform owner deletes feature toggles"
  ON feature_toggles FOR DELETE
  TO authenticated
  USING (public.is_platform_owner());

CREATE TABLE IF NOT EXISTS product_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pr_number INTEGER NOT NULL UNIQUE,
  feature_name TEXT NOT NULL,
  gap_closed TEXT,
  feature_key TEXT,
  pr_url TEXT NOT NULL,
  preview_url TEXT,
  video_url TEXT,
  steps JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'awaiting'
    CHECK (status IN ('awaiting', 'approved', 'dismissed')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  decided_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_product_releases_status_created
  ON product_releases (status, created_at DESC);

ALTER TABLE product_releases ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super admin can read product releases" ON product_releases;

CREATE POLICY "Super admin can read product releases"
  ON product_releases FOR SELECT
  TO authenticated
  USING (public.is_super_admin());
