// ── Financial Event ─────────────────────────────────────────────
// Every money-in or money-out item. Can be recurring (rent on the 1st)
// or one-time (Foodies Invoice #13883). Either way, it has a calendar
// date so it shows up on the calendar view alongside todos and events.

export type FinancialCategory = 'income' | 'personal' | 'business' | 'production'
export type Recurrence = 'monthly' | 'weekly' | 'biweekly' | 'quarterly'
export type FinancialStatus = 'active' | 'paused' | 'unpaid' | 'paid' | 'overdue'

export interface FinancialEvent {
  id: string
  name: string
  amount: number                    // positive = income, negative = expense
  category: FinancialCategory
  recurring: boolean
  dueDay: number | null             // recurring: day of month (1-28)
  dueDate: string | null            // one-time: specific YYYY-MM-DD
  recurrence: Recurrence
  status: FinancialStatus
  vendor: string | null
  notes: string | null
  color: string | null              // calendar pill color (null = derive from category)
  projectSlug: string | null
  paidDate: string | null           // when a one-time bill was paid
  createdAt: string
  updatedAt: string
}

// Supabase row shape (snake_case)
export interface FinancialEventRow {
  id: string
  name: string
  amount: number
  category: string
  recurring: boolean
  due_day: number | null
  due_date: string | null
  recurrence: string
  status: string
  vendor: string | null
  notes: string | null
  color: string | null
  project_slug: string | null
  paid_date: string | null
  created_at: string
  updated_at: string
}

// Category colors for calendar pills
export const FINANCIAL_CATEGORY_COLORS: Record<FinancialCategory, string> = {
  income: '#22c55e',      // green
  personal: '#facc15',    // yellow
  business: '#6b7280',    // gray
  production: '#f97316',  // orange
}
