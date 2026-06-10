-- Harden conversation RLS helpers: SET LOCAL row_security inside the function body
-- so participation checks cannot be inlined back into policy evaluation.

CREATE OR REPLACE FUNCTION public.is_conversation_participant(p_conversation_id uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_participant boolean;
BEGIN
  SET LOCAL row_security = off;
  SELECT EXISTS (
    SELECT 1 FROM public.conversation_participants
    WHERE conversation_id = p_conversation_id
      AND profile_id = auth.uid()
  ) INTO is_participant;
  RETURN COALESCE(is_participant, false);
END;
$$;

CREATE OR REPLACE FUNCTION public.is_messaging_staff()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_staff boolean;
BEGIN
  SET LOCAL row_security = off;
  SELECT public.has_role(ARRAY['super_admin', 'academic_admin', 'teacher']::user_role[])
  INTO is_staff;
  RETURN COALESCE(is_staff, false);
END;
$$;
