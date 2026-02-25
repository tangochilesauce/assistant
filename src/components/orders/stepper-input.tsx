'use client'

import { useState, useRef, useCallback, type KeyboardEvent } from 'react'

interface StepperInputProps {
  value: number
  onSave: (value: number) => void
  step?: number
  min?: number
  placeholder?: string
}

export function StepperInput({ value, onSave, step = 1, min = 0, placeholder = '0' }: StepperInputProps) {
  const [local, setLocal] = useState(formatNum(value))
  const [saved, setSaved] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const prevValue = useRef(value)

  // Sync external value changes
  if (value !== prevValue.current) {
    prevValue.current = value
    setLocal(formatNum(value))
  }

  const flash = useCallback(() => {
    setSaved(true)
    setTimeout(() => setSaved(false), 600)
  }, [])

  const commit = useCallback((raw: string) => {
    const parsed = parseFloat(raw)
    const clamped = isNaN(parsed) ? 0 : Math.max(min, parsed)
    // Round to step precision to avoid floating point dust
    const decimals = countDecimals(step)
    const rounded = parseFloat(clamped.toFixed(decimals + 1))
    if (rounded !== value) {
      onSave(rounded)
      flash()
    }
    setLocal(formatNum(rounded))
    inputRef.current?.blur()
  }, [value, onSave, min, step, flash])

  const nudge = useCallback((dir: 1 | -1) => {
    const current = parseFloat(local) || 0
    const next = Math.max(min, parseFloat((current + step * dir).toFixed(countDecimals(step) + 1)))
    setLocal(formatNum(next))
    onSave(next)
    flash()
  }, [local, step, min, onSave, flash])

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      commit(local)
    }
  }

  return (
    <div
      className={`inline-flex items-center rounded-lg border transition-colors duration-300 ${
        saved ? 'border-emerald-500/60 ring-1 ring-emerald-500/30' : 'border-border'
      }`}
    >
      <button
        type="button"
        onClick={() => nudge(-1)}
        className="flex items-center justify-center w-7 h-7 rounded-l-[7px] bg-card text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 transition-all select-none shrink-0"
        tabIndex={-1}
        aria-label="Decrease"
      >
        <svg className="w-2.5 h-2.5" viewBox="0 0 10 2" fill="none"><path d="M1 1h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
      </button>
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        value={local}
        onChange={e => setLocal(e.target.value)}
        onBlur={() => commit(local)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-12 text-center tabular-nums bg-transparent text-sm py-1 px-0.5 focus:outline-none placeholder:text-muted-foreground/30"
      />
      <button
        type="button"
        onClick={() => nudge(1)}
        className="flex items-center justify-center w-7 h-7 rounded-r-[7px] bg-card text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 transition-all select-none shrink-0"
        tabIndex={-1}
        aria-label="Increase"
      >
        <svg className="w-2.5 h-2.5" viewBox="0 0 10 10" fill="none"><path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
      </button>
    </div>
  )
}

function formatNum(n: number): string {
  if (n === 0) return ''
  return String(n)
}

function countDecimals(n: number): number {
  const s = String(n)
  const dot = s.indexOf('.')
  return dot === -1 ? 0 : s.length - dot - 1
}
