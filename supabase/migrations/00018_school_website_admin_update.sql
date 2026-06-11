-- School academic admins can update their own school's public website settings
CREATE POLICY "School admins can update their school website"
  ON schools FOR UPDATE
  USING (
    public.is_school_admin()
    AND id = public.get_my_school_id()
  )
  WITH CHECK (
    public.is_school_admin()
    AND id = public.get_my_school_id()
  );
