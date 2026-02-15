import type {
  Transaction,
  DailyBalance,
  ForecastSummary,
} from '@/lib/types/transaction'

// ── Public Types ──────────────────────────────────────────────────

export interface ForecastResult {
  daily: DailyBalance[]
  summary: ForecastSummary
}

// ── Date Helpers ──────────────────────────────────────────────────

function toDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

function toStr(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function addDays(dateStr: string, n: number): string {
  const d = toDate(dateStr)
  d.setDate(d.getDate() + n)
  return toStr(d)
}

function addMonths(dateStr: string, n: number): string {
  const d = toDate(dateStr)
  const targetMonth = d.getMonth() + n
  d.setMonth(targetMonth)
  // Handle month overflow (e.g., Jan 31 + 1 month → Feb 28)
  if (d.getMonth() !== ((targetMonth % 12) + 12) % 12) {
    d.setDate(0) // last day of previous month
  }
  return toStr(d)
}

function daysBetween(a: string, b: string): number {
  const da = toDate(a)
  const db = toDate(b)
  return Math.round((db.getTime() - da.getTime()) / (1000 * 60 * 60 * 24))
}

// ── Projection Generator ─────────────────────────────────────────

/**
 * Given recurring transaction templates, generate projected future instances
 * from startDate through startDate + days.
 */
export function generateProjections(
  recurringItems: Transaction[],
  startDate: string,
  days: number,
): Transaction[] {
  const projections: Transaction[] = []
  const endDate = addDays(startDate, days)

  for (const template of recurringItems) {
    if (!template.recurrenceRule || template.recurrenceRule === 'per-run') continue

    const anchor = template.recurrenceAnchor || template.date
    const dates = getRecurrenceDates(template.recurrenceRule, anchor, startDate, endDate)

    for (const date of dates) {
      projections.push({
        ...template,
        id: `proj-${template.id}-${date}`,
        date,
        isProjection: true,
        parentRecurringId: template.id,
      })
    }
  }

  return projections
}

/**
 * Compute all dates when a recurring event fires between rangeStart and rangeEnd.
 */
function getRecurrenceDates(
  rule: string,
  anchor: string,
  rangeStart: string,
  rangeEnd: string,
): string[] {
  const dates: string[] = []

  switch (rule) {
    case 'monthly': {
      // Find first occurrence at or after rangeStart
      let current = anchor
      // Walk forward to find first date >= rangeStart
      while (current < rangeStart) {
        current = addMonths(current, 1)
      }
      // Generate all within range
      while (current <= rangeEnd) {
        dates.push(current)
        current = addMonths(current, 1)
      }
      break
    }

    case 'biweekly': {
      // Every 14 days from anchor
      let current = anchor
      while (current < rangeStart) {
        current = addDays(current, 14)
      }
      while (current <= rangeEnd) {
        dates.push(current)
        current = addDays(current, 14)
      }
      break
    }

    case 'weekly': {
      let current = anchor
      while (current < rangeStart) {
        current = addDays(current, 7)
      }
      while (current <= rangeEnd) {
        dates.push(current)
        current = addDays(current, 7)
      }
      break
    }

    case 'quarterly': {
      let current = anchor
      while (current < rangeStart) {
        current = addMonths(current, 3)
      }
      while (current <= rangeEnd) {
        dates.push(current)
        current = addMonths(current, 3)
      }
      break
    }
  }

  return dates
}

// ── Forecast Computation ──────────────────────────────────────────

/**
 * Given a starting balance, actual past transactions, and projected future ones,
 * compute the daily balance array and summary stats.
 */
export function computeForecast(
  currentBalance: number,
  actualTransactions: Transaction[],
  projectedTransactions: Transaction[],
  startDate: string,
  days: number,
): ForecastResult {
  const endDate = addDays(startDate, days)

  // Build a map of date → transactions[]
  const dateMap = new Map<string, Transaction[]>()

  // Add projected transactions (future)
  for (const t of projectedTransactions) {
    if (t.date >= startDate && t.date <= endDate) {
      const list = dateMap.get(t.date) || []
      list.push(t)
      dateMap.set(t.date, list)
    }
  }

  // Add actual transactions (past + future if any)
  for (const t of actualTransactions) {
    if (t.date >= startDate && t.date <= endDate) {
      const list = dateMap.get(t.date) || []
      list.push(t)
      dateMap.set(t.date, list)
    }
  }

  // Walk day by day
  const daily: DailyBalance[] = []
  let runningBalance = currentBalance
  let lowestBalance = currentBalance
  let lowestDate = startDate
  const dangerZones: { start: string; end: string }[] = []
  let inDanger = false
  let dangerStart = ''

  const totalDays = daysBetween(startDate, endDate)

  for (let i = 0; i <= totalDays; i++) {
    const date = addDays(startDate, i)
    const txns = dateMap.get(date) || []
    const dayTotal = txns.reduce((sum, t) => sum + t.amount, 0)
    runningBalance += dayTotal

    daily.push({
      date,
      balance: runningBalance,
      transactions: txns,
    })

    // Track lowest point
    if (runningBalance < lowestBalance) {
      lowestBalance = runningBalance
      lowestDate = date
    }

    // Track danger zones (balance < 0)
    if (runningBalance < 0 && !inDanger) {
      inDanger = true
      dangerStart = date
    } else if (runningBalance >= 0 && inDanger) {
      inDanger = false
      dangerZones.push({ start: dangerStart, end: date })
    }
  }

  // Close open danger zone
  if (inDanger) {
    dangerZones.push({ start: dangerStart, end: endDate })
  }

  // Extract snapshot balances
  const day30 = daily[Math.min(30, daily.length - 1)]
  const day60 = daily[Math.min(60, daily.length - 1)]
  const day90 = daily[Math.min(90, daily.length - 1)]

  const summary: ForecastSummary = {
    days30: day30?.balance ?? currentBalance,
    days60: day60?.balance ?? currentBalance,
    days90: day90?.balance ?? currentBalance,
    lowestPoint: { date: lowestDate, balance: lowestBalance },
    dangerZones,
  }

  return { daily, summary }
}
