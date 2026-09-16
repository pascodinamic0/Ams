-- Align student records with the paper "Fiche d'inscription" used by
-- Groupe Scolaire La Richarde (identity + health sections).

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS school_year INTEGER,
  ADD COLUMN IF NOT EXISTS place_of_birth TEXT,
  ADD COLUMN IF NOT EXISTS previous_school TEXT,
  ADD COLUMN IF NOT EXISTS father_name TEXT,
  ADD COLUMN IF NOT EXISTS mother_name TEXT,
  ADD COLUMN IF NOT EXISTS responsible_profession TEXT,
  ADD COLUMN IF NOT EXISTS contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS address_number TEXT,
  ADD COLUMN IF NOT EXISTS address_avenue TEXT,
  ADD COLUMN IF NOT EXISTS address_quartier TEXT,
  ADD COLUMN IF NOT EXISTS address_commune TEXT,
  ADD COLUMN IF NOT EXISTS chronic_illness BOOLEAN,
  ADD COLUMN IF NOT EXISTS visual_problem BOOLEAN,
  ADD COLUMN IF NOT EXISTS physical_problem BOOLEAN,
  ADD COLUMN IF NOT EXISTS allergies TEXT,
  ADD COLUMN IF NOT EXISTS difficulties TEXT;

ALTER TABLE public.students
  DROP CONSTRAINT IF EXISTS students_school_year_check;

ALTER TABLE public.students
  ADD CONSTRAINT students_school_year_check
  CHECK (school_year IS NULL OR school_year BETWEEN 2000 AND 2100);

CREATE INDEX IF NOT EXISTS idx_students_school_year
  ON public.students (school_id, school_year);

COMMENT ON COLUMN public.students.school_year IS
  'Inscription school-year start (e.g. 2026 for 2026-2027), matching the paper fiche header';
COMMENT ON COLUMN public.students.place_of_birth IS
  'Lieu de naissance from the fiche d''inscription';
COMMENT ON COLUMN public.students.previous_school IS
  'Ecole de provenance from the fiche d''inscription';
COMMENT ON COLUMN public.students.father_name IS
  'Noms du père from the fiche d''inscription';
COMMENT ON COLUMN public.students.mother_name IS
  'Noms de la mère from the fiche d''inscription';
COMMENT ON COLUMN public.students.responsible_profession IS
  'Profession du responsable from the fiche d''inscription';
COMMENT ON COLUMN public.students.contact_phone IS
  'Téléphone from the fiche d''inscription (family contact)';
COMMENT ON COLUMN public.students.address_number IS
  'Adresse n° from the fiche d''inscription';
COMMENT ON COLUMN public.students.address_avenue IS
  'Adresse avenue (AV) from the fiche d''inscription';
COMMENT ON COLUMN public.students.address_quartier IS
  'Adresse quartier (Q/) from the fiche d''inscription';
COMMENT ON COLUMN public.students.address_commune IS
  'Adresse commune (C/) from the fiche d''inscription';
COMMENT ON COLUMN public.students.chronic_illness IS
  'Maladie chronique (Oui/Non) from the fiche d''inscription';
COMMENT ON COLUMN public.students.visual_problem IS
  'Problème visuel (Oui/Non) from the fiche d''inscription';
COMMENT ON COLUMN public.students.physical_problem IS
  'Problème physique (Oui/Non) from the fiche d''inscription';
COMMENT ON COLUMN public.students.allergies IS
  'Allergique à from the fiche d''inscription';
COMMENT ON COLUMN public.students.difficulties IS
  'Difficulté à from the fiche d''inscription';
