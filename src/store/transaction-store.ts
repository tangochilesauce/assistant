import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { BALANCE, getDefaultTransactions } from '@/data/finance'
import type {
  Transaction,
  TransactionRow,
  TransactionCategory,
  CategoryBreakdown,
  SubcategoryBreakdown,
} from '@/lib/types/transaction'
import { generateProjections, computeForecast, type ForecastResult } from '@/lib/forecast'

// ── Row Conversion ────────────────────────────────────────────────

function rowToTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    date: row.date,
    amount: row.amount,
    category: row.category as TransactionCategory,
    subcategory: row.subcategory,
    description: row.description,
    vendor: row.vendor,
    isRecurring: row.is_recurring,
    recurrenceRule: row.recurrence_rule as Transaction['recurrenceRule'],
    recurrenceAnchor: row.recurrence_anchor,
    incomeStatus: row.income_status as Transaction['incomeStatus'],
    isProjection: false,
    parentRecurringId: row.parent_recurring_id,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function transactionToRow(t: Transaction): Omit<TransactionRow, 'created_at' | 'updated_at'> {
  return {
    id: t.id,
    date: t.date,
    amount: t.amount,
    category: t.category,
    subcategory: t.subcategory,
    description: t.description,
    vendor: t.vendor,
    is_recurring: t.isRecurring,
    recurrence_rule: t.recurrenceRule,
    recurrence_anchor: t.recurrenceAnchor,
    income_status: t.incomeStatus,
    parent_recurring_id: t.parentRecurringId,
    notes: t.notes,
  }
}

// ── Store Interface ───────────────────────────────────────────────

export type TransactionInput = Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'isProjection'>

interface TransactionState {
  transactions: Transaction[]
  balance: number
  loading: boolean
  initialized: boolean

  // Actions
  fetchTransactions: () => Promise<void>
  addTransaction: (input: TransactionInput) => Promise<void>
  updateTransaction: (id: string, changes: Partial<TransactionInput>) => Promise<void>
  deleteTransaction: (id: string) => Promise<void>
  updateBalance: (newBalance: number) => Promise<void>

  // Computed getters
  getRecurring: () => Transaction[]
  getActual: () => Transaction[]
  getMonthlyTotals: () => { totalIn: number; totalOut: number; net: number }
  getCategoryBreakdown: () => CategoryBreakdown[]
  getForecast: (days?: number) => ForecastResult
}

// ── Store ─────────────────────────────────────────────────────────

