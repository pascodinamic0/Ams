-- Operations tables: books, book_issues, transport, events, staff, payroll

-- Staff (must exist before payroll)
CREATE TABLE staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  branch_id UUID REFERENCES branches(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT,
  role TEXT,
  profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_staff_school ON staff(school_id);
CREATE INDEX idx_staff_branch ON staff(branch_id);

-- Payroll
CREATE TYPE payroll_status AS ENUM ('pending', 'paid');

CREATE TABLE payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
  status payroll_status DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_payroll_staff ON payroll(staff_id);

-- Books
CREATE TABLE books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  author TEXT,
  isbn TEXT,
  quantity INTEGER DEFAULT 1 CHECK (quantity >= 0),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_books_branch ON books(branch_id);

-- Book issues
CREATE TABLE book_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  issued_at TIMESTAMPTZ DEFAULT now(),
  due_at DATE NOT NULL,
  returned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_book_issues_book ON book_issues(book_id);
CREATE INDEX idx_book_issues_student ON book_issues(student_id);

-- Transport routes
CREATE TABLE transport_routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_transport_routes_branch ON transport_routes(branch_id);

-- Transport vehicles
CREATE TABLE transport_vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES transport_routes(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  capacity INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_transport_vehicles_route ON transport_vehicles(route_id);

-- Transport student mapping
CREATE TABLE transport_student_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  vehicle_id UUID NOT NULL REFERENCES transport_vehicles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(student_id)
);

CREATE INDEX idx_transport_student_mapping_student ON transport_student_mapping(student_id);
CREATE INDEX idx_transport_student_mapping_vehicle ON transport_student_mapping(vehicle_id);

-- Events
CREATE TYPE event_type AS ENUM ('event', 'holiday');

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  type event_type DEFAULT 'event',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_events_branch ON events(branch_id);
CREATE INDEX idx_events_date ON events(date);

-- RLS: staff
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read staff in their school"
  ON staff FOR SELECT
  USING (
    school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
  );

CREATE POLICY "Operations roles can manage staff"
  ON staff FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'operations_manager'))
  );

-- RLS: payroll
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Finance/Operations roles can read payroll"
  ON payroll FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'finance_officer', 'operations_manager'))
  );

CREATE POLICY "Finance roles can manage payroll"
  ON payroll FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'finance_officer'))
  );

-- RLS: books
ALTER TABLE books ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read books in their school"
  ON books FOR SELECT
  USING (
    branch_id IN (SELECT branch_id FROM profiles WHERE id = auth.uid())
    OR branch_id IN (SELECT b.id FROM branches b JOIN profiles p ON p.school_id = b.school_id WHERE p.id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
  );

CREATE POLICY "Operations roles can manage books"
  ON books FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'operations_manager'))
  );

-- RLS: book_issues
ALTER TABLE book_issues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read book_issues in their school"
  ON book_issues FOR SELECT
  USING (
    book_id IN (SELECT id FROM books WHERE branch_id IN (SELECT branch_id FROM profiles WHERE id = auth.uid()))
    OR book_id IN (SELECT b.id FROM books b JOIN branches br ON br.id = b.branch_id JOIN profiles p ON p.school_id = br.school_id WHERE p.id = auth.uid())
    OR student_id IN (SELECT id FROM students WHERE auth_user_id = auth.uid())
    OR student_id IN (SELECT gs.student_id FROM guardian_students gs JOIN guardians g ON g.id = gs.guardian_id WHERE g.auth_user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
  );

CREATE POLICY "Operations roles can manage book_issues"
  ON book_issues FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'operations_manager'))
  );

-- RLS: transport_routes, transport_vehicles, transport_student_mapping
ALTER TABLE transport_routes ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_student_mapping ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read transport in their school"
  ON transport_routes FOR SELECT
  USING (
    branch_id IN (SELECT branch_id FROM profiles WHERE id = auth.uid())
    OR branch_id IN (SELECT b.id FROM branches b JOIN profiles p ON p.school_id = b.school_id WHERE p.id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
  );

CREATE POLICY "Operations roles can manage transport_routes"
  ON transport_routes FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'operations_manager'))
  );

CREATE POLICY "Users can read transport_vehicles"
  ON transport_vehicles FOR SELECT
  USING (
    route_id IN (SELECT id FROM transport_routes WHERE branch_id IN (SELECT branch_id FROM profiles WHERE id = auth.uid()))
    OR route_id IN (SELECT tr.id FROM transport_routes tr JOIN branches b ON b.id = tr.branch_id JOIN profiles p ON p.school_id = b.school_id WHERE p.id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
  );

CREATE POLICY "Operations roles can manage transport_vehicles"
  ON transport_vehicles FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'operations_manager'))
  );

CREATE POLICY "Users can read transport_student_mapping"
  ON transport_student_mapping FOR SELECT
  USING (
    student_id IN (SELECT id FROM students WHERE auth_user_id = auth.uid())
    OR student_id IN (SELECT gs.student_id FROM guardian_students gs JOIN guardians g ON g.id = gs.guardian_id WHERE g.auth_user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
  );

CREATE POLICY "Operations roles can manage transport_student_mapping"
  ON transport_student_mapping FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'operations_manager'))
  );

-- RLS: events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read events in their school"
  ON events FOR SELECT
  USING (
    branch_id IN (SELECT branch_id FROM profiles WHERE id = auth.uid())
    OR branch_id IN (SELECT b.id FROM branches b JOIN profiles p ON p.school_id = b.school_id WHERE p.id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
  );

CREATE POLICY "Operations roles can manage events"
  ON events FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'operations_manager'))
  );
