-- Expand school-scoped roles and map them onto existing module security groups.

ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'admin_coordinator';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'registrar';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'admissions_officer';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'pedagogy_coordinator';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'principal';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'cashier';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'accountant';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'operations_officer';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'discipline_officer';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'supervisor';
ALTER TYPE public.user_role ADD VALUE IF NOT EXISTS 'pedagogical_council_member';

INSERT INTO public.roles (name, description)
VALUES
  ('admin_coordinator', 'Task-tracking and cross-team school coordination access'),
  ('registrar', 'Student records and secretariat access'),
  ('admissions_officer', 'Admissions and enrollment workflow access'),
  ('pedagogy_coordinator', 'Academic planning and pedagogy coordination access'),
  ('principal', 'School leadership and oversight access'),
  ('cashier', 'Payment intake and receipt access'),
  ('accountant', 'Finance control and accounting access'),
  ('operations_officer', 'School operations and logistics access'),
  ('discipline_officer', 'Student discipline and conduct tracking access'),
  ('supervisor', 'Daily supervision and attendance monitoring access'),
  ('pedagogical_council_member', 'Academic review and council access')
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description;

CREATE OR REPLACE FUNCTION public.is_academic_portal_role()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(ARRAY[
    'super_admin',
    'academic_admin',
    'admin_coordinator',
    'registrar',
    'admissions_officer',
    'pedagogy_coordinator',
    'principal',
    'discipline_officer',
    'supervisor',
    'pedagogical_council_member'
  ]::public.user_role[]);
$$;

CREATE OR REPLACE FUNCTION public.is_finance_manager_role()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(ARRAY[
    'super_admin',
    'finance_officer',
    'accountant'
  ]::public.user_role[]);
$$;

CREATE OR REPLACE FUNCTION public.is_finance_payments_role()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(ARRAY[
    'super_admin',
    'finance_officer',
    'cashier',
    'accountant'
  ]::public.user_role[]);
$$;

CREATE OR REPLACE FUNCTION public.is_operations_portal_role()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(ARRAY[
    'super_admin',
    'operations_manager',
    'operations_officer'
  ]::public.user_role[]);
$$;

CREATE OR REPLACE FUNCTION public.is_messaging_staff()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_staff boolean;
BEGIN
  SET LOCAL row_security = off;
  SELECT public.has_role(ARRAY[
    'super_admin',
    'academic_admin',
    'admin_coordinator',
    'registrar',
    'admissions_officer',
    'pedagogy_coordinator',
    'principal',
    'teacher',
    'discipline_officer',
    'supervisor',
    'pedagogical_council_member'
  ]::public.user_role[])
  INTO is_staff;

  RETURN COALESCE(is_staff, false);
END;
$$;

CREATE OR REPLACE FUNCTION public.is_outreach_admin_role()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(ARRAY[
    'super_admin',
    'academic_admin',
    'admin_coordinator',
    'principal'
  ]::public.user_role[]);
$$;

CREATE OR REPLACE FUNCTION public.is_outreach_read_role()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(ARRAY[
    'super_admin',
    'academic_admin',
    'admin_coordinator',
    'principal',
    'finance_officer',
    'accountant'
  ]::public.user_role[]);
$$;

GRANT EXECUTE ON FUNCTION public.is_academic_portal_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_finance_manager_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_finance_payments_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_operations_portal_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_messaging_staff() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_outreach_admin_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_outreach_read_role() TO authenticated;

-- Academic module
DROP POLICY IF EXISTS "Academic roles can manage sections" ON public.sections;
CREATE POLICY "Academic roles can manage sections"
  ON public.sections FOR ALL
  USING (public.is_academic_portal_role());

DROP POLICY IF EXISTS "Academic roles can manage classes" ON public.classes;
CREATE POLICY "Academic roles can manage classes"
  ON public.classes FOR ALL
  USING (public.is_academic_portal_role());

DROP POLICY IF EXISTS "Academic roles can manage subjects" ON public.subjects;
CREATE POLICY "Academic roles can manage subjects"
  ON public.subjects FOR ALL
  USING (public.is_academic_portal_role());

DROP POLICY IF EXISTS "Academic roles can manage curriculum" ON public.curriculum;
CREATE POLICY "Academic roles can manage curriculum"
  ON public.curriculum FOR ALL
  USING (public.is_academic_portal_role());

DROP POLICY IF EXISTS "Academic roles can manage guardians" ON public.guardians;
CREATE POLICY "Academic roles can manage guardians"
  ON public.guardians FOR ALL
  USING (public.is_academic_portal_role());

DROP POLICY IF EXISTS "Academic roles can manage students" ON public.students;
CREATE POLICY "Academic roles can manage students"
  ON public.students FOR ALL
  USING (public.is_academic_portal_role());

