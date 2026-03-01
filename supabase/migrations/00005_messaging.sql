-- Teacher/Messaging tables: assignments, assignment_submissions, attendance_records, grades, messages, notifications

-- Assignments
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_assignments_class ON assignments(class_id);
CREATE INDEX idx_assignments_teacher ON assignments(teacher_id);
CREATE INDEX idx_assignments_due_date ON assignments(due_date);

-- Assignment submissions
CREATE TABLE assignment_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  file_url TEXT,
  text_response TEXT,
  submitted_at TIMESTAMPTZ,
  graded_at TIMESTAMPTZ,
  grade DECIMAL(5, 2),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(assignment_id, student_id)
);

CREATE INDEX idx_assignment_submissions_assignment ON assignment_submissions(assignment_id);
CREATE INDEX idx_assignment_submissions_student ON assignment_submissions(student_id);

-- Attendance records
CREATE TYPE attendance_status AS ENUM ('present', 'absent');

CREATE TABLE attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status attendance_status DEFAULT 'present',
  period INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id, date, period)
);

CREATE INDEX idx_attendance_records_student ON attendance_records(student_id);
CREATE INDEX idx_attendance_records_date ON attendance_records(date);

-- Grades
CREATE TABLE grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  term TEXT NOT NULL,
  marks DECIMAL(5, 2),
  grade TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_grades_student ON grades(student_id);
CREATE INDEX idx_grades_subject ON grades(subject_id);
CREATE INDEX idx_grades_class ON grades(class_id);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  recipient_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  subject TEXT,
  body TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_messages_created ON messages(created_at);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);

-- RLS: assignments
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read assignments in their school"
  ON assignments FOR SELECT
  USING (
    class_id IN (SELECT c.id FROM classes c JOIN branches b ON b.id = c.branch_id WHERE b.school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid()))
    OR class_id IN (SELECT c.id FROM classes c WHERE c.id IN (SELECT class_id FROM students WHERE auth_user_id = auth.uid()))
    OR teacher_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
  );

CREATE POLICY "Teacher roles can manage assignments"
  ON assignments FOR ALL
  USING (
    teacher_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'academic_admin'))
  );

-- RLS: assignment_submissions
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read submissions in their school"
  ON assignment_submissions FOR SELECT
  USING (
    student_id IN (SELECT id FROM students WHERE auth_user_id = auth.uid())
    OR student_id IN (SELECT gs.student_id FROM guardian_students gs JOIN guardians g ON g.id = gs.guardian_id WHERE g.auth_user_id = auth.uid())
    OR assignment_id IN (SELECT id FROM assignments WHERE teacher_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
  );

CREATE POLICY "Students can submit"
  ON assignment_submissions FOR INSERT
  WITH CHECK (student_id IN (SELECT id FROM students WHERE auth_user_id = auth.uid()));

CREATE POLICY "Teachers can grade submissions"
  ON assignment_submissions FOR UPDATE
  USING (assignment_id IN (SELECT id FROM assignments WHERE teacher_id = auth.uid()));

-- RLS: attendance_records
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read attendance in their school"
  ON attendance_records FOR SELECT
  USING (
    student_id IN (SELECT id FROM students WHERE auth_user_id = auth.uid())
    OR student_id IN (SELECT gs.student_id FROM guardian_students gs JOIN guardians g ON g.id = gs.guardian_id WHERE g.auth_user_id = auth.uid())
    OR student_id IN (SELECT s.id FROM students s JOIN classes c ON c.id = s.class_id WHERE c.id IN (SELECT ts.class_id FROM timetable_slots ts WHERE ts.teacher_id = auth.uid()))
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'academic_admin'))
  );

CREATE POLICY "Teacher/Academic roles can manage attendance"
  ON attendance_records FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'academic_admin', 'teacher'))
  );

-- RLS: grades
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read grades in their school"
  ON grades FOR SELECT
  USING (
    student_id IN (SELECT id FROM students WHERE auth_user_id = auth.uid())
    OR student_id IN (SELECT gs.student_id FROM guardian_students gs JOIN guardians g ON g.id = gs.guardian_id WHERE g.auth_user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'academic_admin', 'teacher'))
  );

CREATE POLICY "Teacher/Academic roles can manage grades"
  ON grades FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'academic_admin', 'teacher'))
  );

-- RLS: messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own messages"
  ON messages FOR SELECT
  USING (sender_id = auth.uid() OR recipient_id = auth.uid());

CREATE POLICY "Users can send messages"
  ON messages FOR INSERT
  WITH CHECK (sender_id = auth.uid());

CREATE POLICY "Recipients can update read status"
  ON messages FOR UPDATE
  USING (recipient_id = auth.uid());

-- RLS: notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own notification read status"
  ON notifications FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Service can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);
