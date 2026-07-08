-- Payroll redesign for school-friendly monthly payroll workflow.

ALTER TABLE staff
  ADD COLUMN IF NOT EXISTS department TEXT,
  ADD COLUMN IF NOT EXISTS monthly_salary DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (monthly_salary >= 0),
  ADD COLUMN IF NOT EXISTS employment_status TEXT NOT NULL DEFAULT 'active' CHECK (employment_status IN ('active', 'inactive')),
  ADD COLUMN IF NOT EXISTS photo_url TEXT;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payroll_payment_method') THEN
    CREATE TYPE payroll_payment_method AS ENUM ('cash', 'bank', 'mobile_money');
  END IF;
END $$;

ALTER TABLE payroll
  ADD COLUMN IF NOT EXISTS payroll_month SMALLINT,
  ADD COLUMN IF NOT EXISTS payroll_year INTEGER,
  ADD COLUMN IF NOT EXISTS payment_date DATE,
  ADD COLUMN IF NOT EXISTS payment_method payroll_payment_method,
  ADD COLUMN IF NOT EXISTS reference_number TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS staff_full_name TEXT,
  ADD COLUMN IF NOT EXISTS staff_position TEXT,
  ADD COLUMN IF NOT EXISTS staff_department TEXT,
  ADD COLUMN IF NOT EXISTS staff_monthly_salary DECIMAL(12, 2),
  ADD COLUMN IF NOT EXISTS staff_employment_status TEXT,
  ADD COLUMN IF NOT EXISTS staff_photo_url TEXT;

UPDATE payroll
SET
  payroll_month = COALESCE(payroll_month, EXTRACT(MONTH FROM period_start)::SMALLINT),
  payroll_year = COALESCE(payroll_year, EXTRACT(YEAR FROM period_start)::INTEGER);

UPDATE payroll p
SET
  staff_full_name = COALESCE(p.staff_full_name, s.name),
  staff_position = COALESCE(p.staff_position, s.role),
  staff_department = COALESCE(p.staff_department, s.department),
  staff_monthly_salary = COALESCE(p.staff_monthly_salary, s.monthly_salary, p.amount),
  staff_employment_status = COALESCE(p.staff_employment_status, s.employment_status, 'active'),
  staff_photo_url = COALESCE(p.staff_photo_url, s.photo_url)
FROM staff s
WHERE p.staff_id = s.id;

ALTER TABLE payroll
  ALTER COLUMN payroll_month SET NOT NULL,
  ALTER COLUMN payroll_year SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_payroll_staff_month_year
  ON payroll(staff_id, payroll_year, payroll_month);

CREATE INDEX IF NOT EXISTS idx_payroll_month_year
  ON payroll(payroll_year, payroll_month);

CREATE INDEX IF NOT EXISTS idx_payroll_status
  ON payroll(status);
