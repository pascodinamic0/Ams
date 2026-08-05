-- Scope broad "manage" RLS policies to the caller's school so academic/finance/
-- operations roles cannot mutate another school's rows by guessing UUIDs.

-- Academic: tables with school_id
DROP POLICY IF EXISTS "Academic roles can manage guardians" ON public.guardians;
CREATE POLICY "Academic roles can manage guardians"
  ON public.guardians FOR ALL
  USING (
    public.is_academic_portal_role()
    AND school_id = public.get_my_school_id()
  )
  WITH CHECK (
    public.is_academic_portal_role()
    AND school_id = public.get_my_school_id()
  );

DROP POLICY IF EXISTS "Academic roles can manage students" ON public.students;
CREATE POLICY "Academic roles can manage students"
  ON public.students FOR ALL
  USING (
    public.is_academic_portal_role()
    AND school_id = public.get_my_school_id()
  )
  WITH CHECK (
    public.is_academic_portal_role()
    AND school_id = public.get_my_school_id()
  );

DROP POLICY IF EXISTS "Academic roles can manage admissions" ON public.admission_applications;
CREATE POLICY "Academic roles can manage admissions"
  ON public.admission_applications FOR ALL
  USING (
    public.is_academic_portal_role()
    AND school_id = public.get_my_school_id()
  )
  WITH CHECK (
    public.is_academic_portal_role()
    AND school_id = public.get_my_school_id()
  );

-- Academic: branch-scoped tables
DROP POLICY IF EXISTS "Academic roles can manage sections" ON public.sections;
CREATE POLICY "Academic roles can manage sections"
  ON public.sections FOR ALL
  USING (
    public.is_academic_portal_role()
    AND branch_id IN (
      SELECT id FROM public.branches WHERE school_id = public.get_my_school_id()
    )
  )
  WITH CHECK (
    public.is_academic_portal_role()
    AND branch_id IN (
      SELECT id FROM public.branches WHERE school_id = public.get_my_school_id()
    )
  );

DROP POLICY IF EXISTS "Academic roles can manage classes" ON public.classes;
CREATE POLICY "Academic roles can manage classes"
  ON public.classes FOR ALL
  USING (
    public.is_academic_portal_role()
    AND branch_id IN (
      SELECT id FROM public.branches WHERE school_id = public.get_my_school_id()
    )
  )
  WITH CHECK (
    public.is_academic_portal_role()
    AND branch_id IN (
      SELECT id FROM public.branches WHERE school_id = public.get_my_school_id()
    )
  );

DROP POLICY IF EXISTS "Academic roles can manage subjects" ON public.subjects;
CREATE POLICY "Academic roles can manage subjects"
  ON public.subjects FOR ALL
  USING (
    public.is_academic_portal_role()
    AND branch_id IN (
      SELECT id FROM public.branches WHERE school_id = public.get_my_school_id()
    )
  )
  WITH CHECK (
    public.is_academic_portal_role()
    AND branch_id IN (
      SELECT id FROM public.branches WHERE school_id = public.get_my_school_id()
    )
  );

DROP POLICY IF EXISTS "Academic roles can manage curriculum" ON public.curriculum;
CREATE POLICY "Academic roles can manage curriculum"
  ON public.curriculum FOR ALL
  USING (
    public.is_academic_portal_role()
    AND branch_id IN (
      SELECT id FROM public.branches WHERE school_id = public.get_my_school_id()
    )
  )
  WITH CHECK (
    public.is_academic_portal_role()
    AND branch_id IN (
      SELECT id FROM public.branches WHERE school_id = public.get_my_school_id()
    )
  );

DROP POLICY IF EXISTS "Academic roles can manage timetable" ON public.timetable_slots;
CREATE POLICY "Academic roles can manage timetable"
  ON public.timetable_slots FOR ALL
  USING (
    public.is_academic_portal_role()
    AND class_id IN (
      SELECT c.id
      FROM public.classes c
      JOIN public.branches b ON b.id = c.branch_id
      WHERE b.school_id = public.get_my_school_id()
    )
  )
  WITH CHECK (
    public.is_academic_portal_role()
    AND class_id IN (
      SELECT c.id
      FROM public.classes c
      JOIN public.branches b ON b.id = c.branch_id
      WHERE b.school_id = public.get_my_school_id()
    )
  );

DROP POLICY IF EXISTS "Academic roles can manage guardian_students" ON public.guardian_students;
CREATE POLICY "Academic roles can manage guardian_students"
  ON public.guardian_students FOR ALL
  USING (
    public.is_academic_portal_role()
    AND student_id IN (
      SELECT id FROM public.students WHERE school_id = public.get_my_school_id()
    )
    AND guardian_id IN (
      SELECT id FROM public.guardians WHERE school_id = public.get_my_school_id()
    )
  )
  WITH CHECK (
    public.is_academic_portal_role()
    AND student_id IN (
      SELECT id FROM public.students WHERE school_id = public.get_my_school_id()
    )
    AND guardian_id IN (
      SELECT id FROM public.guardians WHERE school_id = public.get_my_school_id()
    )
  );

