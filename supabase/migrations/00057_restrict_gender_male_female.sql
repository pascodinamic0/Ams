-- Restrict student and admission gender to male or female.
-- Existing values outside that set (including "other") are cleared.

UPDATE public.students
SET gender = CASE lower(trim(gender))
  WHEN 'male' THEN 'male'
  WHEN 'female' THEN 'female'
  WHEN 'm' THEN 'male'
  WHEN 'f' THEN 'female'
  WHEN 'masculin' THEN 'male'
  WHEN 'feminin' THEN 'female'
  WHEN 'féminin' THEN 'female'
  ELSE NULL
END
WHERE gender IS NOT NULL
  AND gender NOT IN ('male', 'female');

UPDATE public.admission_applications
SET gender = CASE lower(trim(gender))
  WHEN 'male' THEN 'male'
  WHEN 'female' THEN 'female'
  WHEN 'm' THEN 'male'
  WHEN 'f' THEN 'female'
  WHEN 'masculin' THEN 'male'
  WHEN 'feminin' THEN 'female'
  WHEN 'féminin' THEN 'female'
  ELSE NULL
END
WHERE gender IS NOT NULL
  AND gender NOT IN ('male', 'female');

ALTER TABLE public.students
  DROP CONSTRAINT IF EXISTS students_gender_male_female;

ALTER TABLE public.students
  ADD CONSTRAINT students_gender_male_female
  CHECK (gender IS NULL OR gender IN ('male', 'female'));

ALTER TABLE public.admission_applications
  DROP CONSTRAINT IF EXISTS admission_applications_gender_male_female;

ALTER TABLE public.admission_applications
  ADD CONSTRAINT admission_applications_gender_male_female
  CHECK (gender IS NULL OR gender IN ('male', 'female'));
