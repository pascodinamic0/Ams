-- Extended fields for unified student + guardian onboarding

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS home_address TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT;

ALTER TABLE guardians
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS workplace TEXT;

COMMENT ON COLUMN students.notes IS 'Medical notes, allergies, sickness history, or other care information';
COMMENT ON COLUMN guardians.phone IS 'WhatsApp / SMS contact number';
