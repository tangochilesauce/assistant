-- Run this in the Supabase SQL Editor to create the events table
-- Dashboard: https://supabase.com/dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  date DATE NOT NULL,
  time TEXT,
  color TEXT NOT NULL DEFAULT '#6b7280',
  project_slug TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Allow anon access (same pattern as todos/notes)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all for anon" ON events FOR ALL USING (true) WITH CHECK (true);
