'use client'

import { useEffect } from 'react'
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
import { fmt, getTotals } from '@/data/finance'

export default function CashPage() {
  const {
    initialized,
    fetchTransactions,
    getMonthlyTotals,
  } = useTransactionStore()

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const { totalIn, totalOut, net } = getMonthlyTotals()
  const { totalCCDebt, totalInterest } = getTotals()

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
                value={`+$${fmt(Math.round(totalIn))}`}
                color="text-emerald-400"
              />
              <MetricCard
                label="Out /mo"
                value={`-$${fmt(Math.round(totalOut))}`}
                color="text-red-400"
              />
              <MetricCard
                label="Net /mo"
                value={`${net >= 0 ? '+' : '-'}$${fmt(Math.abs(Math.round(net)))}`}
                color={net >= 0 ? 'text-emerald-400' : 'text-red-400'}
              />
              <MetricCard
                label="CC Debt"
                value={`$${fmt(totalCCDebt)}`}
                color="text-red-400"
                sub={`$${fmt(totalInterest)}/mo interest`}
              />
            </div>

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
