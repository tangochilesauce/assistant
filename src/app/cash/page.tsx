'use client'

import { useEffect } from 'react'
import { DollarSign, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { PageHeader } from '@/components/layout/page-header'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { BalanceEditor } from '@/components/cash/balance-editor'
import { SpendingBreakdown } from '@/components/cash/spending-breakdown'
import { ForecastChart } from '@/components/cash/forecast-chart'
import { ForecastSummary } from '@/components/cash/forecast-summary'
import { TransactionTable } from '@/components/cash/transaction-table'
import { TransactionForm } from '@/components/cash/transaction-form'
import { RecurringList } from '@/components/cash/recurring-list'
import { DebtTracker } from '@/components/cash/debt-tracker'
import { useTransactionStore } from '@/store/transaction-store'
import { useFinancialEventStore } from '@/store/financial-event-store'
import { FINANCIAL_CATEGORY_COLORS, type FinancialEvent } from '@/lib/types/financial-event'
import { fmt, getTotals } from '@/data/finance'

export default function CashPage() {
  const {
    initialized,
    fetchTransactions,
    getMonthlyTotals,
  } = useTransactionStore()

  const {
    initialized: feInitialized,
    fetchEvents: fetchFinancialEvents,
    getUpcoming,
    getMonthlyIncome,
    getMonthlyExpenses,
    getMonthlyNet,
    markPaid,
  } = useFinancialEventStore()

  useEffect(() => { fetchTransactions() }, [fetchTransactions])
  useEffect(() => { fetchFinancialEvents() }, [fetchFinancialEvents])

  const { totalIn, totalOut, net } = getMonthlyTotals()
  const { totalCCDebt, totalInterest } = getTotals()

  // Use the new store for monthly totals if available, fall back to transaction store
  const feIncome = feInitialized ? Math.round(getMonthlyIncome()) : Math.round(totalIn)
  const feExpenses = feInitialized ? Math.round(getMonthlyExpenses()) : Math.round(totalOut)
  const feNet = feInitialized ? Math.round(getMonthlyNet()) : Math.round(net)

  const upcoming = feInitialized ? getUpcoming(30) : []

  return (
    <>
      <PageHeader title="Financial">
        <TransactionForm />
      </PageHeader>

      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        {!initialized ? (
          <div className="text-sm text-muted-foreground text-center py-8">Loading...</div>
        ) : (
          <>
            {/* Summary metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
              <BalanceEditor />
              <MetricCard
                label="In /mo"
                value={`+$${fmt(feIncome)}`}
                color="text-emerald-400"
              />
              <MetricCard
                label="Out /mo"
                value={`-$${fmt(feExpenses)}`}
                color="text-red-400"
              />
              <MetricCard
                label="Net /mo"
                value={`${feNet >= 0 ? '+' : '-'}$${fmt(Math.abs(feNet))}`}
                color={feNet >= 0 ? 'text-emerald-400' : 'text-red-400'}
              />
              <MetricCard
                label="CC Debt"
                value={`$${fmt(totalCCDebt)}`}
                color="text-red-400"
                sub={`$${fmt(totalInterest)}/mo interest`}
              />
            </div>

            {/* Upcoming bills */}
            {upcoming.length > 0 && (
              <UpcomingSection items={upcoming} onMarkPaid={markPaid} />
            )}

            {/* Tabs */}
            <Tabs defaultValue="spending">
              <TabsList className="mb-6">
                <TabsTrigger value="spending">Spending</TabsTrigger>
                <TabsTrigger value="debt">Debt</TabsTrigger>
                <TabsTrigger value="forecast">Forecast</TabsTrigger>
                <TabsTrigger value="recurring">Recurring</TabsTrigger>
                <TabsTrigger value="transactions">Transactions</TabsTrigger>
              </TabsList>

              <TabsContent value="spending">
                <SpendingBreakdown />
              </TabsContent>

              <TabsContent value="debt">
                <DebtTracker />
              </TabsContent>

              <TabsContent value="forecast">
                <ForecastChart />
                <div className="mt-6">
                  <ForecastSummary />
                </div>
              </TabsContent>

              <TabsContent value="recurring">
                <RecurringList />
              </TabsContent>

              <TabsContent value="transactions">
                <TransactionTable />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </>
  )
}

// ── Metric Card ─────────────────────────────────────────────────

function MetricCard({ label, value, color, sub }: {
  label: string; value: string; color: string; sub?: string
}) {
  return (
    <div className="border border-border p-4 rounded-lg">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`text-xl font-semibold tabular-nums mt-1 ${color}`}>{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground/60 mt-1">{sub}</div>}
    </div>
  )
}

// ── Upcoming Section ────────────────────────────────────────────

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function formatUpcomingDate(fe: FinancialEvent): string {
  // For one-time bills, use the dueDate
  if (!fe.recurring && fe.dueDate) {
    const d = new Date(fe.dueDate + 'T12:00:00')
    return `${DAY_NAMES[d.getDay()]} ${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`
  }
  // For recurring, we need to reconstruct from dueDay
  // The store's getUpcoming already sorted by date, so we just show the dueDay
  if (fe.dueDay) {
    const now = new Date()
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), fe.dueDay)
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, fe.dueDay)
    const target = thisMonth >= now ? thisMonth : nextMonth
    return `${DAY_NAMES[target.getDay()]} ${MONTH_NAMES[target.getMonth()]} ${target.getDate()}`
  }
  return ''
}