-- Teacher manage: keep own assignments; academic portal only within school
DROP POLICY IF EXISTS "Teacher roles can manage assignments" ON public.assignments;
CREATE POLICY "Teacher roles can manage assignments"
  ON public.assignments FOR ALL
  USING (
    teacher_id = auth.uid()
    OR (
      public.is_academic_portal_role()
      AND class_id IN (
        SELECT c.id
        FROM public.classes c
        JOIN public.branches b ON b.id = c.branch_id
        WHERE b.school_id = public.get_my_school_id()
      )
    )
  )
  WITH CHECK (
    teacher_id = auth.uid()
    OR (
      public.is_academic_portal_role()
      AND class_id IN (
        SELECT c.id
        FROM public.classes c
        JOIN public.branches b ON b.id = c.branch_id
        WHERE b.school_id = public.get_my_school_id()
      )
    )
  );

DROP POLICY IF EXISTS "Teacher/Academic roles can manage attendance" ON public.attendance_records;
CREATE POLICY "Teacher/Academic roles can manage attendance"
  ON public.attendance_records FOR ALL
  USING (
    (
      public.is_academic_portal_role()
      OR public.has_role(ARRAY['teacher']::public.user_role[])
    )
    AND student_id IN (
      SELECT id FROM public.students WHERE school_id = public.get_my_school_id()
    )
  )
  WITH CHECK (
    (
      public.is_academic_portal_role()
      OR public.has_role(ARRAY['teacher']::public.user_role[])
    )
    AND student_id IN (
      SELECT id FROM public.students WHERE school_id = public.get_my_school_id()
    )
  );

DROP POLICY IF EXISTS "Teacher/Academic roles can manage grades" ON public.grades;
CREATE POLICY "Teacher/Academic roles can manage grades"
  ON public.grades FOR ALL
  USING (
    (
      public.is_academic_portal_role()
      OR public.has_role(ARRAY['teacher']::public.user_role[])
    )
    AND student_id IN (
      SELECT id FROM public.students WHERE school_id = public.get_my_school_id()
    )
  )
  WITH CHECK (
    (
      public.is_academic_portal_role()
      OR public.has_role(ARRAY['teacher']::public.user_role[])
    )
    AND student_id IN (
      SELECT id FROM public.students WHERE school_id = public.get_my_school_id()
    )
  );

-- Finance
DROP POLICY IF EXISTS "Finance roles can manage fee_structures" ON public.fee_structures;
CREATE POLICY "Finance roles can manage fee_structures"
  ON public.fee_structures FOR ALL
  USING (
    public.is_finance_manager_role()
    AND branch_id IN (
      SELECT id FROM public.branches WHERE school_id = public.get_my_school_id()
    )
  )
  WITH CHECK (
    public.is_finance_manager_role()
    AND branch_id IN (
      SELECT id FROM public.branches WHERE school_id = public.get_my_school_id()
    )
  );

DROP POLICY IF EXISTS "Finance roles can manage fee_invoices" ON public.fee_invoices;
CREATE POLICY "Finance roles can manage fee_invoices"
  ON public.fee_invoices FOR ALL
  USING (
    public.is_finance_payments_role()
    AND student_id IN (
      SELECT id FROM public.students WHERE school_id = public.get_my_school_id()
    )
  )
  WITH CHECK (
    public.is_finance_payments_role()
    AND student_id IN (
      SELECT id FROM public.students WHERE school_id = public.get_my_school_id()
    )
  );

DROP POLICY IF EXISTS "Finance roles can manage fee_payments" ON public.fee_payments;
CREATE POLICY "Finance roles can manage fee_payments"
  ON public.fee_payments FOR ALL
  USING (
    public.is_finance_payments_role()
    AND invoice_id IN (
      SELECT fi.id
      FROM public.fee_invoices fi
      JOIN public.students s ON s.id = fi.student_id
      WHERE s.school_id = public.get_my_school_id()
    )
  )
  WITH CHECK (
    public.is_finance_payments_role()
    AND invoice_id IN (
      SELECT fi.id
      FROM public.fee_invoices fi
      JOIN public.students s ON s.id = fi.student_id
      WHERE s.school_id = public.get_my_school_id()
    )
  );

DROP POLICY IF EXISTS "Finance roles can manage expenses" ON public.expenses;
CREATE POLICY "Finance roles can manage expenses"
  ON public.expenses FOR ALL
  USING (
    public.is_finance_manager_role()
    AND branch_id IN (
      SELECT id FROM public.branches WHERE school_id = public.get_my_school_id()
    )
  )
  WITH CHECK (
    public.is_finance_manager_role()
    AND branch_id IN (
      SELECT id FROM public.branches WHERE school_id = public.get_my_school_id()
    )
  );

