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
}

export type { TransactionRow } from '@/lib/types/transaction'

export interface SettingsRow {
  key: string
  value: unknown
  updated_at: string
}
