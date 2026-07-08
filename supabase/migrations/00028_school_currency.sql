-- Per-school currency (defaults to US Dollars)
ALTER TABLE schools
  ADD COLUMN IF NOT EXISTS currency_code TEXT NOT NULL DEFAULT 'USD';

COMMENT ON COLUMN schools.currency_code IS 'ISO 4217 currency code used for finance display (default USD).';
