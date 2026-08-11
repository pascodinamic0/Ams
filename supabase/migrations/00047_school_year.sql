-- DRC school years are labeled in pairs (e.g. 2026-2027). Store start year as INTEGER.

ALTER TABLE public.fee_structures
  ADD COLUMN IF NOT EXISTS school_year INTEGER;

UPDATE public.fee_structures
SET school_year = CASE
  WHEN EXTRACT(MONTH FROM now()) >= 8 THEN EXTRACT(YEAR FROM now())::INTEGER
  ELSE (EXTRACT(YEAR FROM now())::INTEGER - 1)
END
WHERE school_year IS NULL;

ALTER TABLE public.fee_structures
  ALTER COLUMN school_year SET NOT NULL;

ALTER TABLE public.fee_structures
  DROP CONSTRAINT IF EXISTS fee_structures_school_year_check;

ALTER TABLE public.fee_structures
  ADD CONSTRAINT fee_structures_school_year_check
  CHECK (school_year BETWEEN 2000 AND 2100);

CREATE INDEX IF NOT EXISTS idx_fee_structures_school_year
  ON public.fee_structures (branch_id, school_year);

ALTER TABLE public.grades
  ADD COLUMN IF NOT EXISTS school_year INTEGER;

UPDATE public.grades
SET school_year = CASE
  WHEN EXTRACT(MONTH FROM now()) >= 8 THEN EXTRACT(YEAR FROM now())::INTEGER
  ELSE (EXTRACT(YEAR FROM now())::INTEGER - 1)
END
WHERE school_year IS NULL;

ALTER TABLE public.grades
  ALTER COLUMN school_year SET NOT NULL;

ALTER TABLE public.grades
  DROP CONSTRAINT IF EXISTS grades_school_year_check;

ALTER TABLE public.grades
  ADD CONSTRAINT grades_school_year_check
  CHECK (school_year BETWEEN 2000 AND 2100);

CREATE INDEX IF NOT EXISTS idx_grades_school_year
  ON public.grades (class_id, school_year, term);

-- Budget task descriptions: show paired school year
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
  v_school_year TEXT;
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

  v_school_year := v_plan.year::text || ' - ' || (v_plan.year + 1)::text;
  v_title := format('Budget: %s', v_line.name);
  v_description := format(
    E'Budget line from %s (%s).\nCategory: %s\nAmount: %s\nPeriod: %s / %s\n%s',
    v_plan.title,
    v_school_year,
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
