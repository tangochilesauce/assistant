'use client'

import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { useTransactionStore } from '@/store/transaction-store'
import { fmt } from '@/data/finance'
import type { TransactionCategory } from '@/lib/types/transaction'

type Filter = 'all' | TransactionCategory

const FILTER_OPTIONS: { value: Filter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'income', label: 'Income' },
  { value: 'personal', label: 'Personal' },
  { value: 'business', label: 'Business' },
  { value: 'production', label: 'Production' },
]

const CATEGORY_COLORS: Record<TransactionCategory, string> = {
  income: 'bg-emerald-400/10 text-emerald-400 border-emerald-400/20',
  personal: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
  business: 'bg-purple-400/10 text-purple-400 border-purple-400/20',
  production: 'bg-orange-400/10 text-orange-400 border-orange-400/20',
}

export function TransactionTable() {
  const { transactions, deleteTransaction } = useTransactionStore()
  const [filter, setFilter] = useState<Filter>('all')

  // Show all non-projection transactions, sorted by date desc
  const filtered = transactions
    .filter(t => !t.isProjection)
    .filter(t => filter === 'all' || t.category === filter)
    .sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div>
      {/* Filter pills */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {FILTER_OPTIONS.map(opt => (
          <button
            key={opt.value}
            onClick={() => setFilter(opt.value)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              filter === opt.value
                ? 'bg-foreground/10 border-foreground/20 text-foreground'
                : 'border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-sm text-muted-foreground/60 text-center py-8">
          No transactions yet. Add one to get started.
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs">Date</TableHead>
              <TableHead className="text-xs">Description</TableHead>
              <TableHead className="text-xs">Category</TableHead>
              <TableHead className="text-xs text-right">Amount</TableHead>
              <TableHead className="text-xs w-8" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(t => (
              <TableRow key={t.id} className="group">
                <TableCell className="text-xs text-muted-foreground tabular-nums">
                  {formatDate(t.date)}
                </TableCell>
                <TableCell className="text-sm">
                  {t.description}
                  {t.vendor && (
                    <span className="text-muted-foreground/60 ml-1">— {t.vendor}</span>
                  )}
                  {t.isRecurring && (
                    <span className="text-muted-foreground/40 ml-1">↻</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`text-[10px] px-1.5 py-0 ${CATEGORY_COLORS[t.category]}`}
                  >
                    {t.category}
                  </Badge>
                </TableCell>
                <TableCell className={`text-sm text-right tabular-nums font-medium ${
                  t.amount >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}>
                  {t.amount >= 0 ? '+' : '-'}${fmt(Math.abs(t.amount))}
                </TableCell>
                <TableCell>
                  <button
                    onClick={() => deleteTransaction(t.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-400"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[parseInt(m) - 1]} ${parseInt(d)}`
}
