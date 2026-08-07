-- School-wide UI language. Once set, every user in the school sees this locale only.

ALTER TABLE public.schools
  ADD COLUMN IF NOT EXISTS locale TEXT NOT NULL DEFAULT 'en';

ALTER TABLE public.schools
  DROP CONSTRAINT IF EXISTS schools_locale_check;

ALTER TABLE public.schools
  ADD CONSTRAINT schools_locale_check
  CHECK (locale IN ('en', 'fr'));

COMMENT ON COLUMN public.schools.locale IS
  'Locked UI language for the whole school (en|fr). Overrides personal language cookies.';
