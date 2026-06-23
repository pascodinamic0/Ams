-- Optional school setup guide preferences (per user)

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS setup_guide_dismissed_at TIMESTAMPTZ;
