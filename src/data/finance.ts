// ── Financial Data (from 7-year statement analysis, Feb 2026) ──────

export const BALANCE = 45

export type IncomeStatus = 'locked' | 'expected' | 'sporadic' | 'inactive'

export interface IncomeStream {
  name: string
  monthly: number
  status: IncomeStatus
  notes?: string
}

export interface Expense {
  name: string
  monthly: number
  category: 'personal' | 'business' | 'production' | 'debt'
  notes?: string
}

export interface DebtCard {
  name: string
  balance: number
  apr: number
  minPayment: number
  monthlyInterest: number
  status: 'normal' | 'over-limit' | 'past-due' | 'near-maxed'
  priority: number // payoff order (1 = first)
}

export interface ProductionCost {
  name: string
  perRun: number
}

// ── Income (actual 6-month averages from Chase Business deposits) ──

export const INCOME: IncomeStream[] = [
  { name: 'UNFI', monthly: 3827, status: 'locked', notes: 'Largest channel, SoPac growing +516% YoY' },
  { name: 'Amazon', monthly: 1169, status: 'locked', notes: 'PPC barely running — huge upside' },
  { name: 'Faire', monthly: 519, status: 'expected', notes: 'Growing steadily' },
  { name: 'DTC / Shopify', monthly: 328, status: 'sporadic', notes: 'Needs email reactivation' },
  { name: 'EXP International', monthly: 850, status: 'sporadic', notes: '~$3,400/quarter' },
  { name: 'Other', monthly: 234, status: 'sporadic', notes: 'Cash deposits, Wave, misc' },
  { name: 'FFEEDD', monthly: 0, status: 'inactive', notes: 'Launching' },
  { name: 'Dream Beds', monthly: 0, status: 'inactive', notes: 'Need 1K subs for monetization' },
]

// ── Expenses (actual from statement analysis) ──

export const EXPENSES: Expense[] = [
  // Personal
  { name: 'Rent', monthly: 2878, category: 'personal' },
  { name: 'Groceries & Food', monthly: 600, category: 'personal', notes: 'Ralphs, Chipotle, dining' },
  { name: 'ATM Cash', monthly: 600, category: 'personal', notes: '~$250 weed/vapes, rest unclear' },
  { name: 'Gas & Transport', monthly: 250, category: 'personal' },
  { name: 'Personal / Misc', monthly: 200, category: 'personal', notes: 'Smoke shops, misc purchases' },
  { name: 'Phone (AT&T)', monthly: 74, category: 'personal' },
  { name: 'Health Insurance', monthly: 27, category: 'personal', notes: 'Blue Shield CA' },

  // Subscriptions (keeping essential, includes cuttable)
  { name: 'Shopify', monthly: 74, category: 'business', notes: 'DTC storefront — essential' },
  { name: 'Topaz Labs', monthly: 39, category: 'business', notes: 'CUT — not generating revenue' },
  { name: 'Shipstation', monthly: 30, category: 'business', notes: 'Shipping — essential' },
  { name: 'Stamps.com', monthly: 30, category: 'business', notes: 'Postage — essential' },
  { name: 'Netflix', monthly: 25, category: 'personal', notes: 'CUT — entertainment luxury' },
  { name: 'Adobe Illustrator', monthly: 23, category: 'business', notes: 'CUT — use alternatives' },
  { name: 'Claude AI', monthly: 20, category: 'business', notes: 'Essential — operational brain' },
  { name: 'OpenAI / ChatGPT', monthly: 20, category: 'business', notes: 'CUT — redundant with Claude' },
  { name: 'Google One', monthly: 20, category: 'personal', notes: 'CUT — downgrade to free' },
  { name: 'Fox One', monthly: 20, category: 'personal', notes: 'CUT — entertainment' },
  { name: 'IONOS', monthly: 14, category: 'business', notes: 'Web hosting — essential' },
  { name: 'YouTube Premium', monthly: 14, category: 'personal', notes: 'CUT — downgrade to free' },
  { name: 'Spotify', monthly: 12, category: 'personal', notes: 'Review — Madder research?' },
  { name: 'Pika Art', monthly: 10, category: 'business', notes: 'CUT — experimental' },
  { name: 'CapCut Pro', monthly: 10, category: 'business', notes: 'CUT — use free tier' },
  { name: 'Apple iCloud', monthly: 10, category: 'personal', notes: 'Review' },
  { name: 'Prime Video', monthly: 9, category: 'personal', notes: 'Review' },
  { name: 'Google Workspace', monthly: 8, category: 'business', notes: 'Business email — essential' },
  { name: 'Notion', monthly: 5, category: 'personal', notes: 'Review' },

  // Business
  { name: 'Off Record Studio', monthly: 300, category: 'business', notes: 'Madder — music studio' },
  { name: 'Business Loans', monthly: 287, category: 'debt', notes: 'Parafin + Shopify Capital' },
  { name: 'Shipping / Postage', monthly: 500, category: 'business', notes: 'Stamps, Shipstation, FBA' },

  // Production (from Foodies invoice + supplier costs)
  { name: 'Foodies Storage', monthly: 350, category: 'production', notes: 'Warehouse, shipping/receiving, pallets, barrels — 1st of month' },
  { name: 'Foodies Co-Packing', monthly: 1200, category: 'production', notes: '~3 sessions/mo × $400 ($100/hr × 4hrs)' },
  { name: 'Ingredients & Packaging', monthly: 950, category: 'production', notes: 'Deep (ingredients), labels, boxes, Daylight shipping' },
]

