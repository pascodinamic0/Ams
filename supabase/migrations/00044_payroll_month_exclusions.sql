-- Per-month payroll exclusions: finance can tick people out of a specific
-- payroll month without deactivating them on the staff roster.

CREATE TABLE IF NOT EXISTS public.payroll_exclusions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  payroll_month SMALLINT NOT NULL CHECK (payroll_month BETWEEN 1 AND 12),
  payroll_year INTEGER NOT NULL CHECK (payroll_year BETWEEN 2000 AND 2100),
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (staff_id, payroll_year, payroll_month)
);

CREATE INDEX IF NOT EXISTS idx_payroll_exclusions_school_month
  ON public.payroll_exclusions (school_id, payroll_year, payroll_month);

CREATE INDEX IF NOT EXISTS idx_payroll_exclusions_staff
  ON public.payroll_exclusions (staff_id);

ALTER TABLE public.payroll_exclusions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Finance can read payroll exclusions" ON public.payroll_exclusions;
CREATE POLICY "Finance can read payroll exclusions"
  ON public.payroll_exclusions FOR SELECT
  USING (
    public.is_finance_manager_role()
    AND (
      public.has_role(ARRAY['super_admin']::public.user_role[])
      OR school_id = public.get_my_school_id()
    )
  );

DROP POLICY IF EXISTS "Finance can manage payroll exclusions" ON public.payroll_exclusions;
CREATE POLICY "Finance can manage payroll exclusions"
  ON public.payroll_exclusions FOR ALL
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
