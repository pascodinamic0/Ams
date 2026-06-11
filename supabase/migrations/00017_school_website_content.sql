-- Rich school public website content (programs, gallery, hero copy, social links)
ALTER TABLE schools
  ADD COLUMN IF NOT EXISTS website_content JSONB NOT NULL DEFAULT '{}'::jsonb;