// ── Credit Card Debt ──

export const DEBT: DebtCard[] = [
  { name: 'Chase Sapphire', balance: 19147, apr: 26.74, minPayment: 641, monthlyInterest: 427, status: 'over-limit', priority: 4 },
  { name: 'Cap One Venture X', balance: 10545, apr: 28.49, minPayment: 1125, monthlyInterest: 250, status: 'past-due', priority: 3 },
  { name: 'Chase Amazon', balance: 6345, apr: 27.49, minPayment: 207, monthlyInterest: 145, status: 'over-limit', priority: 5 },
  { name: 'Apple Card', balance: 2682, apr: 25.49, minPayment: 86, monthlyInterest: 57, status: 'normal', priority: 6 },
  { name: 'Amex', balance: 1000, apr: 25.00, minPayment: 40, monthlyInterest: 21, status: 'normal', priority: 7 },
  { name: 'Cap One Platinum', balance: 481, apr: 27.24, minPayment: 25, monthlyInterest: 11, status: 'near-maxed', priority: 1 },
  { name: 'Cap One Starry', balance: 276, apr: 26.40, minPayment: 15, monthlyInterest: 6, status: 'near-maxed', priority: 2 },
]

// ── Production Costs (per run) ──

export const PRODUCTION_COSTS: ProductionCost[] = [
  { name: 'Deep (ingredients)', perRun: 1300 },
  { name: 'Foodies (co-pack session)', perRun: 400 },
  { name: 'Foodies (storage/mo)', perRun: 350 },
  { name: 'Boxes (Acorn)', perRun: 804 },
  { name: 'Labels', perRun: 1500 },
  { name: 'Shipping (Daylight)', perRun: 400 },
]

// ── Survival Thresholds ──

export const THE_NUMBER = {
  bareSurvival: 8000,    // min payments, cut subs
  stable: 10500,         // min payments, modest living
  payingDown: 11500,     // survival + $1K extra to debt
  target: 15000,         // comfortable + aggressive paydown
  freedom: 18000,        // $50K/year debt payoff + living
}

// ── Status Colors ──

export const STATUS_COLORS: Record<IncomeStatus, string> = {
  locked: 'bg-emerald-400',
  expected: 'bg-amber-400',
  sporadic: 'bg-orange-400',
  inactive: 'bg-zinc-600',
}

export const STATUS_LABELS: Record<IncomeStatus, string> = {
  locked: 'Reliable',
  expected: 'Expected',
  sporadic: 'Sporadic',
  inactive: 'Not Active',
}

export const DEBT_STATUS_COLORS: Record<DebtCard['status'], string> = {
  'normal': 'text-muted-foreground',
  'over-limit': 'text-amber-400',
  'past-due': 'text-red-400',
  'near-maxed': 'text-orange-400',
}

export const DEBT_STATUS_LABELS: Record<DebtCard['status'], string> = {
  'normal': 'Normal',
  'over-limit': 'Over Limit',
  'past-due': 'PAST DUE',
  'near-maxed': 'Near Maxed',
}

// ── Helpers ──

export function fmt(n: number) {
  return n.toLocaleString('en-US')
}

