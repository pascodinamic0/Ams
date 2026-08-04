-- School coordination tasks and discipline incidents for role workspaces.

DO $$ BEGIN
  CREATE TYPE public.school_task_status AS ENUM ('todo', 'in_progress', 'blocked', 'done');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.school_task_priority AS ENUM ('low', 'medium', 'high');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.discipline_severity AS ENUM ('low', 'medium', 'high');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE public.discipline_status AS ENUM ('open', 'monitoring', 'resolved', 'escalated');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.school_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  department TEXT NOT NULL DEFAULT 'general',
  status public.school_task_status NOT NULL DEFAULT 'todo',
  priority public.school_task_priority NOT NULL DEFAULT 'medium',
  due_date DATE,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_school_tasks_school ON public.school_tasks(school_id);
CREATE INDEX IF NOT EXISTS idx_school_tasks_status ON public.school_tasks(status);
CREATE INDEX IF NOT EXISTS idx_school_tasks_assigned ON public.school_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_school_tasks_due ON public.school_tasks(due_date);

CREATE TABLE IF NOT EXISTS public.discipline_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  severity public.discipline_severity NOT NULL DEFAULT 'medium',
  status public.discipline_status NOT NULL DEFAULT 'open',
  incident_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reported_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_discipline_incidents_school ON public.discipline_incidents(school_id);
CREATE INDEX IF NOT EXISTS idx_discipline_incidents_status ON public.discipline_incidents(status);
CREATE INDEX IF NOT EXISTS idx_discipline_incidents_student ON public.discipline_incidents(student_id);

ALTER TABLE public.school_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discipline_incidents ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_task_workspace_role()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(ARRAY[
    'super_admin',
    'academic_admin',
    'admin_coordinator',
    'principal',
    'registrar',
    'admissions_officer',
    'pedagogy_coordinator'
  ]::public.user_role[]);
$$;

CREATE OR REPLACE FUNCTION public.is_discipline_workspace_role()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(ARRAY[
    'super_admin',
    'academic_admin',
    'principal',
    'discipline_officer',
    'supervisor',
    'admin_coordinator'
  ]::public.user_role[]);
$$;

GRANT EXECUTE ON FUNCTION public.is_task_workspace_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_discipline_workspace_role() TO authenticated;

DROP POLICY IF EXISTS "Task roles can read school tasks" ON public.school_tasks;
CREATE POLICY "Task roles can read school tasks"
  ON public.school_tasks FOR SELECT
  USING (
    school_id = public.get_my_school_id()
    AND public.is_task_workspace_role()
  );

DROP POLICY IF EXISTS "Task roles can manage school tasks" ON public.school_tasks;
CREATE POLICY "Task roles can manage school tasks"
  ON public.school_tasks FOR ALL
  USING (
    school_id = public.get_my_school_id()
    AND public.is_task_workspace_role()
  );

DROP POLICY IF EXISTS "Discipline roles can read incidents" ON public.discipline_incidents;
CREATE POLICY "Discipline roles can read incidents"
  ON public.discipline_incidents FOR SELECT
  USING (
    school_id = public.get_my_school_id()
    AND public.is_discipline_workspace_role()
  );

DROP POLICY IF EXISTS "Discipline roles can manage incidents" ON public.discipline_incidents;
CREATE POLICY "Discipline roles can manage incidents"
  ON public.discipline_incidents FOR ALL
  USING (
    school_id = public.get_my_school_id()
    AND public.is_discipline_workspace_role()
  );
