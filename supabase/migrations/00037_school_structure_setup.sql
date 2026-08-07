-- School structure wizard: level + completion timestamp for first-run class setup.

DO $$ BEGIN
  CREATE TYPE public.school_level AS ENUM (
    'nursery',
    'primary',
    'secondary',
    'combined',
    'university',
    'other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.schools
  ADD COLUMN IF NOT EXISTS school_level public.school_level,
  ADD COLUMN IF NOT EXISTS structure_setup_completed_at TIMESTAMPTZ;

COMMENT ON COLUMN public.schools.school_level IS
  'High-level school type used to preset grades during structure onboarding.';

COMMENT ON COLUMN public.schools.structure_setup_completed_at IS
  'When the academic admin finished or skipped the school structure wizard.';

-- Only schools that already have classes skip the wizard.
-- Empty / pending schools keep NULL so academic admins get the progressive setup.
UPDATE public.schools s
SET structure_setup_completed_at = now()
WHERE structure_setup_completed_at IS NULL
  AND EXISTS (
    SELECT 1
    FROM public.branches b
    JOIN public.classes c ON c.branch_id = b.id
    WHERE b.school_id = s.id
  );
