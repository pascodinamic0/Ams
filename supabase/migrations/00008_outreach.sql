-- Outreach & Chat module: conversations, campaigns, fee_reminder_settings

-- ─────────────────────────────────────────────
-- CONVERSATIONS (real-time chat between staff and parents)
-- ─────────────────────────────────────────────

CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE SET NULL,
  title TEXT,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_conversations_school ON conversations(school_id);
CREATE INDEX idx_conversations_student ON conversations(student_id);
CREATE INDEX idx_conversations_created_by ON conversations(created_by);

-- Who is participating in each conversation
CREATE TABLE conversation_participants (
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ,
  PRIMARY KEY (conversation_id, profile_id)
);

CREATE INDEX idx_conv_participants_profile ON conversation_participants(profile_id);

-- Individual chat messages
CREATE TABLE conversation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_conv_messages_conversation ON conversation_messages(conversation_id);
CREATE INDEX idx_conv_messages_created ON conversation_messages(created_at);

-- ─────────────────────────────────────────────
-- CAMPAIGNS (mass WhatsApp / SMS outreach)
-- ─────────────────────────────────────────────

CREATE TYPE campaign_status AS ENUM ('draft', 'sending', 'sent', 'failed');
CREATE TYPE campaign_channel AS ENUM ('whatsapp', 'sms', 'in_app');

CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  channel campaign_channel DEFAULT 'whatsapp',
  -- 'all_parents' | 'class:<uuid>' | 'branch:<uuid>'
  target TEXT NOT NULL DEFAULT 'all_parents',
  status campaign_status DEFAULT 'draft',
  sent_at TIMESTAMPTZ,
  total_recipients INTEGER DEFAULT 0,
  delivered_count INTEGER DEFAULT 0,
  failed_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_campaigns_school ON campaigns(school_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_created ON campaigns(created_at);

-- Per-recipient delivery log
CREATE TABLE campaign_recipients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  guardian_id UUID REFERENCES guardians(id) ON DELETE SET NULL,
  phone TEXT NOT NULL,
  name TEXT,
  -- 'pending' | 'delivered' | 'failed'
  status TEXT NOT NULL DEFAULT 'pending',
  error TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_campaign_recipients_campaign ON campaign_recipients(campaign_id);
CREATE INDEX idx_campaign_recipients_status ON campaign_recipients(status);

-- ─────────────────────────────────────────────
-- FEE REMINDER SETTINGS (per school)
-- ─────────────────────────────────────────────

CREATE TABLE fee_reminder_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE UNIQUE,
  grace_period_days INTEGER NOT NULL DEFAULT 7,
  -- Days before due date to send reminder (e.g. {3, 1})
  remind_days_before INTEGER[] DEFAULT '{3,1}',
  remind_on_due_day BOOLEAN DEFAULT true,
  remind_on_grace_expiry BOOLEAN DEFAULT true,
  morning_message_template TEXT NOT NULL DEFAULT 'Dear {guardian_name}, this is a reminder that {student_name}''s school fees of {currency}{amount} are due on {due_date}. Kindly make payment to avoid disruption.',
  final_warning_template TEXT NOT NULL DEFAULT 'Dear {guardian_name}, your payment grace period has ended. Please do not bring {student_name} to school until the outstanding balance of {currency}{amount} is cleared. Contact the school office for assistance.',
  currency_symbol TEXT NOT NULL DEFAULT '$',
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────────
-- RLS: conversations
-- ─────────────────────────────────────────────

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read conversations in their school"
  ON conversations FOR SELECT
  USING (
    school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'academic_admin', 'teacher'))
    OR id IN (SELECT conversation_id FROM conversation_participants WHERE profile_id = auth.uid())
  );

CREATE POLICY "Staff can create conversations"
  ON conversations FOR INSERT
  WITH CHECK (
    created_by = auth.uid()
    AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'academic_admin', 'teacher'))
  );

CREATE POLICY "Creator can update conversation"
  ON conversations FOR UPDATE
  USING (created_by = auth.uid());

-- ─────────────────────────────────────────────
-- RLS: conversation_participants
-- ─────────────────────────────────────────────

ALTER TABLE conversation_participants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can read conversation participants"
  ON conversation_participants FOR SELECT
  USING (
    conversation_id IN (SELECT conversation_id FROM conversation_participants WHERE profile_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'academic_admin', 'teacher'))
  );

CREATE POLICY "Staff can add participants"
  ON conversation_participants FOR INSERT
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'academic_admin', 'teacher'))
  );

CREATE POLICY "Participants can update their own last_read"
  ON conversation_participants FOR UPDATE
  USING (profile_id = auth.uid());

-- ─────────────────────────────────────────────
-- RLS: conversation_messages
-- ─────────────────────────────────────────────

ALTER TABLE conversation_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Participants can read messages"
  ON conversation_messages FOR SELECT
  USING (
    conversation_id IN (SELECT conversation_id FROM conversation_participants WHERE profile_id = auth.uid())
    OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'academic_admin', 'teacher'))
  );

CREATE POLICY "Participants can send messages"
  ON conversation_messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND (
      conversation_id IN (SELECT conversation_id FROM conversation_participants WHERE profile_id = auth.uid())
      OR EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'academic_admin', 'teacher'))
    )
  );

-- ─────────────────────────────────────────────
-- RLS: campaigns
-- ─────────────────────────────────────────────

ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can read campaigns in their school"
  ON campaigns FOR SELECT
  USING (
    school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'academic_admin', 'finance_officer'))
  );

CREATE POLICY "Admins can manage campaigns"
  ON campaigns FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'academic_admin'))
  );

-- ─────────────────────────────────────────────
-- RLS: campaign_recipients
-- ─────────────────────────────────────────────

ALTER TABLE campaign_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can read campaign recipients"
  ON campaign_recipients FOR SELECT
  USING (
    campaign_id IN (SELECT id FROM campaigns WHERE school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid()))
    AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'academic_admin'))
  );

CREATE POLICY "Service can insert campaign recipients"
  ON campaign_recipients FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Service can update campaign recipients"
  ON campaign_recipients FOR UPDATE
  USING (true);

-- ─────────────────────────────────────────────
-- RLS: fee_reminder_settings
-- ─────────────────────────────────────────────

ALTER TABLE fee_reminder_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Finance and admin can read settings"
  ON fee_reminder_settings FOR SELECT
  USING (
    school_id IN (SELECT school_id FROM profiles WHERE id = auth.uid())
    AND EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'finance_officer'))
  );

CREATE POLICY "Finance and admin can manage settings"
  ON fee_reminder_settings FOR ALL
  USING (
    EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.role IN ('super_admin', 'finance_officer'))
  );

-- Allow service role (cron) to read all settings
CREATE POLICY "Service can read all fee reminder settings"
  ON fee_reminder_settings FOR SELECT
  USING (true);
