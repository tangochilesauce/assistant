'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTransactionStore, type TransactionInput } from '@/store/transaction-store'
import type { TransactionCategory, RecurrenceRule } from '@/lib/types/transaction'

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

export function TransactionForm() {
  const [open, setOpen] = useState(false)
  const { addTransaction } = useTransactionStore()

  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<TransactionCategory>('personal')
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [vendor, setVendor] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule>('monthly')
  const [isExpense, setIsExpense] = useState(true)

  const reset = () => {
    setDescription('')
    setAmount('')
    setCategory('personal')
    setDate(new Date().toISOString().slice(0, 10))
    setVendor('')
    setIsRecurring(false)
    setRecurrenceRule('monthly')
    setIsExpense(true)
  }

  const handleSubmit = () => {
    const parsedAmount = parseFloat(amount)
    if (!description.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return

    const finalAmount = isExpense ? -parsedAmount : parsedAmount
    const finalCategory: TransactionCategory = isExpense ? category : 'income'

    const input: TransactionInput = {
      date,
      amount: finalAmount,
      category: finalCategory,
      subcategory: description.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: description.trim(),
      vendor: vendor.trim() || null,
      isRecurring,
      recurrenceRule: isRecurring ? recurrenceRule : null,
      recurrenceAnchor: isRecurring ? date : null,
      incomeStatus: !isExpense ? 'expected' : null,
      parentRecurringId: null,
      notes: null,
    }

    addTransaction(input)
    reset()
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Plus className="size-4" />
          Add
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Transaction</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {/* Type toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => { setIsExpense(true); setCategory('personal') }}
              className={`flex-1 py-2 text-sm rounded-md border transition-colors ${
                isExpense
                  ? 'bg-red-400/10 border-red-400/30 text-red-400'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              Expense
            </button>
            <button
              onClick={() => { setIsExpense(false); setCategory('income') }}
              className={`flex-1 py-2 text-sm rounded-md border transition-colors ${
                !isExpense
                  ? 'bg-emerald-400/10 border-emerald-400/30 text-emerald-400'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
            >
              Income
            </button>
          </div>

          {/* Description */}
          <Input
            placeholder="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            autoFocus
          />

          {/* Amount + Date row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                className="pl-7"
              />
            </div>
            <Input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </div>

          {/* Category (expenses only) + Vendor */}
          <div className="grid grid-cols-2 gap-3">
            {isExpense ? (
              <Select value={category} onValueChange={v => setCategory(v as TransactionCategory)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.filter(o => o.value !== 'income').map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <div /> // spacer
            )}
            <Input
              placeholder="Vendor (optional)"
              value={vendor}
              onChange={e => setVendor(e.target.value)}
            />
          </div>

          {/* Recurring toggle */}
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isRecurring}
                onChange={e => setIsRecurring(e.target.checked)}
                className="rounded border-border"
              />
              <span className="text-sm">Recurring</span>
            </label>
            {isRecurring && (
              <Select value={recurrenceRule} onValueChange={v => setRecurrenceRule(v as RecurrenceRule)}>
                <SelectTrigger size="sm" className="w-auto">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {RECURRENCE_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button onClick={handleSubmit} className="w-full sm:w-auto">
            {isExpense ? 'Add Expense' : 'Add Income'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
