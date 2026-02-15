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
  unknown?: boolean
  notes?: string
}

export interface ProductionCost {
  name: string
  perRun: number
}

export const INCOME: IncomeStream[] = [
  { name: 'Amazon Payouts', monthly: 1900, status: 'locked', notes: 'biweekly avg' },
  { name: 'UNFI (SoPac)', monthly: 3422, status: 'expected', notes: 'net 30' },
  { name: 'UNFI (NE)', monthly: 3422, status: 'expected', notes: 'net 30' },
  { name: 'EXP Corp', monthly: 3400, status: 'sporadic', notes: 'net 30' },
  { name: 'Faire / Mable', monthly: 0, status: 'inactive' },
  { name: 'DTC Sales', monthly: 0, status: 'inactive' },
  { name: 'FFEEDD Subs', monthly: 0, status: 'inactive' },
]

export const PERSONAL_EXPENSES: Expense[] = [
  { name: 'Rent', monthly: 2878 },
  { name: 'Phone', monthly: 0, unknown: true },
  { name: 'Health Insurance', monthly: 0, unknown: true },
  { name: 'Car / Gas', monthly: 0, unknown: true },
  { name: 'Groceries', monthly: 0, unknown: true },
  { name: 'Subscriptions', monthly: 0, unknown: true },
]

export const BUSINESS_EXPENSES: Expense[] = [
  { name: 'Off Record Studio', monthly: 300 },
  { name: 'Amazon Seller Fees', monthly: 0, unknown: true },
  { name: 'Amazon PPC', monthly: 33, notes: '$66/60d' },
]

export const PRODUCTION_COSTS: ProductionCost[] = [
  { name: 'Deep (ingredients)', perRun: 1300 },
  { name: 'Foodies (co-pack)', perRun: 1100 },
  { name: 'Boxes (Acorn)', perRun: 804 },
  { name: 'Labels', perRun: 1500 },
  { name: 'Shipping (Daylight)', perRun: 400 },
]

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

export function fmt(n: number) {
  return n.toLocaleString('en-US')
}

export function getTotals() {
  const activeIncome = INCOME.filter(i => i.status !== 'inactive')
  const totalIn = activeIncome.reduce((s, i) => s + i.monthly, 0)
  const totalPersonal = PERSONAL_EXPENSES.reduce((s, e) => s + e.monthly, 0)
  const totalBiz = BUSINESS_EXPENSES.reduce((s, e) => s + e.monthly, 0)
  const totalProd = PRODUCTION_COSTS.reduce((s, e) => s + e.perRun, 0)
  const totalOut = totalPersonal + totalBiz + totalProd
  const net = totalIn - totalOut
  const unknowns = [...PERSONAL_EXPENSES, ...BUSINESS_EXPENSES].filter(e => e.unknown).length
  return { totalIn, totalPersonal, totalBiz, totalProd, totalOut, net, unknowns }
}
