import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

export interface TodoRow {
  id: string
  project_slug: string
  title: string
  completed: boolean
  created_at: string
  due_date: string | null
  sort_order: number
  status: string | null  // kanban column id — null for legacy rows (derive from completed)
  tags: string[]         // e.g. ["focus"] for daily focus items
  parent_id: string | null  // for nested sub-tasks
}

export type { TransactionRow } from '@/lib/types/transaction'

export interface SettingsRow {
  key: string
  value: unknown
  updated_at: string
}

export interface NoteRow {
  id: string
  project_slug: string
  content: string
  tags: string[]
  pinned: boolean
  created_at: string
  updated_at: string
}

export interface DreamwatchRow {
  id: string
  basename: string
  title: string | null
  video_file: string | null
  thumb_file: string | null
  video_size_mb: number
  thumb_size_mb: number
  video_date: string | null
  thumb_date: string | null
  card_status: string
  is_active: boolean
  state: string
  step: number
  total_steps: number
  progress: number
  step_label: string | null
  encode_pct: number
  encoded_time: string | null
  speed: string | null
  eta: string | null
  total_time: string
  file_size: string | null
  upload_pct: number
  youtube_url: string | null
  live_bytes: number
  total_bytes: number
  publish_target: string | null
  publish_target_display: string | null
  description: string | null
  tags: string[]
  thumb_base64: string | null
  sort_date: string | null
  synced_at: string
  created_at: string
}
