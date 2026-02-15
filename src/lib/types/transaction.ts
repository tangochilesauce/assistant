// ── Transaction Types ──────────────────────────────────────────────

export type TransactionCategory = 'income' | 'personal' | 'business' | 'production'

export type RecurrenceRule = 'monthly' | 'biweekly' | 'weekly' | 'quarterly' | 'per-run'

export type IncomeStatus = 'locked' | 'expected' | 'sporadic'

export interface Transaction {
  id: string
  date: string                                // YYYY-MM-DD
  amount: number                              // positive = income, negative = expense
  category: TransactionCategory
  subcategory: string | null
  description: string
  vendor: string | null
  isRecurring: boolean
  recurrenceRule: RecurrenceRule | null
  recurrenceAnchor: string | null             // YYYY-MM-DD — first occurrence date
  incomeStatus: IncomeStatus | null           // only for income items
  isProjection: boolean                       // client-only: true for forecast-generated items
  parentRecurringId: string | null            // links projected → recurring template
  notes: string | null
  createdAt: string
  updatedAt: string
}

// Supabase row shape (snake_case)
export interface TransactionRow {
  id: string
  date: string
  amount: number
  category: string
  subcategory: string | null
  description: string
  vendor: string | null
  is_recurring: boolean
  recurrence_rule: string | null
  recurrence_anchor: string | null
  income_status: string | null
  parent_recurring_id: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

// ── Forecast Types ────────────────────────────────────────────────

export interface DailyBalance {
  date: string                                // YYYY-MM-DD
  balance: number                             // end-of-day balance
  transactions: Transaction[]                 // all transactions on this date
}

export interface ForecastSummary {
  days30: number                              // projected balance at +30 days
  days60: number
  days90: number
  lowestPoint: { date: string; balance: number }
  dangerZones: { start: string; end: string }[]  // periods where balance < 0
}

// ── Spending Breakdown Types ──────────────────────────────────────

export interface CategoryBreakdown {
  category: TransactionCategory
  total: number                               // absolute sum of amounts
  percentage: number                          // of total spending
  subcategories: SubcategoryBreakdown[]
}

export interface SubcategoryBreakdown {
  subcategory: string
  total: number
  percentage: number                          // of category total
  count: number                               // number of transactions
}
