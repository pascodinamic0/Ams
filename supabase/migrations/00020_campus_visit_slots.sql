-- Campus visit slots tied to online enrollment and event bookings

CREATE TYPE event_purpose AS ENUM ('general', 'campus_visit');

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS purpose event_purpose NOT NULL DEFAULT 'general';

ALTER TABLE event_registrations
  ADD COLUMN IF NOT EXISTS admission_application_id UUID REFERENCES admission_applications(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_event_registrations_admission_unique
  ON event_registrations(admission_application_id)
  WHERE admission_application_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_events_purpose ON events(purpose);

-- Public can read bookable campus visit slots (enrollment flow; may be off the public events page)
CREATE POLICY "Public can read campus visit slots"
  ON events FOR SELECT
  USING (
    purpose = 'campus_visit'
    AND booking_enabled = true
    AND branch_id IN (
      SELECT b.id
      FROM branches b
      JOIN schools s ON s.id = b.school_id
      WHERE s.public_site_enabled = true
        AND s.status = 'approved'
    )
  );

-- Allow booking for public website events OR campus visit slots
DROP POLICY IF EXISTS "Anyone can register for bookable public events" ON event_registrations;

CREATE POLICY "Anyone can register for bookable events"
  ON event_registrations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM events e
      JOIN branches b ON b.id = e.branch_id
      JOIN schools s ON s.id = b.school_id
      WHERE e.id = event_id
        AND e.booking_enabled = true
        AND s.public_site_enabled = true
        AND s.status = 'approved'
        AND (
          e.public_on_website = true
          OR e.purpose = 'campus_visit'
        )
    )
  );
