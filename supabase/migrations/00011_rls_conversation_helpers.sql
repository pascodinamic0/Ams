-- Fix infinite recursion in conversation_participants RLS policies.
-- Policies that subquery conversation_participants trigger RLS again on the same table.
-- SECURITY DEFINER helpers read participation without re-entering RLS.

CREATE OR REPLACE FUNCTION public.is_conversation_participant(p_conversation_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = p_conversation_id
      AND profile_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION public.is_messaging_staff()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(ARRAY['super_admin', 'academic_admin', 'teacher']::user_role[]);
$$;

GRANT EXECUTE ON FUNCTION public.is_conversation_participant(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_messaging_staff() TO authenticated;

-- conversations
DROP POLICY IF EXISTS "Staff can read conversations in their school" ON conversations;

CREATE POLICY "Staff can read conversations in their school"
  ON conversations FOR SELECT
  USING (
    (
      school_id = public.get_my_school_id()
      AND public.is_messaging_staff()
    )
    OR public.is_conversation_participant(id)
  );

-- conversation_participants
DROP POLICY IF EXISTS "Participants can read conversation participants" ON conversation_participants;

CREATE POLICY "Participants can read conversation participants"
  ON conversation_participants FOR SELECT
  USING (
    public.is_conversation_participant(conversation_id)
    OR public.is_messaging_staff()
  );

DROP POLICY IF EXISTS "Staff can add participants" ON conversation_participants;

CREATE POLICY "Staff can add participants"
  ON conversation_participants FOR INSERT
  WITH CHECK (public.is_messaging_staff());

-- conversation_messages
DROP POLICY IF EXISTS "Participants can read messages" ON conversation_messages;
DROP POLICY IF EXISTS "Participants can send messages" ON conversation_messages;

CREATE POLICY "Participants can read messages"
  ON conversation_messages FOR SELECT
  USING (
    public.is_conversation_participant(conversation_id)
    OR public.is_messaging_staff()
  );

CREATE POLICY "Participants can send messages"
  ON conversation_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND (
      public.is_conversation_participant(conversation_id)
      OR public.is_messaging_staff()
    )
  );
