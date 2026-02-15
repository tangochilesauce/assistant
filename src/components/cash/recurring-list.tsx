'use client'

import { Trash2, Pause, Play } from 'lucide-react'
import { useTransactionStore } from '@/store/transaction-store'
import { getUnknownItems } from '@/data/finance'
import { Badge } from '@/components/ui/badge'
import { fmt } from '@/data/finance'
import type { TransactionCategory, RecurrenceRule } from '@/lib/types/transaction'

const CATEGORY_ORDER: TransactionCategory[] = ['income', 'personal', 'business', 'production']

const CATEGORY_LABELS: Record<TransactionCategory, string> = {
  income: '💰 Income',
  personal: '🏠 Personal',
  business: '💼 Business',
  production: '🏭 Production',
}

const RULE_LABELS: Record<RecurrenceRule, string> = {
  monthly: 'Monthly',
  biweekly: 'Biweekly',
  weekly: 'Weekly',
  quarterly: 'Quarterly',
  'per-run': 'Per Run',
}

export function RecurringList() {
  const { getRecurring, deleteTransaction } = useTransactionStore()
  const recurring = getRecurring()
  const unknowns = getUnknownItems()

  // Group by category
  const grouped = new Map<TransactionCategory, typeof recurring>()
  for (const t of recurring) {
    const list = grouped.get(t.category) || []
    list.push(t)
    grouped.set(t.category, list)
  }

  return (
    <div className="space-y-6">
      {CATEGORY_ORDER.map(category => {
        const items = grouped.get(category)
        if (!items?.length && !unknowns.some(u => u.category === category)) return null

        return (
          <div key={category}>
            <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground border-b border-border pb-2 mb-3">
              {CATEGORY_LABELS[category]}
            </div>

            <div className="space-y-1">
              {items?.map(t => (
                <div
                  key={t.id}
                  className="flex items-center justify-between py-2 px-1 group hover:bg-accent/30 rounded-md transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm truncate">{t.description}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground/60">
                          {t.recurrenceRule ? RULE_LABELS[t.recurrenceRule] : '—'}
                        </span>
                        {t.incomeStatus && (
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1 py-0 ${
                              t.incomeStatus === 'locked' ? 'text-emerald-400 border-emerald-400/20' :
                              t.incomeStatus === 'expected' ? 'text-amber-400 border-amber-400/20' :
                              'text-orange-400 border-orange-400/20'
                            }`}
                          >
                            {t.incomeStatus}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-medium tabular-nums ${
                      t.amount >= 0 ? 'text-emerald-400' : 'text-red-400'
                    }`}>
                      {t.amount >= 0 ? '+' : '-'}${fmt(Math.abs(t.amount))}
                      {t.recurrenceRule === 'per-run' ? '/run' : '/mo'}
                    </span>
                    <button
                      onClick={() => deleteTransaction(t.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-400"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Unknown items needing real numbers */}
              {unknowns
                .filter(u => u.category === category)
                .map(u => (
                  <div
                    key={u.name}
                    className="flex items-center justify-between py-2 px-1 rounded-md"
                  >
                    <span className="text-sm text-amber-400">{u.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm tabular-nums text-amber-400">$???</span>
                      <Badge
                        variant="outline"
                        className="text-[10px] px-1.5 py-0 text-amber-400 border-amber-400/20 bg-amber-400/10"
                      >
                        needs amount
                      </Badge>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
