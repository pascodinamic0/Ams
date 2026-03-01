-- Config tables and triggers: roles, permissions, audit_logs, feature_toggles, student_id generation, audit trigger

-- Config: roles
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Config: permissions
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  resource TEXT NOT NULL,
  action TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(role_id, resource, action)
);

CREATE INDEX idx_permissions_role ON permissions(role_id);

-- RLS: roles, permissions (read-only for most)
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read roles"
  ON roles FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read permissions"
  ON permissions FOR SELECT
  USING (true);

CREATE POLICY "Super admin can manage roles"
  ON roles FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
  );

CREATE POLICY "Super admin can manage permissions"
  ON permissions FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
  );

-- Audit logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- Feature toggles
CREATE TABLE feature_toggles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  enabled BOOLEAN DEFAULT false,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed default roles
INSERT INTO roles (name, description) VALUES
  ('super_admin', 'Full platform access'),
  ('academic_admin', 'Academic module access'),
  ('teacher', 'Teacher module access'),
  ('finance_officer', 'Finance module access'),
  ('operations_manager', 'Operations module access'),
  ('parent', 'Parent portal access'),
  ('student', 'Student portal access'),
  ('analytics', 'Analytics access');

-- RLS: audit_logs (super_admin only for read)
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin can read audit_logs"
  ON audit_logs FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
  );

-- Allow system to insert audit logs (trigger runs as definer)
CREATE POLICY "Allow insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- RLS: feature_toggles
ALTER TABLE feature_toggles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super admin can manage feature_toggles"
  ON feature_toggles FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
  );

-- Student ID generation: {school_code}-{year}-{sequence}
CREATE OR REPLACE FUNCTION public.generate_student_id()
RETURNS TRIGGER AS $$
DECLARE
  school_code TEXT;
  year_part TEXT;
  next_seq INTEGER;
  new_student_id TEXT;
BEGIN
  SELECT code INTO school_code FROM schools WHERE id = NEW.school_id;
  IF school_code IS NULL OR school_code = '' THEN
    school_code := 'SCH';
  END IF;
  
  year_part := to_char(CURRENT_DATE, 'YYYY');
  
  SELECT COALESCE(MAX(
    CASE
      WHEN student_id ~ ('^' || school_code || '-' || year_part || '-[0-9]+$')
      THEN (regexp_replace(substring(student_id from '[0-9]+$'), '^0+', '')::INTEGER)
      ELSE 0
    END
  ), 0) + 1
  INTO next_seq
  FROM students
  WHERE school_id = NEW.school_id AND student_id IS NOT NULL;
  
  new_student_id := school_code || '-' || year_part || '-' || lpad(next_seq::TEXT, 5, '0');
  NEW.student_id := new_student_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS before_student_insert ON students;
CREATE TRIGGER before_student_insert
  BEFORE INSERT ON students
  FOR EACH ROW
  WHEN (NEW.student_id IS NULL)
  EXECUTE FUNCTION public.generate_student_id();

-- Audit log trigger function
CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
  log_user_id UUID;
  log_action TEXT;
  log_entity_type TEXT;
  log_entity_id UUID;
  log_payload JSONB;
BEGIN
  log_entity_type := TG_TABLE_NAME;
  
  IF TG_OP = 'INSERT' THEN
    log_action := 'insert';
    log_entity_id := NEW.id;
    log_payload := to_jsonb(NEW);
  ELSIF TG_OP = 'UPDATE' THEN
    log_action := 'update';
    log_entity_id := NEW.id;
    log_payload := jsonb_build_object('old', to_jsonb(OLD), 'new', to_jsonb(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    log_action := 'delete';
    log_entity_id := OLD.id;
    log_payload := to_jsonb(OLD);
  END IF;
  
  log_user_id := auth.uid();
  
  INSERT INTO audit_logs (user_id, action, entity_type, entity_id, payload)
  VALUES (log_user_id, log_action, log_entity_type, log_entity_id, log_payload);
  
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  ELSE
    RETURN NEW;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail the main transaction if audit fails
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply audit trigger to key tables
CREATE TRIGGER audit_schools AFTER INSERT OR UPDATE OR DELETE ON schools FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
CREATE TRIGGER audit_branches AFTER INSERT OR UPDATE OR DELETE ON branches FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
CREATE TRIGGER audit_profiles AFTER INSERT OR UPDATE OR DELETE ON profiles FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
CREATE TRIGGER audit_students AFTER INSERT OR UPDATE OR DELETE ON students FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
CREATE TRIGGER audit_guardians AFTER INSERT OR UPDATE OR DELETE ON guardians FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
CREATE TRIGGER audit_fee_invoices AFTER INSERT OR UPDATE OR DELETE ON fee_invoices FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
CREATE TRIGGER audit_fee_payments AFTER INSERT OR UPDATE OR DELETE ON fee_payments FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
