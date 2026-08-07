-- Collect first / middle / last names for students and guardians.
-- Guardians keep `name` as a denormalized display string for existing UI.

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS middle_name TEXT;

ALTER TABLE public.guardians
  ADD COLUMN IF NOT EXISTS first_name TEXT,
  ADD COLUMN IF NOT EXISTS middle_name TEXT,
  ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Backfill guardian name parts from the existing full name.
UPDATE public.guardians
SET
  first_name = COALESCE(
    first_name,
    NULLIF(split_part(trim(name), ' ', 1), '')
  ),
  last_name = COALESCE(
    last_name,
    CASE
      WHEN position(' ' IN trim(name)) = 0 THEN trim(name)
      ELSE NULLIF(regexp_replace(trim(name), '^.*\s+', ''), '')
    END
  ),
  middle_name = COALESCE(
    middle_name,
    NULLIF(
      trim(both ' ' FROM regexp_replace(
        trim(name),
        '^\S+\s*(.*)\s+\S+$',
        '\1'
      )),
      ''
    )
  )
WHERE first_name IS NULL OR last_name IS NULL;
