-- Fix infinite recursion: SQL SECURITY DEFINER helpers can be inlined into RLS
-- policies, so the inner SELECT runs as the caller and re-enters RLS.
-- plpgsql + row_security = off keeps the helper outside the policy recursion chain.

CREATE OR REPLACE FUNCTION public.is_conversation_participant(p_conversation_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = p_conversation_id
      AND profile_id = auth.uid()
  );
END;
$$;
