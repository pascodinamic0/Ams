-- Allow a school to run more than one level (e.g. nursery + primary).

ALTER TABLE public.schools
  ADD COLUMN IF NOT EXISTS school_levels public.school_level[];

UPDATE public.schools
SET school_levels = CASE
  WHEN school_level IS NULL THEN NULL
  WHEN school_level = 'combined' THEN ARRAY['primary'::public.school_level, 'secondary'::public.school_level]
  ELSE ARRAY[school_level]
END
WHERE school_levels IS NULL AND school_level IS NOT NULL;

ALTER TABLE public.schools
  DROP CONSTRAINT IF EXISTS schools_school_levels_not_empty;

ALTER TABLE public.schools
  ADD CONSTRAINT schools_school_levels_not_empty
  CHECK (school_levels IS NULL OR cardinality(school_levels) >= 1);

COMMENT ON COLUMN public.schools.school_levels IS
  'School types used to preset grades during structure onboarding. Multiple levels allowed.';
