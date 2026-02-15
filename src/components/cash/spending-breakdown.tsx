'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { useTransactionStore } from '@/store/transaction-store'
import { fmt } from '@/data/finance'
import type { TransactionCategory, CategoryBreakdown } from '@/lib/types/transaction'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { PieChart, Pie, Cell } from 'recharts'

const CATEGORY_COLORS: Record<TransactionCategory, string> = {
  personal: '#60a5fa',     // blue-400
  business: '#a78bfa',     // purple-400
  production: '#fb923c',   // orange-400
  income: '#34d399',       // emerald-400 (not used in expenses but needed for type safety)
}

const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  personal: 'Personal',
  business: 'Business',
  production: 'Production',
  income: 'Income',
}

export function SpendingBreakdown() {
  const { getCategoryBreakdown, getMonthlyTotals } = useTransactionStore()
  const breakdown = getCategoryBreakdown()
  const { totalOut } = getMonthlyTotals()

  if (breakdown.length === 0) {
    return (
      <div className="text-sm text-muted-foreground/60 text-center py-8">
        No expense data yet. Add recurring expenses to see your spending breakdown.
      </div>
    )
  }

  // Chart data
  const chartData = breakdown.map(b => ({
    name: CATEGORY_LABELS[b.category],
    value: b.total,
    fill: CATEGORY_COLORS[b.category],
  }))

  const chartConfig: ChartConfig = {}
  for (const b of breakdown) {
    chartConfig[CATEGORY_LABELS[b.category]] = {
      label: CATEGORY_LABELS[b.category],
      color: CATEGORY_COLORS[b.category],
    }
  }

  return (
    <div>
      {/* Donut chart */}
      <div className="flex items-center justify-center mb-6">
        <div className="relative">
          <ChartContainer config={chartConfig} className="h-[200px] w-[200px]">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={85}
                paddingAngle={3}
                dataKey="value"
                nameKey="name"
              >
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.fill} stroke="transparent" />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
          {/* Center label */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <div className="text-xs text-muted-foreground">Total</div>
            <div className="text-lg font-semibold tabular-nums text-red-400">
              -${fmt(totalOut)}
            </div>
          </div>
        </div>
      </div>

      {/* Category cards */}
      <div className="space-y-2">
        {breakdown.map(b => (
          <CategoryCard key={b.category} breakdown={b} />
        ))}
      </div>
    </div>
  )
}

function CategoryCard({ breakdown }: { breakdown: CategoryBreakdown }) {
  const [expanded, setExpanded] = useState(false)
  const color = CATEGORY_COLORS[breakdown.category]

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-accent/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {expanded ? (
            <ChevronDown className="size-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="size-4 text-muted-foreground" />
          )}
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: color }}
          />
          <span className="text-sm font-medium">
            {CATEGORY_LABELS[breakdown.category]}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground tabular-nums">
            {breakdown.percentage.toFixed(0)}%
          </span>
          <span className="text-sm font-medium tabular-nums text-red-400">
            -${fmt(breakdown.total)}
          </span>
        </div>
      </button>

      {expanded && breakdown.subcategories.length > 0 && (
        <div className="border-t border-border">
          {breakdown.subcategories.map(sub => (
            <div
              key={sub.subcategory}
              className="flex items-center justify-between px-3 py-2 pl-10"
            >
              <span className="text-sm text-muted-foreground capitalize">
                {sub.subcategory.replace(/-/g, ' ')}
              </span>
              <div className="flex items-center gap-3">
                <div className="w-16 h-1.5 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${sub.percentage}%`,
                      backgroundColor: color,
                      opacity: 0.6,
                    }}
                  />
                </div>
                <span className="text-sm tabular-nums text-red-400 w-16 text-right">
                  -${fmt(sub.total)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