DROP POLICY IF EXISTS "Academic roles can manage guardian_students" ON public.guardian_students;
CREATE POLICY "Academic roles can manage guardian_students"
  ON public.guardian_students FOR ALL
  USING (public.is_academic_portal_role());

DROP POLICY IF EXISTS "Academic roles can manage admissions" ON public.admission_applications;
CREATE POLICY "Academic roles can manage admissions"
  ON public.admission_applications FOR ALL
  USING (public.is_academic_portal_role());

DROP POLICY IF EXISTS "Academic roles can manage timetable" ON public.timetable_slots;
CREATE POLICY "Academic roles can manage timetable"
  ON public.timetable_slots FOR ALL
  USING (public.is_academic_portal_role());

-- Teacher + academic collaboration
DROP POLICY IF EXISTS "Teacher roles can manage assignments" ON public.assignments;
CREATE POLICY "Teacher roles can manage assignments"
  ON public.assignments FOR ALL
  USING (
    teacher_id = auth.uid()
    OR public.is_academic_portal_role()
  );

DROP POLICY IF EXISTS "Users can read attendance in their school" ON public.attendance_records;
CREATE POLICY "Users can read attendance in their school"
  ON public.attendance_records FOR SELECT
  USING (
    student_id IN (SELECT id FROM public.students WHERE auth_user_id = auth.uid())
    OR student_id IN (
      SELECT gs.student_id
      FROM public.guardian_students gs
      JOIN public.guardians g ON g.id = gs.guardian_id
      WHERE g.auth_user_id = auth.uid()
    )
    OR student_id IN (
      SELECT s.id
      FROM public.students s
      JOIN public.classes c ON c.id = s.class_id
      WHERE c.id IN (
        SELECT ts.class_id FROM public.timetable_slots ts WHERE ts.teacher_id = auth.uid()
      )
    )
    OR public.is_academic_portal_role()
  );

DROP POLICY IF EXISTS "Teacher/Academic roles can manage attendance" ON public.attendance_records;
CREATE POLICY "Teacher/Academic roles can manage attendance"
  ON public.attendance_records FOR ALL
  USING (
    public.is_academic_portal_role()
    OR public.has_role(ARRAY['teacher']::public.user_role[])
  );

DROP POLICY IF EXISTS "Users can read grades in their school" ON public.grades;
CREATE POLICY "Users can read grades in their school"
  ON public.grades FOR SELECT
  USING (
    student_id IN (SELECT id FROM public.students WHERE auth_user_id = auth.uid())
    OR student_id IN (
      SELECT gs.student_id
      FROM public.guardian_students gs
      JOIN public.guardians g ON g.id = gs.guardian_id
      WHERE g.auth_user_id = auth.uid()
    )
    OR public.is_academic_portal_role()
    OR public.has_role(ARRAY['teacher']::public.user_role[])
  );

DROP POLICY IF EXISTS "Teacher/Academic roles can manage grades" ON public.grades;
CREATE POLICY "Teacher/Academic roles can manage grades"
  ON public.grades FOR ALL
  USING (
    public.is_academic_portal_role()
    OR public.has_role(ARRAY['teacher']::public.user_role[])
  );

-- Finance module
DROP POLICY IF EXISTS "Finance roles can manage fee_structures" ON public.fee_structures;
CREATE POLICY "Finance roles can manage fee_structures"
  ON public.fee_structures FOR ALL
  USING (public.is_finance_manager_role());