function UpcomingSection({ items, onMarkPaid }: {
  items: FinancialEvent[]
  onMarkPaid: (id: string) => Promise<void>
}) {
  // Group by date string for visual grouping
  const today = new Date().toISOString().slice(0, 10)

  return (
    <div className="mb-6 border border-border rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-accent/30 border-b border-border">
        <Calendar className="size-3.5 text-muted-foreground" />
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Upcoming (next 30 days)
        </span>
        <span className="text-[10px] text-muted-foreground/50 tabular-nums ml-auto">
          {items.length} items
        </span>
      </div>

      <div className="divide-y divide-border/50">
        {items.map(fe => {
          const color = fe.color ?? FINANCIAL_CATEGORY_COLORS[fe.category]
          const isExpense = fe.amount < 0
          const isUnpaid = fe.status === 'unpaid'
          const isOverdue = !fe.recurring && fe.dueDate && fe.dueDate < today && fe.status === 'unpaid'

          return (
            <div key={fe.id + (fe.dueDate ?? fe.dueDay ?? '')} className="flex items-center gap-3 px-4 py-2.5 hover:bg-accent/20 transition-colors group">
              {/* Status icon */}
              <div className="shrink-0">
                {isOverdue ? (
                  <AlertTriangle className="size-3.5 text-red-400" />
                ) : (
                  <DollarSign className="size-3.5" style={{ color }} />
                )}
              </div>

              {/* Date */}
              <span className="text-[11px] text-muted-foreground/60 w-[70px] shrink-0">
                {formatUpcomingDate(fe)}
              </span>

              {/* Name */}
              <span className={`text-sm flex-1 truncate ${isOverdue ? 'text-red-400' : ''}`}>
                {fe.name}
              </span>

              {/* Vendor */}
              {fe.vendor && (
                <span className="text-[10px] text-muted-foreground/40 shrink-0 hidden sm:block">
                  {fe.vendor}
                </span>
              )}

              {/* Amount */}
              <span className={`text-sm font-medium tabular-nums shrink-0 ${
                isExpense ? 'text-red-400' : 'text-emerald-400'
              }`}>
                {isExpense ? '-' : '+'}${fmt(Math.abs(fe.amount))}
              </span>

              {/* Mark paid (for one-time unpaid bills) */}
              {isUnpaid && (
                <button
                  onClick={() => onMarkPaid(fe.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-emerald-400 shrink-0"
                  title="Mark as paid"
                >
                  <CheckCircle2 className="size-4" />
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
