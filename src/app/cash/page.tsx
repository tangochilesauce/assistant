'use client'

import { PageHeader } from '@/components/layout/page-header'
import {
  BALANCE,
  INCOME,
  PERSONAL_EXPENSES,
  BUSINESS_EXPENSES,
  PRODUCTION_COSTS,
  STATUS_COLORS,
  STATUS_LABELS,
  fmt,
  getTotals,
  type IncomeStatus,
} from '@/data/finance'

export default function CashPage() {
  const { totalIn, totalOut, net, unknowns } = getTotals()

  return (
    <>
      <PageHeader title="Cash Flow" />
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        {/* Summary metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <MetricCard
            label="Now"
            value={`$${fmt(BALANCE)}`}
            color={BALANCE >= 0 ? 'text-foreground' : 'text-red-400'}
          />
          <MetricCard
            label="In /mo"
            value={`+$${fmt(totalIn)}`}
            color="text-emerald-400"
          />
          <MetricCard
            label="Out /mo"
            value={`-$${fmt(totalOut)}`}
            color="text-red-400"
          />
          <MetricCard
            label="Net /mo"
            value={`${net >= 0 ? '+' : '-'}$${fmt(Math.abs(net))}`}
            color={net >= 0 ? 'text-emerald-400' : 'text-red-400'}
            sub={unknowns > 0 ? `${unknowns} items unknown` : undefined}
          />
        </div>

        {/* Two columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Income */}
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground border-b border-border pb-2 mb-4">
              Income
            </div>
            {(['locked', 'expected', 'sporadic', 'inactive'] as const).map(status => {
              const items = INCOME.filter(i => i.status === status)
              if (!items.length) return null
              return (
                <div key={status} className="mb-4">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_COLORS[status]}`} />
                    <span className="text-xs uppercase tracking-wider text-muted-foreground/60">
                      {STATUS_LABELS[status]}
                    </span>
                  </div>
                  {items.map(item => (
                    <div key={item.name} className="flex justify-between py-1">
                      <span className={`text-sm ${item.monthly === 0 ? 'text-muted-foreground/60' : ''}`}>
                        {item.name}
                        {item.notes && <span className="text-muted-foreground/60 ml-1">({item.notes})</span>}
                      </span>
                      <span className={`text-sm tabular-nums ${item.monthly === 0 ? 'text-muted-foreground/40' : 'text-emerald-400'}`}>
                        {item.monthly > 0 ? `+$${fmt(item.monthly)}` : '—'}
                      </span>
                    </div>
                  ))}
                </div>
              )
            })}
            <div className="flex justify-between border-t border-border pt-2 mt-2">
              <span className="text-sm font-semibold text-muted-foreground">TOTAL (active)</span>
              <span className="text-sm tabular-nums text-emerald-400 font-semibold">+${fmt(totalIn)}</span>
            </div>
          </div>

          {/* Expenses */}
          <div>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground border-b border-border pb-2 mb-4">
              Expenses
            </div>

            <ExpenseGroup label="Personal" items={PERSONAL_EXPENSES} />
            <ExpenseGroup label="Business (fixed)" items={BUSINESS_EXPENSES} />

            <div className="mb-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-1.5">
                Production (per run)
              </div>
              {PRODUCTION_COSTS.map(item => (
                <div key={item.name} className="flex justify-between py-1">
                  <span className="text-sm">{item.name}</span>
                  <span className="text-sm tabular-nums text-red-400">-${fmt(item.perRun)}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between border-t border-border pt-2 mt-2">
              <span className="text-sm font-semibold text-muted-foreground">TOTAL (known)</span>
              <span className="text-sm tabular-nums text-red-400 font-semibold">-${fmt(totalOut)}</span>
            </div>
            {unknowns > 0 && (
              <div className="text-xs text-amber-400 mt-2">
                + {unknowns} items marked ??? — update for accuracy
              </div>
            )}
          </div>
        </div>

        {/* Bottom net */}
        <div className="border-t border-border mt-8 pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Monthly net (known): </span>
            <span className={`font-semibold tabular-nums ${net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {net >= 0 ? '+' : '-'}${fmt(Math.abs(net))}/mo
            </span>
          </div>
          {unknowns > 0 && (
            <div className="text-xs text-amber-400 bg-amber-400/10 px-3 py-1.5 rounded-md">
              {unknowns} expense items need real numbers
            </div>
          )}
        </div>
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
      {sub && <div className="text-xs text-amber-400 mt-1">{sub}</div>}
    </div>
  )
}

function ExpenseGroup({ label, items }: {
  label: string; items: { name: string; monthly: number; unknown?: boolean; notes?: string }[]
}) {
  return (
    <div className="mb-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground/60 mb-1.5">{label}</div>
      {items.map(item => (
        <div key={item.name} className="flex justify-between py-1">
          <span className={`text-sm ${item.unknown ? 'text-amber-400' : ''}`}>
            {item.name}
            {item.notes && <span className="text-muted-foreground/60 ml-1">({item.notes})</span>}
          </span>
          <span className={`text-sm tabular-nums ${item.unknown ? 'text-amber-400' : 'text-red-400'}`}>
            {item.monthly > 0 ? `-$${fmt(item.monthly)}` : item.unknown ? '$???' : '—'}
          </span>
        </div>
      ))}
    </div>
  )
}
