-- School-wide live sync: one tick row per school, updated by data-change triggers.
-- Clients subscribe to postgres_changes on this table and call router.refresh().

CREATE TABLE IF NOT EXISTS public.school_sync_ticks (
  school_id UUID PRIMARY KEY REFERENCES public.schools(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.school_sync_ticks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read their school sync tick" ON public.school_sync_ticks;
CREATE POLICY "Users can read their school sync tick"
  ON public.school_sync_ticks
  FOR SELECT
  USING (
    school_id = public.get_my_school_id()
    OR public.is_super_admin()
  );

GRANT SELECT ON public.school_sync_ticks TO authenticated;

CREATE OR REPLACE FUNCTION public.touch_school_sync()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  sid uuid;
  payload jsonb;
  kind text := COALESCE(TG_ARGV[0], 'school');
BEGIN
  payload := to_jsonb(COALESCE(NEW, OLD));

  CASE kind
    WHEN 'branch' THEN
      SELECT b.school_id INTO sid
      FROM public.branches b
      WHERE b.id = (payload->>'branch_id')::uuid;
    WHEN 'student' THEN
      SELECT s.school_id INTO sid
      FROM public.students s
      WHERE s.id = (payload->>'student_id')::uuid;
    WHEN 'conversation' THEN
      SELECT c.school_id INTO sid
      FROM public.conversations c
      WHERE c.id = (payload->>'conversation_id')::uuid;
    WHEN 'invoice' THEN
      SELECT st.school_id INTO sid
      FROM public.fee_invoices fi
      JOIN public.students st ON st.id = fi.student_id
      WHERE fi.id = (payload->>'invoice_id')::uuid;
    WHEN 'class' THEN
      SELECT b.school_id INTO sid
      FROM public.classes cl
      JOIN public.branches b ON b.id = cl.branch_id
      WHERE cl.id = (payload->>'class_id')::uuid;
    WHEN 'staff' THEN
      SELECT COALESCE(st.school_id, b.school_id) INTO sid
      FROM public.staff st
      LEFT JOIN public.branches b ON b.id = st.branch_id
      WHERE st.id = (payload->>'staff_id')::uuid;
    ELSE
      sid := (payload->>'school_id')::uuid;
  END CASE;

  IF sid IS NULL THEN
    RETURN NULL;
  END IF;

  INSERT INTO public.school_sync_ticks (school_id, updated_at)
  VALUES (sid, clock_timestamp())
  ON CONFLICT (school_id) DO UPDATE
    SET updated_at = EXCLUDED.updated_at;

  RETURN NULL;
END;
$$;

REVOKE ALL ON FUNCTION public.touch_school_sync() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.touch_school_sync() FROM anon, authenticated;

DO $$
DECLARE
  r record;
  kind text;
  excluded text[] := ARRAY[
    'school_sync_ticks',
    'audit_logs',
    'push_subscriptions',
    'notification_preferences',
    'class_reminder_log',
    'roles',
    'permissions',
    'feature_toggles',
    'notifications'
  ];
BEGIN
  FOR r IN
    SELECT
      n.nspname AS schema_name,
      c.relname AS table_name,
      EXISTS (
        SELECT 1 FROM information_schema.columns col
        WHERE col.table_schema = n.nspname
          AND col.table_name = c.relname
          AND col.column_name = 'school_id'
      ) AS has_school,
      EXISTS (
        SELECT 1 FROM information_schema.columns col
        WHERE col.table_schema = n.nspname
          AND col.table_name = c.relname
          AND col.column_name = 'branch_id'
      ) AS has_branch,
      EXISTS (
        SELECT 1 FROM information_schema.columns col
        WHERE col.table_schema = n.nspname
          AND col.table_name = c.relname
          AND col.column_name = 'student_id'
      ) AS has_student,
      EXISTS (
        SELECT 1 FROM information_schema.columns col
        WHERE col.table_schema = n.nspname
          AND col.table_name = c.relname
          AND col.column_name = 'conversation_id'
      ) AS has_conversation,
      EXISTS (
        SELECT 1 FROM information_schema.columns col
        WHERE col.table_schema = n.nspname
          AND col.table_name = c.relname
          AND col.column_name = 'invoice_id'
      ) AS has_invoice,
      EXISTS (
        SELECT 1 FROM information_schema.columns col
        WHERE col.table_schema = n.nspname
          AND col.table_name = c.relname
          AND col.column_name = 'class_id'
      ) AS has_class,
      EXISTS (
        SELECT 1 FROM information_schema.columns col
        WHERE col.table_schema = n.nspname
          AND col.table_name = c.relname
          AND col.column_name = 'staff_id'
      ) AS has_staff
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public'
      AND c.relkind = 'r'
      AND c.relname <> ALL (excluded)
  LOOP
    kind := CASE
      WHEN r.has_school THEN 'school'
      WHEN r.has_branch THEN 'branch'
      WHEN r.has_student THEN 'student'
      WHEN r.has_conversation THEN 'conversation'
      WHEN r.has_invoice THEN 'invoice'
      WHEN r.has_class THEN 'class'
      WHEN r.has_staff THEN 'staff'
      ELSE NULL
    END;

    IF kind IS NULL THEN
      CONTINUE;
    END IF;

    EXECUTE format('DROP TRIGGER IF EXISTS trg_school_sync ON public.%I', r.table_name);
    EXECUTE format(
      'CREATE TRIGGER trg_school_sync
       AFTER INSERT OR UPDATE OR DELETE ON public.%I
       FOR EACH ROW
       EXECUTE FUNCTION public.touch_school_sync(%L)',
      r.table_name,
      kind
    );
  END LOOP;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication p
    JOIN pg_publication_rel pr ON pr.prpubid = p.oid
    JOIN pg_class c ON c.oid = pr.prrelid
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE p.pubname = 'supabase_realtime'
      AND n.nspname = 'public'
      AND c.relname = 'school_sync_ticks'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.school_sync_ticks;
  END IF;
END $$;
