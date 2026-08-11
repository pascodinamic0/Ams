-- SaaS billing: school-level Stripe subscription fields + column protection

DO $$ BEGIN
  CREATE TYPE public.subscription_status AS ENUM (
    'none',
    'trialing',
    'active',
    'past_due',
    'canceled',
    'unpaid',
    'incomplete',
    'incomplete_expired',
    'paused'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.schools
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_status public.subscription_status NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS subscription_price_id TEXT,
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS billing_exempt BOOLEAN NOT NULL DEFAULT false;

CREATE UNIQUE INDEX IF NOT EXISTS idx_schools_stripe_customer_id
  ON public.schools (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_schools_stripe_subscription_id
  ON public.schools (stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_schools_subscription_status
  ON public.schools (subscription_status);

-- Existing approved schools keep access until you turn billing on for them.
UPDATE public.schools
SET billing_exempt = true
WHERE status = 'approved'
  AND billing_exempt = false
  AND subscription_status = 'none'
  AND stripe_subscription_id IS NULL;

-- Prevent school admins from forging paid access via the website UPDATE policy.
CREATE OR REPLACE FUNCTION public.protect_school_billing_columns()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.role() = 'service_role' OR public.is_super_admin() THEN
    RETURN NEW;
  END IF;

  NEW.stripe_customer_id := OLD.stripe_customer_id;
  NEW.stripe_subscription_id := OLD.stripe_subscription_id;
  NEW.subscription_status := OLD.subscription_status;
  NEW.subscription_price_id := OLD.subscription_price_id;
  NEW.trial_ends_at := OLD.trial_ends_at;
  NEW.current_period_end := OLD.current_period_end;
  NEW.billing_exempt := OLD.billing_exempt;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_school_billing_columns ON public.schools;
CREATE TRIGGER protect_school_billing_columns
  BEFORE UPDATE ON public.schools
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_school_billing_columns();