export const useTransactionStore = create<TransactionState>((set, get) => ({
  transactions: [],
  balance: BALANCE,
  loading: false,
  initialized: false,

  // ── Fetch ───────────────────────────────────────────────────────

  fetchTransactions: async () => {
    if (get().initialized) return
    set({ loading: true })

    // Try Supabase
    if (supabase) {
      const [txnResult, settingsResult] = await Promise.all([
        supabase.from('transactions').select('*').order('date', { ascending: false }),
        supabase.from('settings').select('*').eq('key', 'cash_balance').single(),
      ])

      if (!txnResult.error && txnResult.data) {
        // If Supabase is empty, seed it with defaults
        if (txnResult.data.length === 0) {
          const defaults = getDefaultTransactions()
          const now = new Date().toISOString()
          const rows = defaults.map(t => ({
            ...transactionToRow(t),
            created_at: now,
            updated_at: now,
          }))
          await supabase.from('transactions').insert(rows)
          // Also seed the balance
          await supabase.from('settings').upsert({
            key: 'cash_balance',
            value: BALANCE,
            updated_at: now,
          })
          set({
            transactions: defaults,
            balance: BALANCE,
            loading: false,
            initialized: true,
          })
          return
        }

        const balance = settingsResult.data?.value as number ?? BALANCE
        set({
          transactions: txnResult.data.map(rowToTransaction),
          balance,
          loading: false,
          initialized: true,
        })
        return
      }
    }

    // Fallback: use defaults from finance.ts
    set({
      transactions: getDefaultTransactions(),
      balance: BALANCE,
      loading: false,
      initialized: true,
    })
  },

  // ── Add ─────────────────────────────────────────────────────────

  addTransaction: async (input: TransactionInput) => {
    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const newTxn: Transaction = {
      ...input,
      id,
      isProjection: false,
      createdAt: now,
      updatedAt: now,
    }

    // Optimistic update
    set(state => ({ transactions: [newTxn, ...state.transactions] }))

    if (supabase) {
      await supabase.from('transactions').insert({
        ...transactionToRow(newTxn),
        created_at: now,
        updated_at: now,
      })
    }
  },

  // ── Update ──────────────────────────────────────────────────────

  updateTransaction: async (id: string, changes: Partial<TransactionInput>) => {
    const now = new Date().toISOString()

    // Optimistic update
    set(state => ({
      transactions: state.transactions.map(t =>
        t.id === id ? { ...t, ...changes, updatedAt: now } : t
      ),
    }))

    if (supabase) {
      const row: Record<string, unknown> = { updated_at: now }
      if (changes.date !== undefined) row.date = changes.date
      if (changes.amount !== undefined) row.amount = changes.amount
      if (changes.category !== undefined) row.category = changes.category
      if (changes.subcategory !== undefined) row.subcategory = changes.subcategory
      if (changes.description !== undefined) row.description = changes.description
      if (changes.vendor !== undefined) row.vendor = changes.vendor
      if (changes.isRecurring !== undefined) row.is_recurring = changes.isRecurring
      if (changes.recurrenceRule !== undefined) row.recurrence_rule = changes.recurrenceRule
      if (changes.recurrenceAnchor !== undefined) row.recurrence_anchor = changes.recurrenceAnchor
      if (changes.incomeStatus !== undefined) row.income_status = changes.incomeStatus
      if (changes.notes !== undefined) row.notes = changes.notes

      await supabase.from('transactions').update(row).eq('id', id)
    }
  },

  // ── Delete ──────────────────────────────────────────────────────

  deleteTransaction: async (id: string) => {
    set(state => ({ transactions: state.transactions.filter(t => t.id !== id) }))

    if (supabase) {
      await supabase.from('transactions').delete().eq('id', id)
    }
  },

  // ── Balance ─────────────────────────────────────────────────────

  updateBalance: async (newBalance: number) => {
    set({ balance: newBalance })

    if (supabase) {
      await supabase.from('settings').upsert({
        key: 'cash_balance',
        value: newBalance,
        updated_at: new Date().toISOString(),
      })
    }
  },

  // ── Computed: Recurring Templates ───────────────────────────────

  getRecurring: () => {
    return get().transactions.filter(t => t.isRecurring && !t.isProjection)
  },

  // ── Computed: Actual (non-recurring, non-projection) ────────────

  getActual: () => {
    return get().transactions.filter(t => !t.isRecurring && !t.isProjection)
  },

  // ── Computed: Monthly Totals ────────────────────────────────────

  getMonthlyTotals: () => {
    const recurring = get().getRecurring()
    let totalIn = 0
    let totalOut = 0

    for (const t of recurring) {
      if (t.recurrenceRule === 'per-run') continue // don't include per-run in monthly
      if (t.amount > 0) {
        // Biweekly income: multiply by ~2.17 for monthly equivalent
        if (t.recurrenceRule === 'biweekly') {
          totalIn += t.amount * (26 / 12)
        } else {
          totalIn += t.amount
        }
      } else {
        if (t.recurrenceRule === 'biweekly') {
          totalOut += Math.abs(t.amount) * (26 / 12)
        } else {
          totalOut += Math.abs(t.amount)
        }
      }
    }

    return { totalIn, totalOut, net: totalIn - totalOut }
  },

  // ── Computed: Spending Breakdown ────────────────────────────────

  getCategoryBreakdown: () => {
    const recurring = get().getRecurring()
    const expenses = recurring.filter(t => t.amount < 0 && t.recurrenceRule !== 'per-run')

    const totalSpending = expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0)
    if (totalSpending === 0) return []

    // Group by category
    const categoryMap = new Map<TransactionCategory, Transaction[]>()
    for (const t of expenses) {
      const list = categoryMap.get(t.category) || []
      list.push(t)
      categoryMap.set(t.category, list)
    }

    const breakdowns: CategoryBreakdown[] = []
    for (const [category, txns] of categoryMap) {
      const categoryTotal = txns.reduce((sum, t) => sum + Math.abs(t.amount), 0)

      // Group by subcategory within this category
      const subMap = new Map<string, Transaction[]>()
      for (const t of txns) {
        const key = t.subcategory || t.description
        const list = subMap.get(key) || []
        list.push(t)
        subMap.set(key, list)
      }

      const subcategories: SubcategoryBreakdown[] = []
      for (const [sub, subTxns] of subMap) {
        const subTotal = subTxns.reduce((sum, t) => sum + Math.abs(t.amount), 0)
        subcategories.push({
          subcategory: sub,
          total: subTotal,
          percentage: categoryTotal > 0 ? (subTotal / categoryTotal) * 100 : 0,
          count: subTxns.length,
        })
      }
      subcategories.sort((a, b) => b.total - a.total)

      breakdowns.push({
        category,
        total: categoryTotal,
        percentage: (categoryTotal / totalSpending) * 100,
        subcategories,
      })
    }

    breakdowns.sort((a, b) => b.total - a.total)
    return breakdowns
  },

  // ── Computed: Forecast ──────────────────────────────────────────

  getForecast: (days = 90) => {
    const { balance } = get()
    const recurring = get().getRecurring()
    const actual = get().getActual()
    const today = new Date().toISOString().slice(0, 10)

    const projections = generateProjections(recurring, today, days)
    return computeForecast(balance, actual, projections, today, days)
  },
}))
