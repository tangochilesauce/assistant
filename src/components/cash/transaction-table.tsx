'use client'

import { useState } from 'react'
import { Pencil, Trash2, Check, X } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTransactionStore } from '@/store/transaction-store'
import { fmt } from '@/data/finance'
import type { Transaction, TransactionCategory, RecurrenceRule } from '@/lib/types/transaction'

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

const CATEGORY_OPTIONS: { value: TransactionCategory; label: string }[] = [
  { value: 'income', label: 'Income' },
  { value: 'personal', label: 'Personal' },
  { value: 'business', label: 'Business' },
  { value: 'production', label: 'Production' },
]

const RECURRENCE_OPTIONS: { value: RecurrenceRule; label: string }[] = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'biweekly', label: 'Biweekly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'per-run', label: 'Per Run' },
]

export function TransactionTable() {
  const { transactions, deleteTransaction, updateTransaction } = useTransactionStore()
  const [filter, setFilter] = useState<Filter>('all')
  const [editingId, setEditingId] = useState<string | null>(null)

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
              <TableHead className="text-xs w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(t =>
              editingId === t.id ? (
                <EditRow key={t.id} transaction={t} onDone={() => setEditingId(null)} />
              ) : (
                <TableRow key={t.id} className="group cursor-pointer" onClick={() => setEditingId(t.id)}>
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
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingId(t.id) }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="size-3.5" />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteTransaction(t.id) }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-400"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      )}
    </div>
  )
}

// ── Inline Edit Row ──────────────────────────────────────────────────

interface EditRowProps {
  transaction: Transaction
  onDone: () => void
}

function EditRow({ transaction: t, onDone }: EditRowProps) {
  const { updateTransaction } = useTransactionStore()
  const [description, setDescription] = useState(t.description)
  const [amount, setAmount] = useState(String(Math.abs(t.amount)))
  const [date, setDate] = useState(t.date)
  const [category, setCategory] = useState<TransactionCategory>(t.category)
  const [vendor, setVendor] = useState(t.vendor ?? '')
  const [isRecurring, setIsRecurring] = useState(t.isRecurring)
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule>(t.recurrenceRule ?? 'monthly')
  const isExpense = t.amount < 0

  const handleSave = () => {
    const parsedAmount = parseFloat(amount)
    if (!description.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return

    updateTransaction(t.id, {
      description: description.trim(),
      amount: isExpense ? -parsedAmount : parsedAmount,
      date,
      category,
      vendor: vendor.trim() || null,
      isRecurring,
      recurrenceRule: isRecurring ? recurrenceRule : null,
      recurrenceAnchor: isRecurring ? (t.recurrenceAnchor ?? date) : null,
    })
    onDone()
  }

  return (
    <TableRow className="bg-accent/30">
      <TableCell>
        <Input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="h-7 text-xs w-[120px]"
        />
      </TableCell>
      <TableCell>
        <div className="flex flex-col gap-1.5">
          <Input
            value={description}
            onChange={e => setDescription(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSave()
              if (e.key === 'Escape') onDone()
            }}
            className="h-7 text-sm"
            autoFocus
          />
          <div className="flex items-center gap-2">
            <Input
              placeholder="Vendor"
              value={vendor}
              onChange={e => setVendor(e.target.value)}
              className="h-7 text-xs flex-1"
            />
            <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer whitespace-nowrap">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={e => setIsRecurring(e.target.checked)}
                className="rounded border-border"
              />
              ↻
            </label>
            {isRecurring && (
              <Select value={recurrenceRule} onValueChange={v => setRecurrenceRule(v as RecurrenceRule)}>
                <SelectTrigger className="h-7 text-xs w-[100px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RECURRENCE_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Select value={category} onValueChange={v => setCategory(v as TransactionCategory)}>
          <SelectTrigger className="h-7 text-xs w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CATEGORY_OPTIONS.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>
        <div className="relative">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSave()
              if (e.key === 'Escape') onDone()
            }}
            className="h-7 text-sm text-right pl-5 w-[100px]"
          />
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1 justify-end">
          <button onClick={handleSave} className="text-emerald-400 hover:text-emerald-300">
            <Check className="size-4" />
          </button>
          <button onClick={onDone} className="text-muted-foreground hover:text-foreground">
            <X className="size-4" />
          </button>
        </div>
      </TableCell>
    </TableRow>
  )
}

function formatDate(dateStr: string) {
  const [, m, d] = dateStr.split('-')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  return `${months[parseInt(m) - 1]} ${parseInt(d)}`
}
