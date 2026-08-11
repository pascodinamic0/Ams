-- Conversation archive: hide closed threads; same topic can restart after archive.

ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS archived_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_conversations_archived_at
  ON public.conversations (archived_at);

-- Participants (and messaging staff) can archive / unarchive; creators keep full update.
DROP POLICY IF EXISTS "Creator can update conversation" ON public.conversations;
DROP POLICY IF EXISTS "Participants can archive conversations" ON public.conversations;

CREATE POLICY "Creator can update conversation"
  ON public.conversations FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Participants can archive conversations"
  ON public.conversations FOR UPDATE
  USING (
    public.is_conversation_participant(id)
    OR public.is_messaging_staff()
  )
  WITH CHECK (
    public.is_conversation_participant(id)
    OR public.is_messaging_staff()
  );
