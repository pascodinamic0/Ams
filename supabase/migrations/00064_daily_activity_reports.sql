-- Daily activity reports toggle + school leadership read access to fee payments for reports.

ALTER TABLE public.schools
  ADD COLUMN IF NOT EXISTS daily_activity_reports_enabled BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN public.schools.daily_activity_reports_enabled IS
  'When false, daily activity reports are hidden from nav and /academic/reports/daily redirects to monthly.';

CREATE OR REPLACE FUNCTION public.is_school_leadership_finance_read_role()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(ARRAY[
    'super_admin',
    'academic_admin',
    'principal'
  ]::public.user_role[]);
$$;

GRANT EXECUTE ON FUNCTION public.is_school_leadership_finance_read_role() TO authenticated;

DROP POLICY IF EXISTS "School leadership can read fee_invoices" ON public.fee_invoices;
CREATE POLICY "School leadership can read fee_invoices"
  ON public.fee_invoices FOR SELECT
  USING (
    public.is_school_leadership_finance_read_role()
    AND student_id IN (
      SELECT s.id
      FROM public.students s
      WHERE s.school_id = public.get_my_school_id()
    )
  );

DROP POLICY IF EXISTS "School leadership can read fee_payments" ON public.fee_payments;
CREATE POLICY "School leadership can read fee_payments"
  ON public.fee_payments FOR SELECT
  USING (
    public.is_school_leadership_finance_read_role()
    AND invoice_id IN (
      SELECT fi.id
      FROM public.fee_invoices fi
      JOIN public.students s ON s.id = fi.student_id
      WHERE s.school_id = public.get_my_school_id()
    )
  );
