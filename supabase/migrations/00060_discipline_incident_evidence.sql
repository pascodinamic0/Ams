-- Teachers can log a discipline incident with a photo even when they
-- do not know the student's name. Unidentified incidents create a
-- school-wide admin task so leadership can identify the student.

ALTER TABLE public.discipline_incidents
  ADD COLUMN IF NOT EXISTS evidence_url TEXT,
  ADD COLUMN IF NOT EXISTS task_id UUID REFERENCES public.school_tasks(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_discipline_incidents_task
  ON public.discipline_incidents (task_id);

CREATE OR REPLACE FUNCTION public.create_discipline_identification_task()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  v_task_id UUID;
  v_title TEXT;
  v_description TEXT;
BEGIN
  IF NEW.student_id IS NOT NULL OR NEW.task_id IS NOT NULL THEN
    RETURN NEW;
  END IF;

  v_title := format(
    'Identify student: %s',
    COALESCE(NULLIF(btrim(NEW.title), ''), 'photo report')
  );

  v_description := format(
    E'A teacher logged a discipline incident without a student name.\nIdentify the student so follow-up is not delayed.\nSeverity: %s\nDate: %s\n%s%s',
    NEW.severity::text,
    NEW.incident_date::text,
    CASE
      WHEN NEW.description IS NOT NULL AND btrim(NEW.description) <> '' THEN
        E'Notes: ' || NEW.description || E'\n'
      ELSE ''
    END,
    CASE
      WHEN NEW.evidence_url IS NOT NULL AND btrim(NEW.evidence_url) <> '' THEN
        E'Photo: ' || NEW.evidence_url
      ELSE 'No photo attached.'
    END
  );

  INSERT INTO public.school_tasks (
    school_id,
    title,
    description,
    department,
    priority,
    created_by,
    related_type,
    related_id
  ) VALUES (
    NEW.school_id,
    v_title,
    v_description,
    'everyone',
    CASE NEW.severity
      WHEN 'high' THEN 'high'::public.school_task_priority
      WHEN 'low' THEN 'low'::public.school_task_priority
      ELSE 'medium'::public.school_task_priority
    END,
    NEW.reported_by,
    'discipline_incident',
    NEW.id
  )
  RETURNING id INTO v_task_id;

  NEW.task_id := v_task_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS discipline_create_identification_task ON public.discipline_incidents;
CREATE TRIGGER discipline_create_identification_task
  BEFORE INSERT ON public.discipline_incidents
  FOR EACH ROW
  EXECUTE FUNCTION public.create_discipline_identification_task();

CREATE OR REPLACE FUNCTION public.complete_discipline_identification_task()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  v_name TEXT;
BEGIN
  IF NEW.task_id IS NULL THEN
    RETURN NEW;
  END IF;

  IF OLD.student_id IS NULL AND NEW.student_id IS NOT NULL THEN
    SELECT trim(both ' ' FROM concat_ws(' ', s.first_name, NULLIF(s.middle_name, ''), s.last_name))
    INTO v_name
    FROM public.students s
    WHERE s.id = NEW.student_id;

    UPDATE public.school_tasks
    SET
      status = 'done',
      description = format('Identified as %s. Follow-up stays on the discipline desk.', COALESCE(v_name, 'the student')),
      updated_at = now()
    WHERE id = NEW.task_id
      AND status <> 'done';
  ELSIF NEW.status = 'resolved' AND OLD.status IS DISTINCT FROM 'resolved' THEN
    UPDATE public.school_tasks
    SET status = 'done', updated_at = now()
    WHERE id = NEW.task_id
      AND status <> 'done';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS discipline_complete_identification_task ON public.discipline_incidents;
CREATE TRIGGER discipline_complete_identification_task
  AFTER UPDATE OF student_id, status ON public.discipline_incidents
  FOR EACH ROW
  EXECUTE FUNCTION public.complete_discipline_identification_task();

-- Academic admins (task board) can see incident photos and name the student.
DROP POLICY IF EXISTS "Task roles can read incidents for identification" ON public.discipline_incidents;
CREATE POLICY "Task roles can read incidents for identification"
  ON public.discipline_incidents FOR SELECT
  USING (
    school_id = public.get_my_school_id()
    AND public.is_task_workspace_role()
  );

DROP POLICY IF EXISTS "Task roles can identify incident students" ON public.discipline_incidents;
CREATE POLICY "Task roles can identify incident students"
  ON public.discipline_incidents FOR UPDATE
  USING (
    school_id = public.get_my_school_id()
    AND public.is_task_workspace_role()
  )
  WITH CHECK (
    school_id = public.get_my_school_id()
    AND public.is_task_workspace_role()
  );
