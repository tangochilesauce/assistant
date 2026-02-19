import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type {
  FinancialEvent,
  FinancialEventRow,
  FinancialCategory,
  Recurrence,
  FinancialStatus,
} from '@/lib/types/financial-event'

// ── Row ↔ Model ─────────────────────────────────────────────────

function rowToEvent(row: FinancialEventRow): FinancialEvent {
  return {
    id: row.id,
    name: row.name,
    amount: row.amount,
    category: row.category as FinancialCategory,
    recurring: row.recurring,
    dueDay: row.due_day,
    dueDate: row.due_date,
    recurrence: (row.recurrence ?? 'monthly') as Recurrence,
    status: (row.status ?? 'active') as FinancialStatus,
    vendor: row.vendor,
    notes: row.notes,
    color: row.color,
    projectSlug: row.project_slug,
    paidDate: row.paid_date,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function eventToRow(e: FinancialEvent): FinancialEventRow {
  return {
    id: e.id,
    name: e.name,
    amount: e.amount,
    category: e.category,
    recurring: e.recurring,
    due_day: e.dueDay,
    due_date: e.dueDate,
    recurrence: e.recurrence,
    status: e.status,
    vendor: e.vendor,
    notes: e.notes,
    color: e.color,
    project_slug: e.projectSlug,
    paid_date: e.paidDate,
    created_at: e.createdAt,
    updated_at: e.updatedAt,
  }
}

// ── Store ────────────────────────────────────────────────────────

interface FinancialEventState {
  events: FinancialEvent[]
  loading: boolean
  initialized: boolean

  fetchEvents: () => Promise<void>
  addEvent: (event: Omit<FinancialEvent, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>
  updateEvent: (id: string, changes: Partial<FinancialEvent>) => Promise<void>
  deleteEvent: (id: string) => Promise<void>
  markPaid: (id: string) => Promise<void>

  // Computed helpers
  getRecurring: () => FinancialEvent[]
  getUpcoming: (days?: number) => FinancialEvent[]
  getMonthlyIncome: () => number
  getMonthlyExpenses: () => number
  getMonthlyNet: () => number
}

export const useFinancialEventStore = create<FinancialEventState>((set, get) => ({
  events: [],
  loading: false,
  initialized: false,

  fetchEvents: async () => {
    if (get().initialized) return
    set({ loading: true })

    if (supabase) {
      const { data, error } = await supabase
        .from('financial_events')
        .select('*')
        .order('due_day', { ascending: true })

      if (!error && data) {
        set({
          events: (data as FinancialEventRow[]).map(rowToEvent),
          loading: false,
          initialized: true,
        })
        return
      }
    }

    // Fallback: seed data
    set({ events: getDefaultFinancialEvents(), loading: false, initialized: true })
  },

  addEvent: async (input) => {
    const now = new Date().toISOString()
    const id = crypto.randomUUID()
    const event: FinancialEvent = {
      ...input,
      id,
      createdAt: now,
      updatedAt: now,
    }

    set(s => ({ events: [...s.events, event] }))

    if (supabase) {
      await supabase.from('financial_events').insert(eventToRow(event))
    }

    return id
  },

  updateEvent: async (id, changes) => {
    const now = new Date().toISOString()
    set(s => ({
      events: s.events.map(e =>
        e.id === id ? { ...e, ...changes, updatedAt: now } : e
      ),
    }))

    if (supabase) {
      const row: Record<string, unknown> = { updated_at: now }
      if (changes.name !== undefined) row.name = changes.name
      if (changes.amount !== undefined) row.amount = changes.amount
      if (changes.category !== undefined) row.category = changes.category
      if (changes.recurring !== undefined) row.recurring = changes.recurring
      if (changes.dueDay !== undefined) row.due_day = changes.dueDay
      if (changes.dueDate !== undefined) row.due_date = changes.dueDate
      if (changes.recurrence !== undefined) row.recurrence = changes.recurrence
      if (changes.status !== undefined) row.status = changes.status
      if (changes.vendor !== undefined) row.vendor = changes.vendor
      if (changes.notes !== undefined) row.notes = changes.notes
      if (changes.color !== undefined) row.color = changes.color
      if (changes.projectSlug !== undefined) row.project_slug = changes.projectSlug
      if (changes.paidDate !== undefined) row.paid_date = changes.paidDate
      await supabase.from('financial_events').update(row).eq('id', id)
    }
  },

  deleteEvent: async (id) => {
    set(s => ({ events: s.events.filter(e => e.id !== id) }))
    if (supabase) {
      await supabase.from('financial_events').delete().eq('id', id)
    }
  },

  markPaid: async (id) => {
    const now = new Date().toISOString()
    const today = now.slice(0, 10)
    set(s => ({
      events: s.events.map(e =>
        e.id === id ? { ...e, status: 'paid' as FinancialStatus, paidDate: today, updatedAt: now } : e
      ),
    }))
    if (supabase) {
      await supabase.from('financial_events').update({
        status: 'paid',
        paid_date: today,
        updated_at: now,
      }).eq('id', id)
    }
  },

  // ── Computed helpers ────────────────────────────────────────

  getRecurring: () => {
    return get().events.filter(e => e.recurring && e.status === 'active')
  },

  getUpcoming: (days = 30) => {
    const now = new Date()
    const today = now.toISOString().slice(0, 10)
    const cutoff = new Date(now.getTime() + days * 86400000).toISOString().slice(0, 10)
    const todayDay = now.getDate()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    const upcoming: (FinancialEvent & { _sortDate: string })[] = []

    for (const e of get().events) {
      // One-time unpaid bills
      if (!e.recurring && e.status === 'unpaid' && e.dueDate) {
        if (e.dueDate >= today && e.dueDate <= cutoff) {
          upcoming.push({ ...e, _sortDate: e.dueDate })
        }
        continue
      }

      // Recurring active items — project their next occurrence
      if (e.recurring && e.status === 'active' && e.dueDay) {
        // This month's occurrence
        const thisMonth = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(e.dueDay).padStart(2, '0')}`
        // Next month's occurrence
        const nextMonth = currentMonth === 11
          ? `${currentYear + 1}-01-${String(e.dueDay).padStart(2, '0')}`
          : `${currentYear}-${String(currentMonth + 2).padStart(2, '0')}-${String(e.dueDay).padStart(2, '0')}`

        if (thisMonth >= today && thisMonth <= cutoff) {
          upcoming.push({ ...e, _sortDate: thisMonth })
        }
        if (nextMonth >= today && nextMonth <= cutoff) {
          upcoming.push({ ...e, _sortDate: nextMonth })
        }
      }
    }

    return upcoming
      .sort((a, b) => a._sortDate.localeCompare(b._sortDate))
      .map(({ _sortDate, ...rest }) => rest)
  },

  getMonthlyIncome: () => {
    return get().events
      .filter(e => e.recurring && e.status === 'active' && e.amount > 0)
      .reduce((sum, e) => {
        if (e.recurrence === 'weekly') return sum + e.amount * (52 / 12)
        if (e.recurrence === 'biweekly') return sum + e.amount * (26 / 12)
        if (e.recurrence === 'quarterly') return sum + e.amount / 3
        return sum + e.amount
      }, 0)
  },

  getMonthlyExpenses: () => {
    return get().events
      .filter(e => e.recurring && e.status === 'active' && e.amount < 0)
      .reduce((sum, e) => {
        if (e.recurrence === 'weekly') return sum + Math.abs(e.amount) * (52 / 12)
        if (e.recurrence === 'biweekly') return sum + Math.abs(e.amount) * (26 / 12)
        if (e.recurrence === 'quarterly') return sum + Math.abs(e.amount) / 3
        return sum + Math.abs(e.amount)
      }, 0)
  },

  getMonthlyNet: () => {
    return get().getMonthlyIncome() - get().getMonthlyExpenses()
  },
}))

// ── Seed Data ─────────────────────────────────────────────────────
// Converted from finance.ts static arrays. Used when Supabase is not connected.

const NOW = new Date().toISOString()

function seed(
  id: string,
  name: string,
  amount: number,
  category: FinancialCategory,
  opts: {
    recurring?: boolean
    dueDay?: number
    dueDate?: string
    recurrence?: Recurrence
    status?: FinancialStatus
    vendor?: string
    notes?: string
    color?: string
    projectSlug?: string
  } = {}
): FinancialEvent {
  return {
    id: `seed-${id}`,
    name,
    amount,
    category,
    recurring: opts.recurring ?? true,
    dueDay: opts.dueDay ?? null,
    dueDate: opts.dueDate ?? null,
    recurrence: opts.recurrence ?? 'monthly',
    status: opts.status ?? 'active',
    vendor: opts.vendor ?? null,
    notes: opts.notes ?? null,
    color: opts.color ?? null,
    projectSlug: opts.projectSlug ?? null,
    paidDate: null,
    createdAt: NOW,
    updatedAt: NOW,
  }
}

function getDefaultFinancialEvents(): FinancialEvent[] {
  return [
    // ── Income ──────────────────────────────────────────────────
    seed('inc-unfi', 'UNFI', 3827, 'income', {
      dueDay: 15, vendor: 'UNFI', notes: 'Largest channel, SoPac +516% YoY',
      projectSlug: 'tango-unfi',
    }),
    seed('inc-amazon', 'Amazon', 1169, 'income', {
      recurrence: 'biweekly', dueDay: 1, vendor: 'Amazon',
      notes: 'PPC barely running — huge upside', projectSlug: 'tango-amazon',
    }),
    seed('inc-faire', 'Faire', 519, 'income', {
      dueDay: 15, vendor: 'Faire', notes: 'Growing steadily',
    }),
    seed('inc-dtc', 'DTC / Shopify', 328, 'income', {
      dueDay: 1, vendor: 'Shopify', notes: 'Needs email reactivation',
      projectSlug: 'tango-dtc',
    }),
    seed('inc-exp', 'EXP International', 850, 'income', {
      recurrence: 'quarterly', dueDay: 1, vendor: 'EXP',
      notes: '~$3,400/quarter',
    }),
    seed('inc-other', 'Other Income', 234, 'income', {
      dueDay: 15, notes: 'Cash deposits, Wave, misc',
    }),

    // ── Personal ────────────────────────────────────────────────
    seed('exp-rent', 'Rent', -2878, 'personal', {
      dueDay: 1, notes: 'Apartment',
    }),
    seed('exp-groceries', 'Groceries & Food', -600, 'personal', {
      dueDay: 1, notes: 'Ralphs, Chipotle, dining',
    }),
    seed('exp-atm', 'ATM Cash', -600, 'personal', {
      dueDay: 1, notes: '~$250 weed/vapes, rest unclear',
    }),
    seed('exp-gas', 'Gas & Transport', -250, 'personal', {
      dueDay: 1,
    }),
    seed('exp-misc', 'Personal / Misc', -200, 'personal', {
      dueDay: 1, notes: 'Smoke shops, misc purchases',
    }),
    seed('exp-phone', 'Phone (AT&T)', -74, 'personal', {
      dueDay: 22, vendor: 'AT&T',
    }),
    seed('exp-health', 'Health Insurance', -27, 'personal', {
      dueDay: 1, vendor: 'Blue Shield CA',
    }),

    // ── Subscriptions (Business) ────────────────────────────────
    seed('sub-shopify', 'Shopify', -74, 'business', {
      dueDay: 1, vendor: 'Shopify', notes: 'DTC storefront — essential',
    }),
    seed('sub-topaz', 'Topaz Labs', -39, 'business', {
      dueDay: 15, vendor: 'Topaz Labs', notes: 'CUT — not generating revenue',
    }),
    seed('sub-shipstation', 'Shipstation', -30, 'business', {
      dueDay: 1, vendor: 'Shipstation', notes: 'Shipping — essential',
    }),
    seed('sub-stamps', 'Stamps.com', -30, 'business', {
      dueDay: 1, vendor: 'Stamps.com', notes: 'Postage — essential',
    }),
    seed('sub-adobe', 'Adobe Illustrator', -23, 'business', {
      dueDay: 15, vendor: 'Adobe', notes: 'CUT — use alternatives',
    }),
    seed('sub-claude', 'Claude AI', -20, 'business', {
      dueDay: 1, vendor: 'Anthropic', notes: 'Essential — operational brain',
    }),
    seed('sub-openai', 'OpenAI / ChatGPT', -20, 'business', {
      dueDay: 1, vendor: 'OpenAI', notes: 'CUT — redundant with Claude',
    }),
    seed('sub-ionos', 'IONOS', -14, 'business', {
      dueDay: 1, vendor: 'IONOS', notes: 'Web hosting — essential',
    }),
    seed('sub-pika', 'Pika Art', -10, 'business', {
      dueDay: 1, vendor: 'Pika', notes: 'CUT — experimental',
    }),
    seed('sub-capcut', 'CapCut Pro', -10, 'business', {
      dueDay: 1, vendor: 'ByteDance', notes: 'CUT — use free tier',
    }),
    seed('sub-google-ws', 'Google Workspace', -8, 'business', {
      dueDay: 1, vendor: 'Google', notes: 'Business email — essential',
    }),

    // ── Subscriptions (Personal) ────────────────────────────────
    seed('sub-netflix', 'Netflix', -25, 'personal', {
      dueDay: 10, vendor: 'Netflix', notes: 'CUT — entertainment luxury',
    }),
    seed('sub-google-one', 'Google One', -20, 'personal', {
      dueDay: 5, vendor: 'Google', notes: 'CUT — downgrade to free',
    }),
    seed('sub-fox', 'Fox One', -20, 'personal', {
      dueDay: 15, vendor: 'Fox', notes: 'CUT — entertainment',
    }),
    seed('sub-youtube', 'YouTube Premium', -14, 'personal', {
      dueDay: 20, vendor: 'Google', notes: 'CUT — downgrade to free',
    }),
    seed('sub-spotify', 'Spotify', -12, 'personal', {
      dueDay: 15, vendor: 'Spotify', notes: 'Review — Madder research?',
    }),
    seed('sub-icloud', 'Apple iCloud', -10, 'personal', {
      dueDay: 1, vendor: 'Apple', notes: 'Review',
    }),
    seed('sub-prime', 'Prime Video', -9, 'personal', {
      dueDay: 1, vendor: 'Amazon', notes: 'Review',
    }),
    seed('sub-notion', 'Notion', -5, 'personal', {
      dueDay: 1, vendor: 'Notion', notes: 'Review',
    }),

    // ── Business ────────────────────────────────────────────────
    seed('exp-studio', 'Off Record Studio', -300, 'business', {
      dueDay: 1, vendor: 'Off Record LA', notes: 'Madder — music studio',
      projectSlug: 'madder',
    }),
    seed('exp-loans', 'Business Loans', -287, 'business', {
      dueDay: 15, notes: 'Parafin + Shopify Capital',
    }),
    seed('exp-shipping', 'Shipping / Postage', -500, 'business', {
      dueDay: 1, notes: 'Stamps, Shipstation, FBA',
    }),

    // ── Production ──────────────────────────────────────────────
    seed('exp-foodies-storage', 'Foodies Storage', -350, 'production', {
      dueDay: 1, vendor: 'Foodies Urban Kitchen',
      notes: 'Warehouse, shipping/receiving, pallets, barrels',
      projectSlug: 'tango-production',
    }),
    seed('exp-foodies-copack', 'Foodies Co-Packing', -1200, 'production', {
      dueDay: 1, vendor: 'Foodies Urban Kitchen',
      notes: '~3 sessions/mo × $400 ($100/hr × 4hrs) — variable',
      projectSlug: 'tango-production',
    }),
    seed('exp-ingredients', 'Ingredients & Packaging', -950, 'production', {
      dueDay: 1, notes: 'Deep (ingredients), labels, boxes, Daylight shipping',
      projectSlug: 'tango-production',
    }),

    // ── Credit Card Minimums ────────────────────────────────────
    seed('cc-sapphire', 'Chase Sapphire Min', -641, 'personal', {
      dueDay: 15, vendor: 'Chase', notes: '$19,147 balance @ 26.74% — OVER LIMIT',
      color: '#ef4444',
    }),
    seed('cc-venture', 'Cap One Venture X Min', -1125, 'personal', {
      dueDay: 23, vendor: 'Capital One', notes: '$10,545 balance @ 28.49% — PAST DUE',
      color: '#ef4444',
    }),
    seed('cc-amazon', 'Chase Amazon Min', -207, 'personal', {
      dueDay: 20, vendor: 'Chase', notes: '$6,345 balance @ 27.49% — OVER LIMIT',
      color: '#ef4444',
    }),
    seed('cc-apple', 'Apple Card Min', -86, 'personal', {
      dueDay: 28, vendor: 'Apple', notes: '$2,682 balance @ 25.49%',
    }),
    seed('cc-amex', 'Amex Min', -40, 'personal', {
      dueDay: 1, vendor: 'Amex', notes: '$1,000 balance @ 25%',
    }),
    seed('cc-plat', 'Cap One Platinum Min', -25, 'personal', {
      dueDay: 23, vendor: 'Capital One', notes: '$481 balance @ 27.24% — Near maxed',
    }),
    seed('cc-starry', 'Cap One Starry Min', -15, 'personal', {
      dueDay: 23, vendor: 'Capital One', notes: '$276 balance @ 26.40% — Near maxed',
    }),

    // ── One-Time Bills (Upcoming) ───────────────────────────────
    seed('bill-foodies-13883', 'Foodies Invoice #13883', -1900, 'production', {
      recurring: false,
      dueDate: '2026-02-23',
      status: 'unpaid',
      vendor: 'Foodies Urban Kitchen',
      notes: 'Jan storage $350 + Feb storage $350 + 3 co-pack sessions ($400 ea)',
      color: '#ef4444',
      projectSlug: 'tango-production',
    }),
  ]
}
