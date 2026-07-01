-- Messaging completeness: Realtime for live chat + parent-initiated conversations

-- Enable Realtime on conversation_messages (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'conversation_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE conversation_messages;
  END IF;
END $$;

-- Helper: parent is linked to student via guardian_students
CREATE OR REPLACE FUNCTION public.is_parent_of_student(p_student_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  linked boolean;
BEGIN
  SET LOCAL row_security = off;
  SELECT EXISTS (
    SELECT 1
    FROM public.guardian_students gs
    JOIN public.guardians g ON g.id = gs.guardian_id
    WHERE gs.student_id = p_student_id
      AND g.auth_user_id = auth.uid()
  ) INTO linked;
  RETURN COALESCE(linked, false);
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_parent_of_student(uuid) TO authenticated;

-- Helper: parent created this conversation
CREATE OR REPLACE FUNCTION public.is_conversation_creator(p_conversation_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_creator boolean;
BEGIN
  SET LOCAL row_security = off;
  SELECT EXISTS (
    SELECT 1 FROM public.conversations
    WHERE id = p_conversation_id
      AND created_by = auth.uid()
  ) INTO is_creator;
  RETURN COALESCE(is_creator, false);
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_conversation_creator(uuid) TO authenticated;

-- Parents can create conversations about their linked children
CREATE POLICY "Parents can create conversations for linked students"
  ON conversations FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND public.has_role(ARRAY['parent']::user_role[])
    AND school_id = public.get_my_school_id()
    AND (
      student_id IS NULL
      OR public.is_parent_of_student(student_id)
    )
  );

-- Parents can add participants to conversations they created
CREATE POLICY "Parents can add participants to their conversations"
  ON conversation_participants FOR INSERT
  WITH CHECK (
    public.has_role(ARRAY['parent']::user_role[])
    AND public.is_conversation_creator(conversation_id)
  );
