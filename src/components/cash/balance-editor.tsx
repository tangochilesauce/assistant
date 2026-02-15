'use client'

import { useState, useRef, useEffect } from 'react'
import { useTransactionStore } from '@/store/transaction-store'
import { fmt } from '@/data/finance'

export function BalanceEditor() {
  const { balance, updateBalance } = useTransactionStore()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editing])

  const handleStart = () => {
    setValue(String(balance))
    setEditing(true)
  }

  const handleSave = () => {
    const num = parseFloat(value)
    if (!isNaN(num)) {
      updateBalance(Math.round(num * 100) / 100)
    }
    setEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') setEditing(false)
  }

  if (editing) {
    return (
      <div className="border border-border p-4 rounded-lg">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Now</div>
        <div className="flex items-center gap-1 mt-1">
          <span className="text-xl font-semibold tabular-nums text-foreground">$</span>
          <input
            ref={inputRef}
            type="number"
            step="0.01"
            value={value}
            onChange={e => setValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={handleKeyDown}
            className="text-xl font-semibold tabular-nums bg-transparent border-b border-foreground/30 outline-none w-full text-foreground"
          />
        </div>
        <div className="text-xs text-muted-foreground/60 mt-1">Enter to save</div>
      </div>
    )
  }

  return (
    <div
      className="border border-border p-4 rounded-lg cursor-pointer hover:border-foreground/30 transition-colors group"
      onClick={handleStart}
    >
      <div className="text-xs uppercase tracking-wider text-muted-foreground">Now</div>
      <div className={`text-xl font-semibold tabular-nums mt-1 ${balance >= 0 ? 'text-foreground' : 'text-red-400'}`}>
        ${fmt(balance)}
      </div>
      <div className="text-xs text-muted-foreground/40 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
        Click to update
      </div>
    </div>
  )
}
