-- Lesson materials: catch-up packs sent to absent students after attendance

CREATE TYPE lesson_attachment_kind AS ENUM ('file', 'link');

CREATE TABLE lesson_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  teacher_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  lesson_date DATE NOT NULL,
  title TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_lesson_materials_class ON lesson_materials(class_id);
CREATE INDEX idx_lesson_materials_teacher ON lesson_materials(teacher_id);
CREATE INDEX idx_lesson_materials_lesson_date ON lesson_materials(lesson_date);
CREATE INDEX idx_lesson_materials_class_date ON lesson_materials(class_id, lesson_date);

CREATE TABLE lesson_material_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES lesson_materials(id) ON DELETE CASCADE,
  kind lesson_attachment_kind NOT NULL,
  storage_path TEXT,
  url TEXT,
  file_name TEXT,
  mime_type TEXT,
  size_bytes BIGINT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_lesson_material_attachments_material ON lesson_material_attachments(material_id);

CREATE TABLE lesson_material_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES lesson_materials(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(material_id, student_id)
);

CREATE INDEX idx_lesson_material_recipients_material ON lesson_material_recipients(material_id);
CREATE INDEX idx_lesson_material_recipients_student ON lesson_material_recipients(student_id);

-- Teacher teaches class via timetable or homeroom
CREATE OR REPLACE FUNCTION public.teacher_teaches_class(p_teacher_id UUID, p_class_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM timetable_slots ts
    WHERE ts.teacher_id = p_teacher_id AND ts.class_id = p_class_id
  )
  OR EXISTS (
    SELECT 1 FROM classes c
    WHERE c.id = p_class_id AND c.main_teacher_id = p_teacher_id
  );
$$;

GRANT EXECUTE ON FUNCTION public.teacher_teaches_class(UUID, UUID) TO authenticated;

-- RLS: lesson_materials
ALTER TABLE lesson_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read lesson materials they are allowed to see"
  ON lesson_materials FOR SELECT
  USING (
    teacher_id = auth.uid()
    OR id IN (
      SELECT lmr.material_id FROM lesson_material_recipients lmr
      JOIN students s ON s.id = lmr.student_id
      WHERE s.auth_user_id = auth.uid()
    )
    OR id IN (
      SELECT lmr.material_id FROM lesson_material_recipients lmr
      JOIN guardian_students gs ON gs.student_id = lmr.student_id
      JOIN guardians g ON g.id = gs.guardian_id
      WHERE g.auth_user_id = auth.uid()
    )
    OR public.is_academic_portal_role()
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role = 'super_admin')
  );

CREATE POLICY "Teachers can insert lesson materials for their classes"
  ON lesson_materials FOR INSERT
  WITH CHECK (
    teacher_id = auth.uid()
    AND public.teacher_teaches_class(auth.uid(), class_id)
  );

CREATE POLICY "Teachers can update own lesson materials"
  ON lesson_materials FOR UPDATE
  USING (
    teacher_id = auth.uid()
    OR public.is_academic_portal_role()
  );

CREATE POLICY "Teachers can delete own lesson materials"
  ON lesson_materials FOR DELETE
  USING (
    teacher_id = auth.uid()
    OR public.is_academic_portal_role()
  );

-- RLS: lesson_material_attachments
ALTER TABLE lesson_material_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read lesson attachments for visible materials"
  ON lesson_material_attachments FOR SELECT
  USING (
    material_id IN (SELECT id FROM lesson_materials)
  );

CREATE POLICY "Teachers can manage attachments on their materials"
  ON lesson_material_attachments FOR ALL
  USING (
    material_id IN (
      SELECT id FROM lesson_materials
      WHERE teacher_id = auth.uid() OR public.is_academic_portal_role()
    )
  );

-- RLS: lesson_material_recipients
ALTER TABLE lesson_material_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read lesson recipients for visible materials"
  ON lesson_material_recipients FOR SELECT
  USING (
    material_id IN (SELECT id FROM lesson_materials)
  );

CREATE POLICY "Teachers can manage recipients on their materials"
  ON lesson_material_recipients FOR ALL
  USING (
    material_id IN (
      SELECT id FROM lesson_materials
      WHERE teacher_id = auth.uid() OR public.is_academic_portal_role()
    )
  );

-- Storage bucket for lesson material files (private; signed URLs via server)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'lesson-materials',
  'lesson-materials',
  false,
  52428800,
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'video/webm',
    'video/quicktime'
  ]
)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Teachers can upload lesson materials"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'lesson-materials'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] IN (
      SELECT school_id::text FROM profiles WHERE id = auth.uid() AND school_id IS NOT NULL
    )
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

CREATE POLICY "Authenticated users can read lesson material files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'lesson-materials'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Teachers can update own lesson material files"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'lesson-materials'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );

CREATE POLICY "Teachers can delete own lesson material files"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'lesson-materials'
    AND (storage.foldername(name))[2] = auth.uid()::text
  );
