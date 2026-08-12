-- SET LOCAL is not allowed inside STABLE functions (PostgreSQL).
-- is_conversation_participant is called from conversation RLS during
-- getConversations nested selects, which raised 0A000.
-- Use function-level SET row_security = off instead (same pattern as 00034 / 00050).

CREATE OR REPLACE FUNCTION public.is_conversation_participant(p_conversation_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
DECLARE
  is_participant boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = p_conversation_id
      AND profile_id = auth.uid()
  ) INTO is_participant;
  RETURN COALESCE(is_participant, false);
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_conversation_participant(uuid) TO authenticated;