DROP POLICY IF EXISTS "Finance roles can manage payroll" ON public.payroll;
CREATE POLICY "Finance roles can manage payroll"
  ON public.payroll FOR ALL
  USING (
    public.is_finance_manager_role()
    AND staff_id IN (
      SELECT id FROM public.staff WHERE school_id = public.get_my_school_id()
    )
  )
  WITH CHECK (
    public.is_finance_manager_role()
    AND staff_id IN (
      SELECT id FROM public.staff WHERE school_id = public.get_my_school_id()
    )
  );

DROP POLICY IF EXISTS "Finance and admin can manage settings" ON public.fee_reminder_settings;
CREATE POLICY "Finance and admin can manage settings"
  ON public.fee_reminder_settings FOR ALL
  USING (
    public.is_finance_manager_role()
    AND school_id = public.get_my_school_id()
  )
  WITH CHECK (
    public.is_finance_manager_role()
    AND school_id = public.get_my_school_id()
  );

-- Operations
DROP POLICY IF EXISTS "Operations roles can manage staff" ON public.staff;
CREATE POLICY "Operations roles can manage staff"
  ON public.staff FOR ALL
  USING (
    public.is_operations_portal_role()
    AND school_id = public.get_my_school_id()
  )
  WITH CHECK (
    public.is_operations_portal_role()
    AND school_id = public.get_my_school_id()
  );

DROP POLICY IF EXISTS "Operations roles can manage books" ON public.books;
CREATE POLICY "Operations roles can manage books"
  ON public.books FOR ALL
  USING (
    public.is_operations_portal_role()
    AND branch_id IN (
      SELECT id FROM public.branches WHERE school_id = public.get_my_school_id()
    )
  )
  WITH CHECK (
    public.is_operations_portal_role()
    AND branch_id IN (
      SELECT id FROM public.branches WHERE school_id = public.get_my_school_id()
    )
  );

DROP POLICY IF EXISTS "Operations roles can manage book_issues" ON public.book_issues;
CREATE POLICY "Operations roles can manage book_issues"
  ON public.book_issues FOR ALL
  USING (
    public.is_operations_portal_role()
    AND book_id IN (
      SELECT b.id
      FROM public.books b
      JOIN public.branches br ON br.id = b.branch_id
      WHERE br.school_id = public.get_my_school_id()
    )
  )
  WITH CHECK (
    public.is_operations_portal_role()
    AND book_id IN (
      SELECT b.id
      FROM public.books b
      JOIN public.branches br ON br.id = b.branch_id
      WHERE br.school_id = public.get_my_school_id()
    )
  );

DROP POLICY IF EXISTS "Operations roles can manage transport_routes" ON public.transport_routes;
CREATE POLICY "Operations roles can manage transport_routes"
  ON public.transport_routes FOR ALL
  USING (
    public.is_operations_portal_role()
    AND branch_id IN (
      SELECT id FROM public.branches WHERE school_id = public.get_my_school_id()
    )
  )
  WITH CHECK (
    public.is_operations_portal_role()
    AND branch_id IN (
      SELECT id FROM public.branches WHERE school_id = public.get_my_school_id()
    )
  );

DROP POLICY IF EXISTS "Operations roles can manage transport_vehicles" ON public.transport_vehicles;
CREATE POLICY "Operations roles can manage transport_vehicles"
  ON public.transport_vehicles FOR ALL
  USING (
    public.is_operations_portal_role()
    AND route_id IN (
      SELECT r.id
      FROM public.transport_routes r
      JOIN public.branches b ON b.id = r.branch_id
      WHERE b.school_id = public.get_my_school_id()
    )
  )
  WITH CHECK (
    public.is_operations_portal_role()
    AND route_id IN (
      SELECT r.id
      FROM public.transport_routes r
      JOIN public.branches b ON b.id = r.branch_id
      WHERE b.school_id = public.get_my_school_id()
    )
  );

DROP POLICY IF EXISTS "Operations roles can manage transport_student_mapping" ON public.transport_student_mapping;
CREATE POLICY "Operations roles can manage transport_student_mapping"
  ON public.transport_student_mapping FOR ALL
  USING (
    public.is_operations_portal_role()
    AND student_id IN (
      SELECT id FROM public.students WHERE school_id = public.get_my_school_id()
    )
  )
  WITH CHECK (
    public.is_operations_portal_role()
    AND student_id IN (
      SELECT id FROM public.students WHERE school_id = public.get_my_school_id()
    )
  );

DROP POLICY IF EXISTS "Operations roles can manage events" ON public.events;
CREATE POLICY "Operations roles can manage events"
  ON public.events FOR ALL
  USING (
    public.is_operations_portal_role()
    AND branch_id IN (
      SELECT id FROM public.branches WHERE school_id = public.get_my_school_id()
    )
  )
  WITH CHECK (
    public.is_operations_portal_role()
    AND branch_id IN (
      SELECT id FROM public.branches WHERE school_id = public.get_my_school_id()
    )
  );