DROP POLICY IF EXISTS "Finance roles can read fee_invoices" ON public.fee_invoices;
CREATE POLICY "Finance roles can read fee_invoices"
  ON public.fee_invoices FOR SELECT
  USING (
    public.is_finance_payments_role()
    OR student_id IN (
      SELECT gs.student_id
      FROM public.guardian_students gs
      JOIN public.guardians g ON g.id = gs.guardian_id
      WHERE g.auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Finance roles can manage fee_invoices" ON public.fee_invoices;
CREATE POLICY "Finance roles can manage fee_invoices"
  ON public.fee_invoices FOR ALL
  USING (public.is_finance_payments_role());

DROP POLICY IF EXISTS "Finance roles can read fee_payments" ON public.fee_payments;
CREATE POLICY "Finance roles can read fee_payments"
  ON public.fee_payments FOR SELECT
  USING (
    public.is_finance_payments_role()
    OR invoice_id IN (
      SELECT fi.id
      FROM public.fee_invoices fi
      JOIN public.guardian_students gs ON gs.student_id = fi.student_id
      JOIN public.guardians g ON g.id = gs.guardian_id
      WHERE g.auth_user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Finance roles can manage fee_payments" ON public.fee_payments;
CREATE POLICY "Finance roles can manage fee_payments"
  ON public.fee_payments FOR ALL
  USING (public.is_finance_payments_role());

DROP POLICY IF EXISTS "Finance roles can manage expenses" ON public.expenses;
CREATE POLICY "Finance roles can manage expenses"
  ON public.expenses FOR ALL
  USING (public.is_finance_manager_role());

DROP POLICY IF EXISTS "Finance/Operations roles can read payroll" ON public.payroll;
CREATE POLICY "Finance/Operations roles can read payroll"
  ON public.payroll FOR SELECT
  USING (
    public.is_finance_manager_role()
    OR public.is_operations_portal_role()
  );

DROP POLICY IF EXISTS "Finance roles can manage payroll" ON public.payroll;
CREATE POLICY "Finance roles can manage payroll"
  ON public.payroll FOR ALL
  USING (public.is_finance_manager_role());

-- Operations module
DROP POLICY IF EXISTS "Operations roles can manage staff" ON public.staff;
CREATE POLICY "Operations roles can manage staff"
  ON public.staff FOR ALL
  USING (public.is_operations_portal_role());

DROP POLICY IF EXISTS "Operations roles can manage books" ON public.books;
CREATE POLICY "Operations roles can manage books"
  ON public.books FOR ALL
  USING (public.is_operations_portal_role());

DROP POLICY IF EXISTS "Operations roles can manage book_issues" ON public.book_issues;
CREATE POLICY "Operations roles can manage book_issues"
  ON public.book_issues FOR ALL
  USING (public.is_operations_portal_role());

DROP POLICY IF EXISTS "Operations roles can manage transport_routes" ON public.transport_routes;
CREATE POLICY "Operations roles can manage transport_routes"
  ON public.transport_routes FOR ALL
  USING (public.is_operations_portal_role());

DROP POLICY IF EXISTS "Operations roles can manage transport_vehicles" ON public.transport_vehicles;
CREATE POLICY "Operations roles can manage transport_vehicles"
  ON public.transport_vehicles FOR ALL
  USING (public.is_operations_portal_role());

DROP POLICY IF EXISTS "Operations roles can manage transport_student_mapping" ON public.transport_student_mapping;
CREATE POLICY "Operations roles can manage transport_student_mapping"
  ON public.transport_student_mapping FOR ALL
  USING (public.is_operations_portal_role());

DROP POLICY IF EXISTS "Operations roles can manage events" ON public.events;
CREATE POLICY "Operations roles can manage events"
  ON public.events FOR ALL
  USING (public.is_operations_portal_role());

-- Outreach
DROP POLICY IF EXISTS "Staff can read campaigns in their school" ON public.campaigns;
CREATE POLICY "Staff can read campaigns in their school"
  ON public.campaigns FOR SELECT
  USING (
    school_id = public.get_my_school_id()
    AND public.is_outreach_read_role()
  );

DROP POLICY IF EXISTS "Admins can manage campaigns" ON public.campaigns;
CREATE POLICY "Admins can manage campaigns"
  ON public.campaigns FOR ALL
  USING (public.is_outreach_admin_role());

DROP POLICY IF EXISTS "Admins can read campaign recipients" ON public.campaign_recipients;
CREATE POLICY "Admins can read campaign recipients"
  ON public.campaign_recipients FOR SELECT
  USING (
    campaign_id IN (
      SELECT id
      FROM public.campaigns
      WHERE school_id = public.get_my_school_id()
    )
    AND public.is_outreach_admin_role()
  );

DROP POLICY IF EXISTS "Finance and admin can read settings" ON public.fee_reminder_settings;
CREATE POLICY "Finance and admin can read settings"
  ON public.fee_reminder_settings FOR SELECT
  USING (
    school_id = public.get_my_school_id()
    AND public.is_finance_manager_role()
  );

DROP POLICY IF EXISTS "Finance and admin can manage settings" ON public.fee_reminder_settings;
CREATE POLICY "Finance and admin can manage settings"
  ON public.fee_reminder_settings FOR ALL
  USING (public.is_finance_manager_role());

-- Public website event registrations
DROP POLICY IF EXISTS "Operations can read event registrations in their school" ON public.event_registrations;
CREATE POLICY "Operations can read event registrations in their school"
  ON public.event_registrations FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.events e
      JOIN public.branches b ON b.id = e.branch_id
      WHERE e.id = event_id
        AND b.school_id = public.get_my_school_id()
    )
    AND (
      public.is_operations_portal_role()
      OR public.is_academic_portal_role()
    )
  );

DROP POLICY IF EXISTS "Operations can manage event registrations in their school" ON public.event_registrations;
CREATE POLICY "Operations can manage event registrations in their school"
  ON public.event_registrations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.events e
      JOIN public.branches b ON b.id = e.branch_id
      WHERE e.id = event_id
        AND b.school_id = public.get_my_school_id()
    )
    AND (
      public.is_operations_portal_role()
      OR public.is_academic_portal_role()
    )
  );
