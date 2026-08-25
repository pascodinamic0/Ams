-- Allow students to be marked pending (not yet fully enrolled)

ALTER TYPE student_status ADD VALUE IF NOT EXISTS 'pending';
