'use client'

import { useState, useRef, useEffect } from 'react'
import { DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  { value: 'personal', label: 'Personal' },
  { value: 'business', label: 'Business' },
  { value: 'production', label: 'Production' },
]

export function QuickSpend() {
  const [open, setOpen] = useState(false)
  const { addTransaction, fetchTransactions, initialized } = useTransactionStore()
  const descRef = useRef<HTMLInputElement>(null)

  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<TransactionCategory>('personal')
  const [isExpense, setIsExpense] = useState(true)
  const [isRecurring, setIsRecurring] = useState(false)
  const [recurrenceRule, setRecurrenceRule] = useState<RecurrenceRule>('monthly')

  // Initialize the transaction store if needed
  useEffect(() => {
    if (!initialized) fetchTransactions()
  }, [initialized, fetchTransactions])

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => descRef.current?.focus(), 100)
      return () => clearTimeout(t)
    }
  }, [open])

  const reset = () => {
    setDescription('')
    setAmount('')
    setCategory('personal')
    setIsExpense(true)
    setIsRecurring(false)
    setRecurrenceRule('monthly')
  }

  const handleSubmit = () => {
    const parsedAmount = parseFloat(amount)
    if (!description.trim() || isNaN(parsedAmount) || parsedAmount <= 0) return

    const today = new Date().toISOString().slice(0, 10)
    const finalAmount = isExpense ? -parsedAmount : parsedAmount
    const finalCategory: TransactionCategory = isExpense ? category : 'income'

    const input: TransactionInput = {
      date: today,
      amount: finalAmount,
      category: finalCategory,
      subcategory: description.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      description: description.trim(),
      vendor: null,
      isRecurring,
      recurrenceRule: isRecurring ? recurrenceRule : null,
      recurrenceAnchor: isRecurring ? today : null,
      incomeStatus: !isExpense ? 'expected' : null,
      parentRecurringId: null,
      notes: null,
    }

    addTransaction(input)
    reset()
    setOpen(false)
  }

  return (
    <>
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => setOpen(true)}
        className="shrink-0"
        aria-label="Quick spend"
      >
        <DollarSign className="size-4" />
      </Button>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset() }}>
        <DialogContent className="sm:max-w-sm gap-3 p-4" showCloseButton={false}>
          <DialogHeader className="pb-0">
            <DialogTitle className="text-sm">Quick Entry</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            {/* Expense / Income toggle */}
            <div className="flex gap-2">
              <button
                onClick={() => { setIsExpense(true); setCategory('personal') }}
                className={`flex-1 py-1.5 text-xs rounded-md border transition-colors ${
                  isExpense
                    ? 'bg-red-400/10 border-red-400/30 text-red-400'
                    : 'border-border text-muted-foreground hover:text-foreground'
                }`}
              >
                Expense
              </button>
              <button
                onClick={() => { setIsExpense(false) }}
                className={`flex-1 py-1.5 text-xs rounded-md border transition-colors ${
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
              ref={descRef}
              placeholder="What was it?"
              value={description}
              onChange={e => setDescription(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              className="h-9 text-sm"
            />

            {/* Amount + Category */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">$</span>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  className="pl-7 h-9 text-sm"
                />
              </div>
              {isExpense && (
                <Select value={category} onValueChange={v => setCategory(v as TransactionCategory)}>
                  <SelectTrigger className="w-[110px] h-9 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORY_OPTIONS.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
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
                <span className="text-xs text-muted-foreground">Recurring</span>
              </label>
              {isRecurring && (
                <Select value={recurrenceRule} onValueChange={v => setRecurrenceRule(v as RecurrenceRule)}>
                  <SelectTrigger className="h-7 w-auto text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="biweekly">Biweekly</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Submit */}
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!description.trim() || !amount || parseFloat(amount) <= 0}
              >
                {isExpense ? 'Log Expense' : 'Log Income'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