export function getTotals() {
  const activeIncome = INCOME.filter(i => i.status !== 'inactive')
  const totalIn = activeIncome.reduce((s, i) => s + i.monthly, 0)

  const personalExpenses = EXPENSES.filter(e => e.category === 'personal')
  const businessExpenses = EXPENSES.filter(e => e.category === 'business')
  const productionExpenses = EXPENSES.filter(e => e.category === 'production')
  const debtExpenses = EXPENSES.filter(e => e.category === 'debt')
  const ccMinimums = DEBT.reduce((s, d) => s + d.minPayment, 0)

  const totalPersonal = personalExpenses.reduce((s, e) => s + e.monthly, 0)
  const totalBiz = businessExpenses.reduce((s, e) => s + e.monthly, 0)
  const totalProd = productionExpenses.reduce((s, e) => s + e.monthly, 0)
  const totalDebt = debtExpenses.reduce((s, e) => s + e.monthly, 0) + ccMinimums
  const totalOut = totalPersonal + totalBiz + totalProd + totalDebt
  const net = totalIn - totalOut

  const totalCCDebt = DEBT.reduce((s, d) => s + d.balance, 0)
  const totalInterest = DEBT.reduce((s, d) => s + d.monthlyInterest, 0)

  return {
    totalIn,
    totalPersonal,
    totalBiz,
    totalProd,
    totalDebt,
    totalOut,
    net,
    totalCCDebt,
    totalInterest,
    ccMinimums,
    unknowns: 0,
  }
}

// ── Cuttable subscriptions ──

export function getCuttableExpenses() {
  return EXPENSES.filter(e => e.notes?.includes('CUT'))
}

export function getCuttableSavings() {
  return getCuttableExpenses().reduce((s, e) => s + e.monthly, 0)
}

// ── Unknown items (none now — all real data) ──

export interface UnknownItem {
  name: string
  category: 'personal' | 'business'
}

export function getUnknownItems(): UnknownItem[] {
  return [] // All expenses now have real numbers from statement analysis
}

// ── Default transactions (seed data for Zustand/Supabase) ─────────

import type { Transaction, IncomeStatus as TxnIncomeStatus } from '@/lib/types/transaction'

function slug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export function getDefaultTransactions(): Transaction[] {
  const today = new Date().toISOString().slice(0, 10)
  const txns: Transaction[] = []

  // Income streams (skip inactive)
  for (const item of INCOME) {
    if (item.status === 'inactive') continue
    txns.push({
      id: `seed-income-${slug(item.name)}`,
      date: today,
      amount: item.monthly,
      category: 'income',
      subcategory: slug(item.name),
      description: item.name,
      vendor: null,
      isRecurring: true,
      recurrenceRule: item.name === 'Amazon' ? 'weekly' : item.name === 'EXP International' ? 'quarterly' : 'monthly',
      recurrenceAnchor: today,
      incomeStatus: item.status as TxnIncomeStatus,
      isProjection: false,
      parentRecurringId: null,
      notes: item.notes || null,
      createdAt: today,
      updatedAt: today,
    })
  }

  // All expenses
  for (const item of EXPENSES) {
    if (item.monthly === 0) continue
    txns.push({
      id: `seed-expense-${slug(item.name)}`,
      date: today,
      amount: -item.monthly,
      category: item.category === 'debt' ? 'business' : item.category,
      subcategory: slug(item.name),
      description: item.name,
      vendor: null,
      isRecurring: true,
      recurrenceRule: 'monthly',
      recurrenceAnchor: today,
      incomeStatus: null,
      isProjection: false,
      parentRecurringId: null,
      notes: item.notes || null,
      createdAt: today,
      updatedAt: today,
    })
  }

  // CC minimums as a single line item
  const ccMin = DEBT.reduce((s, d) => s + d.minPayment, 0)
  txns.push({
    id: 'seed-expense-cc-minimums',
    date: today,
    amount: -ccMin,
    category: 'personal',
    subcategory: 'credit-card-minimums',
    description: 'Credit Card Minimums (7 cards)',
    vendor: null,
    isRecurring: true,
    recurrenceRule: 'monthly',
    recurrenceAnchor: today,
    incomeStatus: null,
    isProjection: false,
    parentRecurringId: null,
    notes: `$917/mo goes to interest alone`,
    createdAt: today,
    updatedAt: today,
  })

  return txns
}
