-- Yearly budget plans for finance; academic admin can read for reports later.

DO $$ BEGIN
  CREATE TYPE public.budget_plan_status AS ENUM ('draft', 'active', 'archived');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.budget_line_status AS ENUM ('planned', 'in_progress', 'done', 'cancelled');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.budget_period_type AS ENUM ('year', 'quarter', 'trimester', 'month');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.budget_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  year INTEGER NOT NULL CHECK (year >= 2000 AND year <= 2100),
  label TEXT,
  title TEXT NOT NULL,
  status public.budget_plan_status NOT NULL DEFAULT 'draft',
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (school_id, year, title)
);

CREATE INDEX IF NOT EXISTS idx_budget_plans_school
  ON public.budget_plans (school_id);

CREATE INDEX IF NOT EXISTS idx_budget_plans_year
  ON public.budget_plans (school_id, year);

CREATE TABLE IF NOT EXISTS public.budget_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.budget_plans(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  quantity NUMERIC(12, 2) NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  unit_cost NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (unit_cost >= 0),
  total NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (total >= 0),
  period_type public.budget_period_type NOT NULL DEFAULT 'year',
  period_key TEXT NOT NULL DEFAULT 'year',
  sort_order INTEGER NOT NULL DEFAULT 0,
  status public.budget_line_status NOT NULL DEFAULT 'planned',
  task_id UUID REFERENCES public.school_tasks(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_budget_line_items_plan
  ON public.budget_line_items (plan_id);

CREATE INDEX IF NOT EXISTS idx_budget_line_items_category
  ON public.budget_line_items (plan_id, category);

CREATE INDEX IF NOT EXISTS idx_budget_line_items_period
  ON public.budget_line_items (plan_id, period_type, period_key);

CREATE INDEX IF NOT EXISTS idx_budget_line_items_task
  ON public.budget_line_items (task_id)
  WHERE task_id IS NOT NULL;

-- Keep line total in sync from quantity * unit_cost.
CREATE OR REPLACE FUNCTION public.budget_line_set_total()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.total := ROUND(COALESCE(NEW.quantity, 0) * COALESCE(NEW.unit_cost, 0), 2);
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_budget_line_set_total ON public.budget_line_items;
CREATE TRIGGER trg_budget_line_set_total
  BEFORE INSERT OR UPDATE ON public.budget_line_items
  FOR EACH ROW
  EXECUTE FUNCTION public.budget_line_set_total();

CREATE OR REPLACE FUNCTION public.budget_plan_touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_budget_plan_touch ON public.budget_plans;
CREATE TRIGGER trg_budget_plan_touch
  BEFORE UPDATE ON public.budget_plans
  FOR EACH ROW
  EXECUTE FUNCTION public.budget_plan_touch_updated_at();

ALTER TABLE public.budget_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_line_items ENABLE ROW LEVEL SECURITY;

-- Finance managers: full manage on own school
DROP POLICY IF EXISTS "Finance can manage budget plans" ON public.budget_plans;
CREATE POLICY "Finance can manage budget plans"
  ON public.budget_plans FOR ALL
  USING (
    public.is_finance_manager_role()
    AND (
      public.has_role(ARRAY['super_admin']::public.user_role[])
      OR school_id = public.get_my_school_id()
    )
  )
  WITH CHECK (
    public.is_finance_manager_role()
    AND (
      public.has_role(ARRAY['super_admin']::public.user_role[])
      OR school_id = public.get_my_school_id()
    )
  );

DROP POLICY IF EXISTS "Finance can manage budget line items" ON public.budget_line_items;
CREATE POLICY "Finance can manage budget line items"
  ON public.budget_line_items FOR ALL
  USING (
    public.is_finance_manager_role()
    AND EXISTS (
      SELECT 1 FROM public.budget_plans p
      WHERE p.id = plan_id
        AND (
          public.has_role(ARRAY['super_admin']::public.user_role[])
          OR p.school_id = public.get_my_school_id()
        )
    )
  )
  WITH CHECK (
    public.is_finance_manager_role()
    AND EXISTS (
      SELECT 1 FROM public.budget_plans p
      WHERE p.id = plan_id
        AND (
          public.has_role(ARRAY['super_admin']::public.user_role[])
          OR p.school_id = public.get_my_school_id()
        )
    )
  );

-- Academic portal roles: read-only for reports / approvals later
DROP POLICY IF EXISTS "Academic can read budget plans" ON public.budget_plans;
CREATE POLICY "Academic can read budget plans"
  ON public.budget_plans FOR SELECT
  USING (
    public.is_academic_portal_role()
    AND school_id = public.get_my_school_id()
  );

DROP POLICY IF EXISTS "Academic can read budget line items" ON public.budget_line_items;
CREATE POLICY "Academic can read budget line items"
  ON public.budget_line_items FOR SELECT
  USING (
    public.is_academic_portal_role()
    AND EXISTS (
      SELECT 1 FROM public.budget_plans p
      WHERE p.id = plan_id
        AND p.school_id = public.get_my_school_id()
    )
  );

-- Finance may create academic tasks from budget lines (bypasses task-workspace RLS).
CREATE OR REPLACE FUNCTION public.create_task_from_budget_line(p_line_id UUID)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  v_line public.budget_line_items%ROWTYPE;
  v_plan public.budget_plans%ROWTYPE;
  v_task_id UUID;
  v_title TEXT;
  v_description TEXT;
  v_priority public.school_task_priority;
BEGIN
  IF NOT public.is_finance_manager_role() THEN
    RAISE EXCEPTION 'Only finance can create tasks from budget lines';
  END IF;

  SELECT * INTO v_line FROM public.budget_line_items WHERE id = p_line_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Budget line not found';
  END IF;

  IF v_line.task_id IS NOT NULL THEN
    RAISE EXCEPTION 'A task already exists for this line';
  END IF;

  SELECT * INTO v_plan FROM public.budget_plans WHERE id = v_line.plan_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Budget plan not found';
  END IF;

  IF NOT public.has_role(ARRAY['super_admin']::public.user_role[])
    AND public.get_my_school_id() IS DISTINCT FROM v_plan.school_id
  THEN
    RAISE EXCEPTION 'You can only create tasks for your school';
  END IF;

  v_title := format('Budget: %s', v_line.name);
  v_description := format(
    E'Budget line from %s (%s).\nCategory: %s\nAmount: %s\nPeriod: %s / %s\n%s',
    v_plan.title,
    v_plan.year::text,
    v_line.category,
    trim(to_char(v_line.total, 'FM999999999990.00')),
    v_line.period_type::text,
    v_line.period_key,
    COALESCE(v_line.description, '')
  );

  v_priority := CASE
    WHEN v_line.total >= 500000 THEN 'high'::public.school_task_priority
    WHEN v_line.total >= 50000 THEN 'medium'::public.school_task_priority
    ELSE 'low'::public.school_task_priority
  END;

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
    v_plan.school_id,
    v_title,
    v_description,
    'finance',
    v_priority,
    auth.uid(),
    'budget_line',
    v_line.id
  )
  RETURNING id INTO v_task_id;

  UPDATE public.budget_line_items
  SET task_id = v_task_id,
      status = 'in_progress',
      updated_at = now()
  WHERE id = v_line.id;

  RETURN v_task_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_task_from_budget_line(UUID) TO authenticated;
