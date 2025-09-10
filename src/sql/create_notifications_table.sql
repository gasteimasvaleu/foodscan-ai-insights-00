-- Script SQL para criar a tabela de notificações
-- Execute este script no painel SQL do Supabase

-- Create notifications_sent table
CREATE TABLE IF NOT EXISTS notifications_sent (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  sent_by UUID REFERENCES auth.users(id),
  recipients_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE notifications_sent ENABLE ROW LEVEL SECURITY;

-- Policy for admins to read/write
CREATE POLICY "Admins can manage notifications" ON notifications_sent
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_sent_at ON notifications_sent(sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_sent_by ON notifications_sent(sent_by);