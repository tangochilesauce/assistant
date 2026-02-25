'use client'

import { useState, useRef, useCallback, type InputHTMLAttributes } from 'react'

interface SaveInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string | number
  onSave: (value: string) => void
}

/**
 * Input that saves on blur + Enter, flashes green on save, and
 * dismisses the keyboard on mobile after Enter.
 */
export function SaveInput({ value, onSave, className = '', ...props }: SaveInputProps) {
  const [local, setLocal] = useState(String(value))
  const [saved, setSaved] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const prevValue = useRef(String(value))

  // Sync external value changes
  if (String(value) !== prevValue.current) {
    prevValue.current = String(value)
    setLocal(String(value))
  }

  const commit = useCallback(() => {
    if (local !== String(value)) {
      onSave(local)
      setSaved(true)
      setTimeout(() => setSaved(false), 600)
    }
    inputRef.current?.blur()
  }, [local, value, onSave])

  return (
    <input
      ref={inputRef}
      {...props}
      value={local}
      onChange={e => setLocal(e.target.value)}
      onBlur={commit}
      onKeyDown={e => {
        if (e.key === 'Enter') {
          e.preventDefault()
          commit()
        }
      }}
      className={`${className} transition-colors duration-300 ${
        saved ? '!border-emerald-500/60 !ring-1 !ring-emerald-500/30' : ''
      }`}
    />
  )
}
