-- Public school website events, bookings, and online enrollment fields

ALTER TABLE events
  ADD COLUMN IF NOT EXISTS public_on_website BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS booking_enabled BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS booking_procedure TEXT,
  ADD COLUMN IF NOT EXISTS location TEXT,
  ADD COLUMN IF NOT EXISTS start_time TIME;

ALTER TABLE admission_applications
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS notes TEXT,
  ADD COLUMN IF NOT EXISTS requires_campus_visit BOOLEAN NOT NULL DEFAULT false;

CREATE TYPE event_registration_status AS ENUM ('pending', 'confirmed', 'cancelled');

CREATE TABLE IF NOT EXISTS event_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  registrant_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  party_size INTEGER NOT NULL DEFAULT 1 CHECK (party_size >= 1 AND party_size <= 20),
  notes TEXT,
  status event_registration_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_event_registrations_event ON event_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_event_registrations_status ON event_registrations(status);

ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

-- Public can read events shown on approved school websites
CREATE POLICY "Public can read website events"
  ON events FOR SELECT
  USING (
    public_on_website = true
    AND branch_id IN (
      SELECT b.id
      FROM branches b
      JOIN schools s ON s.id = b.school_id
      WHERE s.public_site_enabled = true
        AND s.status = 'approved'
    )
  );

-- Public can register for bookable website events
CREATE POLICY "Anyone can register for bookable public events"
  ON event_registrations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM events e
      JOIN branches b ON b.id = e.branch_id
      JOIN schools s ON s.id = b.school_id
      WHERE e.id = event_id
        AND e.booking_enabled = true
        AND e.public_on_website = true
        AND s.public_site_enabled = true
        AND s.status = 'approved'
    )
  );

CREATE POLICY "Operations can read event registrations in their school"
  ON event_registrations FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'super_admin'
    )
    OR event_id IN (
      SELECT e.id
      FROM events e
      JOIN branches b ON b.id = e.branch_id
      JOIN profiles p ON p.school_id = b.school_id
      WHERE p.id = auth.uid()
        AND p.role IN ('operations_manager', 'academic_admin')
    )
  );

CREATE POLICY "Operations can manage event registrations in their school"
  ON event_registrations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM profiles p
      WHERE p.id = auth.uid()
        AND p.role = 'super_admin'
    )
    OR event_id IN (
      SELECT e.id
      FROM events e
      JOIN branches b ON b.id = e.branch_id
      JOIN profiles p ON p.school_id = b.school_id
      WHERE p.id = auth.uid()
        AND p.role IN ('operations_manager', 'academic_admin')
    )
  );
