-- First-time account onboarding (profile name + photo)

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed_at TIMESTAMPTZ;

-- Existing users should not be forced through onboarding on deploy
UPDATE profiles
SET onboarding_completed_at = COALESCE(updated_at, created_at, now())
WHERE onboarding_completed_at IS NULL;
