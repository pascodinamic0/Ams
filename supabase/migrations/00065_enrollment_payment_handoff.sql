-- Enrollment desk: pending students + enrollment invoices until finance verifies paper receipt.

-- Required by confirm_pending_enrollment; also added in 20260810221420_fee_payment_proof.sql.
ALTER TABLE public.fee_payments
  ADD COLUMN IF NOT EXISTS proof_url TEXT;

ALTER TABLE public.fee_invoices
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'regular';

ALTER TABLE public.fee_invoices
  DROP CONSTRAINT IF EXISTS fee_invoices_source_check;

ALTER TABLE public.fee_invoices
  ADD CONSTRAINT fee_invoices_source_check
  CHECK (source IN ('regular', 'enrollment'));

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS enrollment_receipt_ref TEXT;

CREATE INDEX IF NOT EXISTS idx_students_pending_school
  ON public.students (school_id, created_at DESC)
  WHERE status = 'pending';

CREATE INDEX IF NOT EXISTS idx_fee_invoices_enrollment_student
  ON public.fee_invoices (student_id)
  WHERE source = 'enrollment';

-- Academic desk creates enrollment invoice (bypasses finance-only invoice RLS).
CREATE OR REPLACE FUNCTION public.create_enrollment_invoice(
  p_student_id uuid,
  p_fee_structure_id uuid,
  p_due_date date DEFAULT CURRENT_DATE
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  v_student public.students%ROWTYPE;
  v_structure public.fee_structures%ROWTYPE;
  v_invoice_id uuid;
BEGIN
  IF NOT public.is_academic_portal_role() THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  SELECT * INTO v_student FROM public.students WHERE id = p_student_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'student_not_found';
  END IF;

  IF NOT public.is_super_admin()
     AND v_student.school_id IS DISTINCT FROM public.get_my_school_id() THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  IF v_student.status <> 'pending' THEN
    RAISE EXCEPTION 'student_not_pending';
  END IF;

  SELECT * INTO v_structure FROM public.fee_structures WHERE id = p_fee_structure_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'fee_structure_not_found';
  END IF;

  IF v_structure.branch_id <> v_student.branch_id THEN
    RAISE EXCEPTION 'fee_structure_branch_mismatch';
  END IF;

  IF v_structure.class_id IS NOT NULL
     AND v_structure.class_id IS DISTINCT FROM v_student.class_id THEN
    RAISE EXCEPTION 'fee_structure_class_mismatch';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.fee_invoices fi
    WHERE fi.student_id = p_student_id
      AND fi.source = 'enrollment'
  ) THEN
    RAISE EXCEPTION 'enrollment_invoice_exists';
  END IF;

  INSERT INTO public.fee_invoices (
    student_id,
    fee_structure_id,
    amount,
    amount_paid,
    due_date,
    status,
    description,
    source
  )
  VALUES (
    p_student_id,
    p_fee_structure_id,
    v_structure.amount,
    0,
    p_due_date,
    'pending',
    COALESCE(v_structure.description, v_structure.name, 'Enrollment fee'),
    'enrollment'
  )
  RETURNING id INTO v_invoice_id;

  RETURN v_invoice_id;
END;
$$;

-- Finance desk confirms paper receipt photo and activates student when invoice is fully paid.
CREATE OR REPLACE FUNCTION public.confirm_pending_enrollment(
  p_student_id uuid,
  p_invoice_id uuid,
  p_amount numeric,
  p_method public.fee_payment_method,
  p_reference text,
  p_proof_url text,
  p_paid_at timestamptz DEFAULT now()
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  v_student public.students%ROWTYPE;
  v_invoice public.fee_invoices%ROWTYPE;
  v_current_paid numeric;
  v_new_paid numeric;
  v_new_status public.invoice_status;
  v_activated boolean := false;
BEGIN
  IF NOT public.is_finance_payments_role() THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  IF p_proof_url IS NULL OR btrim(p_proof_url) = '' THEN
    RAISE EXCEPTION 'proof_required';
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'invalid_amount';
  END IF;

  SELECT * INTO v_student FROM public.students WHERE id = p_student_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'student_not_found';
  END IF;

  IF NOT public.is_super_admin()
     AND v_student.school_id IS DISTINCT FROM public.get_my_school_id() THEN
    RAISE EXCEPTION 'not_authorized';
  END IF;

  SELECT * INTO v_invoice FROM public.fee_invoices WHERE id = p_invoice_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'invoice_not_found';
  END IF;

  IF v_invoice.student_id <> p_student_id THEN
    RAISE EXCEPTION 'invoice_student_mismatch';
  END IF;

  IF v_invoice.source <> 'enrollment' THEN
    RAISE EXCEPTION 'not_enrollment_invoice';
  END IF;

  v_current_paid := COALESCE(v_invoice.amount_paid, 0);

  IF p_amount > (v_invoice.amount - v_current_paid) THEN
    RAISE EXCEPTION 'payment_exceeds_balance';
  END IF;

  INSERT INTO public.fee_payments (
    invoice_id,
    amount,
    method,
    reference,
    paid_at,
    proof_url,
    recorded_by
  )
  VALUES (
    p_invoice_id,
    p_amount,
    p_method,
    NULLIF(btrim(p_reference), ''),
    COALESCE(p_paid_at, now()),
    btrim(p_proof_url),
    auth.uid()
  );

  v_new_paid := v_current_paid + p_amount;

  IF v_new_paid >= v_invoice.amount THEN
    v_new_status := 'paid';
  ELSIF v_invoice.due_date < CURRENT_DATE THEN
    v_new_status := 'overdue';
  ELSE
    v_new_status := 'pending';
  END IF;

  UPDATE public.fee_invoices
  SET
    amount_paid = v_new_paid,
    status = v_new_status,
    updated_at = now()
  WHERE id = p_invoice_id;

  IF v_new_status = 'paid' AND v_student.status = 'pending' THEN
    UPDATE public.students
    SET status = 'active', updated_at = now()
    WHERE id = p_student_id;
    v_activated := true;
  END IF;

  RETURN jsonb_build_object(
    'invoice_status', v_new_status::text,
    'amount_paid', v_new_paid,
    'student_activated', v_activated
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_enrollment_invoice(uuid, uuid, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_pending_enrollment(
  uuid,
  uuid,
  numeric,
  public.fee_payment_method,
  text,
  text,
  timestamptz
) TO authenticated;
