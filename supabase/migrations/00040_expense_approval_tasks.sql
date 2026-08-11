-- Expense approval workflow: expenses create academic-admin tasks;
-- approval can issue a finance receipt number.

DO $$ BEGIN
  CREATE TYPE public.expense_status AS ENUM ('pending', 'approved', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.expenses
  ADD COLUMN IF NOT EXISTS status public.expense_status NOT NULL DEFAULT 'approved',
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS task_id UUID REFERENCES public.school_tasks(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS receipt_number TEXT;

-- New expenses start pending academic-admin approval.
ALTER TABLE public.expenses
  ALTER COLUMN status SET DEFAULT 'pending';

CREATE UNIQUE INDEX IF NOT EXISTS idx_expenses_receipt_number
  ON public.expenses (receipt_number)
  WHERE receipt_number IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_expenses_status ON public.expenses (status);
CREATE INDEX IF NOT EXISTS idx_expenses_task ON public.expenses (task_id);

ALTER TABLE public.school_tasks
  ADD COLUMN IF NOT EXISTS related_type TEXT,
  ADD COLUMN IF NOT EXISTS related_id UUID;

CREATE INDEX IF NOT EXISTS idx_school_tasks_related
  ON public.school_tasks (related_type, related_id)
  WHERE related_type IS NOT NULL;

-- Create an academic-admin task whenever an expense is recorded.
CREATE OR REPLACE FUNCTION public.create_expense_approval_task()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  v_school_id UUID;
  v_branch_name TEXT;
  v_task_id UUID;
  v_amount TEXT;
  v_title TEXT;
  v_description TEXT;
BEGIN
  IF NEW.task_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  SELECT b.school_id, b.name
  INTO v_school_id, v_branch_name
  FROM public.branches b
  WHERE b.id = NEW.branch_id;

  IF v_school_id IS NULL THEN
    RETURN NEW;
  END IF;

  v_amount := trim(to_char(NEW.amount, 'FM999999999990.00'));
  v_title := format('Approve expense: %s (%s)', NEW.category, v_amount);
  v_description := format(
    E'Finance expense awaiting academic admin approval.\nCategory: %s\nAmount: %s\nDate: %s\nBranch: %s\n%s',
    NEW.category,
    v_amount,
    NEW.date::text,
    COALESCE(v_branch_name, '-'),
    COALESCE(NEW.description, '')
  );

  INSERT INTO public.school_tasks (
    school_id,
    title,
    description,
    department,
    priority,
    created_by,
    related_type,
    related_id
  ) VALUES (
    v_school_id,
    v_title,
    v_description,
    'finance',
    CASE
      WHEN NEW.amount >= 500000 THEN 'high'::public.school_task_priority
      WHEN NEW.amount >= 50000 THEN 'medium'::public.school_task_priority
      ELSE 'low'::public.school_task_priority
    END,
    NEW.created_by,
    'expense',
    NEW.id
  )
  RETURNING id INTO v_task_id;

  NEW.task_id := v_task_id;
  IF NEW.status IS NULL THEN
    NEW.status := 'pending';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS expenses_create_approval_task ON public.expenses;
CREATE TRIGGER expenses_create_approval_task
  BEFORE INSERT ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.create_expense_approval_task();

-- Academic/task roles may update expense approval fields for their school.
DROP POLICY IF EXISTS "Task roles can update expense approval" ON public.expenses;
CREATE POLICY "Task roles can update expense approval"
  ON public.expenses FOR UPDATE
  USING (
    public.is_task_workspace_role()
    AND branch_id IN (
      SELECT b.id
      FROM public.branches b
      WHERE b.school_id = public.get_my_school_id()
    )
  )
  WITH CHECK (
    public.is_task_workspace_role()
    AND branch_id IN (
      SELECT b.id
      FROM public.branches b
      WHERE b.school_id = public.get_my_school_id()
    )
  );

-- Next receipt number per school/year: EXP-2026-0001
CREATE OR REPLACE FUNCTION public.next_expense_receipt_number(p_school_id UUID)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  v_year TEXT := to_char(now() AT TIME ZONE 'UTC', 'YYYY');
  v_prefix TEXT := 'EXP-' || v_year || '-';
  v_max INT;
BEGIN
  SELECT COALESCE(MAX(
    NULLIF(regexp_replace(e.receipt_number, '^EXP-[0-9]{4}-', ''), '')::INT
  ), 0)
  INTO v_max
  FROM public.expenses e
  JOIN public.branches b ON b.id = e.branch_id
  WHERE b.school_id = p_school_id
    AND e.receipt_number LIKE v_prefix || '%';

  RETURN v_prefix || lpad((v_max + 1)::text, 4, '0');
END;
$$;

GRANT EXECUTE ON FUNCTION public.next_expense_receipt_number(UUID) TO authenticated;
