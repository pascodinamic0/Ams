-- Student profile photo for onboarding and records.

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS photo_url TEXT;
