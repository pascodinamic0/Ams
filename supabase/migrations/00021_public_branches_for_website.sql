-- Allow public school websites to resolve branch IDs for event queries

CREATE POLICY "Public can read branches of public schools"
  ON branches FOR SELECT
  USING (
    school_id IN (
      SELECT id
      FROM schools
      WHERE public_site_enabled = true
        AND status = 'approved'
    )
  );
