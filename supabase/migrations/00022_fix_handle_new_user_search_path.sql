-- OAuth/email signups run handle_new_user from auth context where public types
-- are not on search_path, causing: type "user_role" does not exist.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      (NEW.raw_user_meta_data->>'role')::public.user_role,
      'student'::public.user_role
    )
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(EXCLUDED.name, profiles.name),
    role = COALESCE(
      (NEW.raw_user_meta_data->>'role')::public.user_role,
      profiles.role
    ),
    updated_at = now();
  RETURN NEW;
END;
$$;
