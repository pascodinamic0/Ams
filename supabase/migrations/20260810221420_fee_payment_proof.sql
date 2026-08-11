-- Optional image proof (receipt / transfer screenshot) for fee payments
ALTER TABLE public.fee_payments
  ADD COLUMN IF NOT EXISTS proof_url TEXT;
