-- How often a late fee reminder comes back until the balance is paid.
ALTER TABLE public.fee_reminder_settings
  ADD COLUMN IF NOT EXISTS collection_cycle TEXT NOT NULL DEFAULT 'trimester';

ALTER TABLE public.fee_reminder_settings
  DROP CONSTRAINT IF EXISTS fee_reminder_settings_collection_cycle_check;

ALTER TABLE public.fee_reminder_settings
  ADD CONSTRAINT fee_reminder_settings_collection_cycle_check
  CHECK (collection_cycle IN ('monthly', 'trimester'));
