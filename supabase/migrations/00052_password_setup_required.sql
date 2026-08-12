-- Invited users must set a password before using the app.
-- Default false so existing and self-registered accounts are not blocked.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS password_setup_required BOOLEAN NOT NULL DEFAULT false;
