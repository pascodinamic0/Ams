-- Scope academic portal manage policies to the caller's school.
-- Previous FOR ALL policies checked role only, so academic admins could see
-- and manage students (and related academic rows) across every school —
-- which made demo/template rosters appear on newly registered schools.

-- Students
DROP POLICY IF EXISTS "Academic roles can manage students" ON public.students;
CREATE POLICY "Academic roles can manage students"
  ON public.students FOR ALL
  USING (
    public.is_super_admin()
    OR (
      public.is_academic_portal_role()
      AND school_id = public.get_my_school_id()
    )
  )
  WITH CHECK (
    public.is_super_admin()
    OR (
      public.is_academic_portal_role()
      AND school_id = public.get_my_school_id()
    )
  );

-- Guardians
DROP POLICY IF EXISTS "Academic roles can manage guardians" ON public.guardians;
CREATE POLICY "Academic roles can manage guardians"
  ON public.guardians FOR ALL
  USING (
    public.is_super_admin()
    OR (
      public.is_academic_portal_role()
      AND school_id = public.get_my_school_id()
    )
  )
  WITH CHECK (
    public.is_super_admin()
    OR (
      public.is_academic_portal_role()
      AND school_id = public.get_my_school_id()
    )
  );

-- Guardian ? student links (via student school)
DROP POLICY IF EXISTS "Academic roles can manage guardian_students" ON public.guardian_students;
CREATE POLICY "Academic roles can manage guardian_students"
  ON public.guardian_students FOR ALL
  USING (
    public.is_super_admin()
    OR (
      public.is_academic_portal_role()
      AND student_id IN (
        SELECT id FROM public.students WHERE school_id = public.get_my_school_id()
      )
    )
  )
  WITH CHECK (
    public.is_super_admin()
    OR (
      public.is_academic_portal_role()
      AND student_id IN (
        SELECT id FROM public.students WHERE school_id = public.get_my_school_id()
      )
    )
  );

-- Admissions
DROP POLICY IF EXISTS "Academic roles can manage admissions" ON public.admission_applications;
CREATE POLICY "Academic roles can manage admissions"
  ON public.admission_applications FOR ALL
  USING (
    public.is_super_admin()
    OR (
      public.is_academic_portal_role()
      AND school_id = public.get_my_school_id()
    )
  )
  WITH CHECK (
    public.is_super_admin()
    OR (
      public.is_academic_portal_role()
      AND school_id = public.get_my_school_id()
    )
  );

-- Branch-scoped academic structure
DROP POLICY IF EXISTS "Academic roles can manage sections" ON public.sections;
CREATE POLICY "Academic roles can manage sections"
  ON public.sections FOR ALL
  USING (
    public.is_super_admin()
    OR (
      public.is_academic_portal_role()
      AND branch_id IN (
        SELECT id FROM public.branches WHERE school_id = public.get_my_school_id()
      )
    )
  )
  WITH CHECK (
    public.is_super_admin()
    OR (
      public.is_academic_portal_role()
      AND branch_id IN (
        SELECT id FROM public.branches WHERE school_id = public.get_my_school_id()
      )
    )
  );

DROP POLICY IF EXISTS "Academic roles can manage classes" ON public.classes;
CREATE POLICY "Academic roles can manage classes"
  ON public.classes FOR ALL
  USING (
    public.is_super_admin()
    OR (
      public.is_academic_portal_role()
      AND branch_id IN (
        SELECT id FROM public.branches WHERE school_id = public.get_my_school_id()
      )
    )
  )
  WITH CHECK (
    public.is_super_admin()
    OR (
      public.is_academic_portal_role()
      AND branch_id IN (
        SELECT id FROM public.branches WHERE school_id = public.get_my_school_id()
      )
    )
  );

DROP POLICY IF EXISTS "Academic roles can manage subjects" ON public.subjects;
CREATE POLICY "Academic roles can manage subjects"
  ON public.subjects FOR ALL
  USING (
    public.is_super_admin()
    OR (
      public.is_academic_portal_role()
      AND branch_id IN (
        SELECT id FROM public.branches WHERE school_id = public.get_my_school_id()
      )
    )
  )
  WITH CHECK (
    public.is_super_admin()
    OR (
      public.is_academic_portal_role()
      AND branch_id IN (
        SELECT id FROM public.branches WHERE school_id = public.get_my_school_id()
      )
    )
  );

DROP POLICY IF EXISTS "Academic roles can manage curriculum" ON public.curriculum;
CREATE POLICY "Academic roles can manage curriculum"
  ON public.curriculum FOR ALL
  USING (
    public.is_super_admin()
    OR (
      public.is_academic_portal_role()
      AND branch_id IN (
        SELECT id FROM public.branches WHERE school_id = public.get_my_school_id()
      )
    )
  )
  WITH CHECK (
    public.is_super_admin()
    OR (
      public.is_academic_portal_role()
      AND branch_id IN (
        SELECT id FROM public.branches WHERE school_id = public.get_my_school_id()
      )
    )
  );

-- Timetable (via class ? branch ? school)
DROP POLICY IF EXISTS "Academic roles can manage timetable" ON public.timetable_slots;
CREATE POLICY "Academic roles can manage timetable"
  ON public.timetable_slots FOR ALL
  USING (
    public.is_super_admin()
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
    public.is_super_admin()
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

-- Attendance / grades: keep teacher access, scope academic portal to school
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
    OR public.is_super_admin()
    OR (
      public.is_academic_portal_role()
      AND student_id IN (
        SELECT id FROM public.students WHERE school_id = public.get_my_school_id()
      )
    )
  );

DROP POLICY IF EXISTS "Teacher/Academic roles can manage attendance" ON public.attendance_records;
CREATE POLICY "Teacher/Academic roles can manage attendance"
  ON public.attendance_records FOR ALL
  USING (
    public.is_super_admin()
    OR (
      public.is_academic_portal_role()
      AND student_id IN (
        SELECT id FROM public.students WHERE school_id = public.get_my_school_id()
      )
    )
    OR public.has_role(ARRAY['teacher']::public.user_role[])
  )
  WITH CHECK (
    public.is_super_admin()
    OR (
      public.is_academic_portal_role()
      AND student_id IN (
        SELECT id FROM public.students WHERE school_id = public.get_my_school_id()
      )
    )
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
    OR public.is_super_admin()
    OR (
      public.is_academic_portal_role()
      AND student_id IN (
        SELECT id FROM public.students WHERE school_id = public.get_my_school_id()
      )
    )
    OR public.has_role(ARRAY['teacher']::public.user_role[])
  );

DROP POLICY IF EXISTS "Teacher/Academic roles can manage grades" ON public.grades;
CREATE POLICY "Teacher/Academic roles can manage grades"
  ON public.grades FOR ALL
  USING (
    public.is_super_admin()
    OR (
      public.is_academic_portal_role()
      AND student_id IN (
        SELECT id FROM public.students WHERE school_id = public.get_my_school_id()
      )
    )
    OR public.has_role(ARRAY['teacher']::public.user_role[])
  )
  WITH CHECK (
    public.is_super_admin()
    OR (
      public.is_academic_portal_role()
      AND student_id IN (
        SELECT id FROM public.students WHERE school_id = public.get_my_school_id()
      )
    )
    OR public.has_role(ARRAY['teacher']::public.user_role[])
  );

DROP POLICY IF EXISTS "Teacher roles can manage assignments" ON public.assignments;
CREATE POLICY "Teacher roles can manage assignments"
  ON public.assignments FOR ALL
  USING (
    teacher_id = auth.uid()
    OR public.is_super_admin()
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
    OR public.is_super_admin()
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
