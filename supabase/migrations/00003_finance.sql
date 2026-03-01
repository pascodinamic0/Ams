-- Finance tables: fee_structures, fee_invoices, payments, payroll, expenses

-- Fee structures
CREATE TABLE fee_structures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
  class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_fee_structures_branch ON fee_structures(branch_id);

-- Fee invoices
CREATE TYPE invoice_status AS ENUM ('pending', 'paid', 'overdue');

CREATE TABLE fee_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  fee_structure_id UUID REFERENCES fee_structures(id) ON DELETE SET NULL,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
  amount_paid DECIMAL(12, 2) DEFAULT 0 CHECK (amount_paid >= 0),
  due_date DATE NOT NULL,
  status invoice_status DEFAULT 'pending',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT amount_paid_lte_amount CHECK (amount_paid <= amount)
);

CREATE INDEX idx_fee_invoices_student ON fee_invoices(student_id);
CREATE INDEX idx_fee_invoices_status ON fee_invoices(status);
CREATE INDEX idx_fee_invoices_due_date ON fee_invoices(due_date);

-- Fee Payments (renamed from 'payments' to avoid conflict with other tables)
CREATE TYPE fee_payment_method AS ENUM ('cash', 'bank_transfer', 'card', 'mobile_money', 'online', 'other');

CREATE TABLE fee_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES fee_invoices(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
  method fee_payment_method DEFAULT 'other',
  reference TEXT,
  paid_at TIMESTAMPTZ DEFAULT now(),
  recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_fee_payments_invoice ON fee_payments(invoice_id);

-- Expenses
CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount DECIMAL(12, 2) NOT NULL CHECK (amount >= 0),
  description TEXT,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_expenses_branch ON expenses(branch_id);
CREATE INDEX idx_expenses_date ON expenses(date);

-- RLS: fee_structures
ALTER TABLE fee_structures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read fee_structures in their school"
  ON fee_structures FOR SELECT
  USING (
    branch_id IN (SELECT branch_id FROM profiles WHERE id = auth.uid())
    OR branch_id IN (SELECT b.id FROM branches b JOIN profiles p ON p.school_id = b.school_id WHERE p.id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
  );

CREATE POLICY "Finance roles can manage fee_structures"
  ON fee_structures FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'finance_officer'))
  );

-- RLS: fee_invoices
ALTER TABLE fee_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Finance roles can read fee_invoices"
  ON fee_invoices FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'finance_officer'))
    OR student_id IN (SELECT gs.student_id FROM guardian_students gs JOIN guardians g ON g.id = gs.guardian_id WHERE g.auth_user_id = auth.uid())
  );

CREATE POLICY "Finance roles can manage fee_invoices"
  ON fee_invoices FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'finance_officer'))
  );

-- RLS: fee_payments
ALTER TABLE fee_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Finance roles can read fee_payments"
  ON fee_payments FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'finance_officer'))
    OR invoice_id IN (
      SELECT fi.id FROM fee_invoices fi
      JOIN guardian_students gs ON gs.student_id = fi.student_id
      JOIN guardians g ON g.id = gs.guardian_id
      WHERE g.auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Finance roles can manage fee_payments"
  ON fee_payments FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'finance_officer'))
  );

-- RLS: expenses
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Finance roles can read expenses"
  ON expenses FOR SELECT
  USING (
    branch_id IN (SELECT branch_id FROM profiles WHERE id = auth.uid())
    OR branch_id IN (SELECT b.id FROM branches b JOIN profiles p ON p.school_id = b.school_id WHERE p.id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
  );

CREATE POLICY "Finance roles can manage expenses"
  ON expenses FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'finance_officer'))
  );
