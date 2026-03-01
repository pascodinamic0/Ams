-- Core tables: schools, branches, profiles
-- Profiles extends auth.users

-- Enum for website template
CREATE TYPE website_template AS ENUM ('modern', 'classic', 'minimal');

-- Enum for user role (matches sidebar ROLE_NAV)
CREATE TYPE user_role AS ENUM (
  'super_admin',
  'academic_admin',
  'teacher',
  'finance_officer',
  'operations_manager',
  'parent',
  'student',
  'analytics'
);

-- Schools
CREATE TABLE schools (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  cover_image_url TEXT,
  about TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  theme_primary_color TEXT DEFAULT '#3b82f6',
  theme_secondary_color TEXT DEFAULT '#1d4ed8',
  website_template website_template DEFAULT 'modern',
  custom_domain TEXT,
  public_site_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Branches
CREATE TYPE branch_status AS ENUM ('active', 'inactive');

CREATE TABLE branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  status branch_status DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_branches_school ON branches(school_id);

-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  avatar_url TEXT,
  role user_role DEFAULT 'student',
  school_id UUID REFERENCES schools(id) ON DELETE SET NULL,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_profiles_school ON profiles(school_id);
CREATE INDEX idx_profiles_branch ON profiles(branch_id);
CREATE INDEX idx_profiles_role ON profiles(role);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'student')
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(EXCLUDED.name, profiles.name),
    role = COALESCE((NEW.raw_user_meta_data->>'role')::user_role, profiles.role),
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS: profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Super admin can read all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
  );

CREATE POLICY "Super admin can update all profiles"
  ON profiles FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
  );

-- RLS: schools
ALTER TABLE schools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin full access to schools"
  ON schools FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
  );

CREATE POLICY "School-scoped users can read their school"
  ON schools FOR SELECT
  USING (
    id IN (SELECT school_id FROM profiles WHERE id = auth.uid() AND school_id IS NOT NULL)
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
  );

-- Public read for schools directory (public_site_enabled = true)
CREATE POLICY "Public can read enabled schools"
  ON schools FOR SELECT
  USING (public_site_enabled = true);

-- RLS: branches
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin full access to branches"
  ON branches FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
  );

CREATE POLICY "Users can read branches of their school"
  ON branches FOR SELECT
  USING (
    school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid() AND school_id IS NOT NULL)
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
  );
