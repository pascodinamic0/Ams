-- Smart payment links: opaque token per invoice so parents can open the exact
-- amount due from WhatsApp/email without logging in. Lookup is a SECURITY DEFINER
-- RPC so anon never gains SELECT on fee_invoices.

ALTER TABLE public.fee_invoices
  ADD COLUMN IF NOT EXISTS payment_token TEXT;

COMMENT ON COLUMN public.fee_invoices.payment_token IS
  'Opaque public token for /pay/{token}. Not the invoice UUID.';

CREATE OR REPLACE FUNCTION public.generate_invoice_payment_token()
RETURNS text
LANGUAGE sql
VOLATILE
AS $$
  SELECT replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '');
$$;

UPDATE public.fee_invoices
SET payment_token = public.generate_invoice_payment_token()
WHERE payment_token IS NULL OR btrim(payment_token) = '';

ALTER TABLE public.fee_invoices
  ALTER COLUMN payment_token SET DEFAULT public.generate_invoice_payment_token();

ALTER TABLE public.fee_invoices
  ALTER COLUMN payment_token SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_fee_invoices_payment_token
  ON public.fee_invoices (payment_token);

CREATE OR REPLACE FUNCTION public.fee_invoices_assign_payment_token()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.payment_token IS NULL OR btrim(NEW.payment_token) = '' THEN
    NEW.payment_token := public.generate_invoice_payment_token();
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_fee_invoices_assign_payment_token ON public.fee_invoices;
CREATE TRIGGER trg_fee_invoices_assign_payment_token
  BEFORE INSERT OR UPDATE OF payment_token ON public.fee_invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.fee_invoices_assign_payment_token();

CREATE OR REPLACE FUNCTION public.get_public_invoice_payment(p_token text)
RETURNS TABLE (
  invoice_id uuid,
  invoice_ref text,
  amount numeric,
  amount_paid numeric,
  due_date date,
  status public.invoice_status,
  description text,
  student_name text,
  student_code text,
  school_name text,
  school_locale text,
  contact_email text,
  contact_phone text,
  address text,
  currency_code text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
  SELECT
    fi.id,
    upper(substr(replace(fi.id::text, '-', ''), 1, 8)),
    fi.amount,
    COALESCE(fi.amount_paid, 0),
    fi.due_date,
    fi.status,
    fi.description,
    concat_ws(
      ' ',
      NULLIF(btrim(s.first_name), ''),
      NULLIF(btrim(s.middle_name), ''),
      NULLIF(btrim(s.last_name), '')
    ),
    s.student_id,
    sch.name,
    sch.locale,
    sch.contact_email,
    sch.contact_phone,
    sch.address,
    sch.currency_code
  FROM public.fee_invoices fi
  JOIN public.students s ON s.id = fi.student_id
  JOIN public.schools sch ON sch.id = s.school_id
  WHERE fi.payment_token = p_token
    AND length(p_token) BETWEEN 32 AND 64
  LIMIT 1;
$$;

REVOKE ALL ON FUNCTION public.get_public_invoice_payment(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_invoice_payment(text) TO anon, authenticated;
REVOKE ALL ON FUNCTION public.generate_invoice_payment_token() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.generate_invoice_payment_token() TO authenticated;

-- Nightly reminders should carry the pay link unless the school already customized it in.
ALTER TABLE public.fee_reminder_settings
  ALTER COLUMN morning_message_template SET DEFAULT
    'Dear {guardian_name}, this is a reminder that {student_name}''s school fees of {currency}{amount} are due on {due_date}. Pay the exact amount here before the term slips: {pay_link}';

ALTER TABLE public.fee_reminder_settings
  ALTER COLUMN final_warning_template SET DEFAULT
    'Dear {guardian_name}, your payment grace period has ended. Please do not bring {student_name} to school until the outstanding balance of {currency}{amount} is cleared. Pay the exact amount here: {pay_link}';

UPDATE public.fee_reminder_settings
SET morning_message_template = morning_message_template || E'\n\nPay the exact amount here: {pay_link}'
WHERE morning_message_template NOT LIKE '%{pay_link}%';

UPDATE public.fee_reminder_settings
SET final_warning_template = final_warning_template || E'\n\nPay the exact amount here: {pay_link}'
WHERE final_warning_template NOT LIKE '%{pay_link}%';
