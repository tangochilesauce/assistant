-- JEFF Database Setup
-- Run this in Supabase Dashboard > SQL Editor
-- https://supabase.com/dashboard/project/muowpjabnjkqgwgzfmoj/sql

-- ═══════════════════════════════════════════════════════════════
-- TODOS
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_slug TEXT NOT NULL,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    due_date TEXT,
    sort_order REAL DEFAULT 0,
    status TEXT DEFAULT 'todo',
    tags JSONB DEFAULT '[]'::jsonb
);

-- ═══════════════════════════════════════════════════════════════
-- SETTINGS (key-value store)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value JSONB,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- TRANSACTIONS (financial tracking)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    amount NUMERIC NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    description TEXT NOT NULL,
    vendor TEXT,
    is_recurring BOOLEAN DEFAULT false,
    recurrence_rule TEXT,
    recurrence_anchor DATE,
    income_status TEXT,
    parent_recurring_id UUID,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- KANBAN COLUMNS (per-project column overrides)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS kanban_columns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_slug TEXT NOT NULL,
    column_id TEXT NOT NULL,
    label TEXT NOT NULL,
    color TEXT,
    sort_order REAL DEFAULT 0,
    UNIQUE (project_slug, column_id)
);

-- ═══════════════════════════════════════════════════════════════
-- DREAMWATCH PIPELINE (video upload tracking)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS dreamwatch_pipeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    basename TEXT NOT NULL,
    title TEXT,
    video_file TEXT,
    thumb_file TEXT,
    video_size_mb REAL DEFAULT 0,
    thumb_size_mb REAL DEFAULT 0,
    video_date TEXT,
    thumb_date TEXT,
    card_status TEXT DEFAULT 'QUEUED',
    is_active BOOLEAN DEFAULT false,
    state TEXT DEFAULT 'STEP0_META',
    step INTEGER DEFAULT 0,
    total_steps INTEGER DEFAULT 6,
    progress REAL DEFAULT 0,
    step_label TEXT,
    encode_pct REAL DEFAULT 0,
    encoded_time TEXT,
    speed TEXT,
    eta TEXT,
    total_time TEXT DEFAULT '0:00:00',
    file_size TEXT,
    upload_pct REAL DEFAULT 0,
    youtube_url TEXT,
    live_bytes BIGINT DEFAULT 0,
    total_bytes BIGINT DEFAULT 0,
    publish_target TEXT,
    publish_target_display TEXT,
    description TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    thumb_base64 TEXT,
    sort_date TEXT,
    synced_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- DREAMWATCH CALENDAR (streak tracking + auto-scheduling)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS dreamwatch_calendar (
    date DATE PRIMARY KEY,
    status TEXT NOT NULL DEFAULT 'empty',      -- 'published' | 'queued' | 'empty'
    video_title TEXT,
    youtube_url TEXT,
    youtube_video_id TEXT,
    published_at TIMESTAMPTZ,
    queued_basename TEXT,                       -- links to dreamwatch_pipeline.basename
    scheduled_time TEXT,                        -- ISO 8601 with ET offset, e.g. 2026-02-20T17:00:00-05:00
    synced_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- NOTES (per-project scratchpad / intel capture)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_slug TEXT NOT NULL,
    content TEXT NOT NULL,
    tags JSONB DEFAULT '[]'::jsonb,
    pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- TANGO ORDERS (production order tracking)
-- ═══════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS tango_orders (
    id TEXT PRIMARY KEY,
    channel TEXT NOT NULL,
    title TEXT NOT NULL,
    value TEXT,
    date_str TEXT,
    stage TEXT DEFAULT 'new',
    ship_to TEXT,
    notes TEXT,
    items JSONB DEFAULT '[]'::jsonb,
    checklist JSONB DEFAULT '[]'::jsonb,
    docs JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- ═══════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (allow all — single-user app)
-- ═══════════════════════════════════════════════════════════════
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE dreamwatch_pipeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tango_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE dreamwatch_calendar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on todos" ON todos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on settings" ON settings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on transactions" ON transactions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on kanban_columns" ON kanban_columns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on dreamwatch_pipeline" ON dreamwatch_pipeline FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on notes" ON notes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on tango_orders" ON tango_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on dreamwatch_calendar" ON dreamwatch_calendar FOR ALL USING (true) WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_todos_project ON todos(project_slug);
CREATE INDEX IF NOT EXISTS idx_todos_status ON todos(status);
CREATE INDEX IF NOT EXISTS idx_todos_sort ON todos(sort_order);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_kanban_project ON kanban_columns(project_slug);
CREATE INDEX IF NOT EXISTS idx_dreamwatch_status ON dreamwatch_pipeline(card_status);
CREATE INDEX IF NOT EXISTS idx_dreamwatch_active ON dreamwatch_pipeline(is_active);
CREATE INDEX IF NOT EXISTS idx_notes_project ON notes(project_slug);
CREATE INDEX IF NOT EXISTS idx_notes_pinned ON notes(pinned);
CREATE INDEX IF NOT EXISTS idx_notes_created ON notes(created_at);
CREATE INDEX IF NOT EXISTS idx_tango_orders_stage ON tango_orders(stage);
CREATE INDEX IF NOT EXISTS idx_tango_orders_channel ON tango_orders(channel);
CREATE INDEX IF NOT EXISTS idx_dreamwatch_calendar_status ON dreamwatch_calendar(status);
CREATE INDEX IF NOT EXISTS idx_dreamwatch_calendar_date ON dreamwatch_calendar(date);
