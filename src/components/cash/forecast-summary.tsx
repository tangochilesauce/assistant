'use client'

import { AlertTriangle } from 'lucide-react'
import { useTransactionStore } from '@/store/transaction-store'
import { fmt } from '@/data/finance'

export function ForecastSummary() {
  const { getForecast } = useTransactionStore()
  const { summary } = getForecast(90)

  const cards = [
    { label: '30 days', value: summary.days30 },
    { label: '60 days', value: summary.days60 },
    { label: '90 days', value: summary.days90 },
  ]

  return (
    <div>
      {/* Projection cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {cards.map(card => (
          <div key={card.label} className="border border-border rounded-lg p-3">
            <div className="text-xs text-muted-foreground">{card.label}</div>
            <div className={`text-lg font-semibold tabular-nums mt-0.5 ${
              card.value >= 0 ? 'text-emerald-400' : 'text-red-400'
            }`}>
              {card.value >= 0 ? '' : '-'}${fmt(Math.abs(Math.round(card.value)))}
            </div>
          </div>
        ))}
      </div>

      {/* Lowest point */}
      <div className={`flex items-center gap-2 text-sm px-1 ${
        summary.lowestPoint.balance < 0 ? 'text-red-400' : 'text-muted-foreground'
      }`}>
        {summary.lowestPoint.balance < 0 && (
          <AlertTriangle className="size-4 shrink-0" />
        )}
        <span>
          Lowest: <strong className="tabular-nums">
            {summary.lowestPoint.balance < 0 ? '-' : ''}${fmt(Math.abs(Math.round(summary.lowestPoint.balance)))}
          </strong>
          {' '}on {formatDate(summary.lowestPoint.date)}
        </span>
      </div>

      {/* Danger zones */}
      {summary.dangerZones.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {summary.dangerZones.map((zone, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-xs bg-red-400/10 text-red-400 px-3 py-1.5 rounded-md"
            >
              <AlertTriangle className="size-3.5 shrink-0" />
              <span>
                Cash negative: {formatDate(zone.start)} — {formatDate(zone.end)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function formatDate(dateStr: string) {
  const [, m, d] = dateStr.split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[parseInt(m) - 1]} ${parseInt(d)}`
}
