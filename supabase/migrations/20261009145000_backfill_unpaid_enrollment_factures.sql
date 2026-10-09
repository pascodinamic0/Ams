-- Pupils who still owe a current-year class fee but never received an
-- enrollment facture were missing from the unpaid list.

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
SELECT
  s.id,
  fs.id,
  fs.amount,
  0,
  CURRENT_DATE,
  'pending',
  COALESCE(NULLIF(btrim(fs.description), ''), fs.name, 'Enrollment fee'),
  'enrollment'
FROM public.students s
JOIN public.fee_structures fs
  ON fs.branch_id = s.branch_id
 AND fs.class_id = s.class_id
 AND fs.school_year = CASE
   WHEN EXTRACT(MONTH FROM CURRENT_DATE) >= 8 THEN EXTRACT(YEAR FROM CURRENT_DATE)::integer
   ELSE EXTRACT(YEAR FROM CURRENT_DATE)::integer - 1
 END
WHERE s.status IN ('pending', 'active')
  AND NOT EXISTS (
    SELECT 1
    FROM public.fee_invoices fi
    WHERE fi.student_id = s.id
      AND fi.fee_structure_id = fs.id
  );
