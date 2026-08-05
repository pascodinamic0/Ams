-- Prevent duplicate webhook/payment records for the same provider reference.
-- NULL references remain allowed (manual payments may omit them).
CREATE UNIQUE INDEX IF NOT EXISTS idx_fee_payments_reference_unique
  ON fee_payments (reference)
  WHERE reference IS NOT NULL AND btrim(reference) <> '';
