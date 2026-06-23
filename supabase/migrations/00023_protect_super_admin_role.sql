-- Prevent downgrading platform super administrators or scoping them to a school.

CREATE OR REPLACE FUNCTION public.protect_super_admin_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'UPDATE'
    AND OLD.role = 'super_admin'
    AND NEW.role IS DISTINCT FROM 'super_admin' THEN
    RAISE EXCEPTION 'Cannot change role of a platform super administrator';
  END IF;

  IF NEW.role = 'super_admin' THEN
    NEW.school_id := NULL;
    NEW.branch_id := NULL;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS protect_super_admin_profile ON public.profiles;

CREATE TRIGGER protect_super_admin_profile
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_super_admin_profile();
