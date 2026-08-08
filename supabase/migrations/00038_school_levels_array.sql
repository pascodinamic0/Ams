-- Allow schools to cover multiple levels (e.g. nursery + primary + secondary).

ALTER TABLE public.schools
  ADD COLUMN IF NOT EXISTS school_levels public.school_level[];

COMMENT ON COLUMN public.schools.school_levels IS
  'All school levels covered by the institution (multi-select from structure onboarding).';

-- Backfill from the legacy single school_level column.
UPDATE public.schools
SET school_levels = ARRAY[school_level]
WHERE school_level IS NOT NULL
  AND (school_levels IS NULL OR cardinality(school_levels) = 0);

-- Expand historical "combined" into primary + secondary for clearer multi-select data.
UPDATE public.schools
SET school_levels = ARRAY['primary', 'secondary']::public.school_level[]
WHERE school_levels = ARRAY['combined']::public.school_level[];
