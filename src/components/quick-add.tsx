'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
import { Input } from '@/components/ui/input'
import { PROJECTS } from '@/data/projects'
import { useTodoStore } from '@/store/todo-store'

export function QuickAdd() {
  const [open, setOpen] = useState(false)
  const [projectSlug, setProjectSlug] = useState('tango')
  const [rows, setRows] = useState<string[]>([''])
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])
  const { addTodo } = useTodoStore()

  // Focus the first input when dialog opens
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRefs.current[0]?.focus(), 100)
      return () => clearTimeout(t)
    }
  }, [open])

  const updateRow = useCallback((index: number, value: string) => {
    setRows(prev => {
      const next = [...prev]
      next[index] = value
      return next
    })
  }, [])

  const addRow = useCallback(() => {
    setRows(prev => [...prev, ''])
    // Focus new row after render
    setTimeout(() => {
      const last = inputRefs.current[inputRefs.current.length - 1]
      last?.focus()
    }, 50)
  }, [])

  const removeRow = useCallback((index: number) => {
    setRows(prev => {
      if (prev.length <= 1) return [''] // always keep at least one
      return prev.filter((_, i) => i !== index)
    })
  }, [])

  const handleSubmit = async () => {
    const items = rows.map(r => r.trim()).filter(Boolean)
    if (items.length === 0) return

    // Add all todos
    for (const item of items) {
      await addTodo(projectSlug, item)
    }

    // Reset and close
    setRows([''])
    setOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const current = rows[index]?.trim()
      if (current) {
        // If this is the last row, add a new one
        if (index === rows.length - 1) {
          addRow()
        } else {
          // Focus next row
          inputRefs.current[index + 1]?.focus()
        }
      } else if (rows.some(r => r.trim())) {
        // Empty row but has other content — submit all
        handleSubmit()
      }
    } else if (e.key === 'Backspace' && !rows[index] && rows.length > 1) {
      e.preventDefault()
      removeRow(index)
      // Focus previous row
      setTimeout(() => {
        const prev = Math.max(0, index - 1)
        inputRefs.current[prev]?.focus()
      }, 50)
    }
  }

  // Group projects: root projects, then sub-projects nested under parents
  const rootProjects = PROJECTS.filter(p => !p.parentSlug)

  const filledCount = rows.filter(r => r.trim()).length

  return (
    <>
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => setOpen(true)}
        className="shrink-0"
        aria-label="Quick add task"
      >
        <Plus className="size-4" />
      </Button>

      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setRows(['']) }}>
        <DialogContent className="sm:max-w-sm gap-3 p-4" showCloseButton={false}>
          <DialogHeader className="pb-0">
            <DialogTitle className="text-sm">Quick Add</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-3">
            {/* Project selector */}
            <Select value={projectSlug} onValueChange={setProjectSlug}>
              <SelectTrigger className="w-full h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {rootProjects.map(p => {
                  const subs = PROJECTS.filter(s => s.parentSlug === p.slug)
                  return [
                    <SelectItem key={p.slug} value={p.slug}>
                      <span className="flex items-center gap-2">
                        <span
                          className="inline-block size-2 rounded-full shrink-0"
                          style={{ backgroundColor: p.color }}
                        />
                        {p.emoji} {p.name}
                      </span>
                    </SelectItem>,
                    ...subs.map(s => (
                      <SelectItem key={s.slug} value={s.slug}>
                        <span className="flex items-center gap-2 pl-3">
                          <span
                            className="inline-block size-2 rounded-full shrink-0"
                            style={{ backgroundColor: s.color }}
                          />
                          {s.emoji} {s.name}
                        </span>
                      </SelectItem>
                    )),
                  ]
                })}
              </SelectContent>
            </Select>

            {/* Multi-row inputs */}
            <div className="flex flex-col gap-2">
              {rows.map((row, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    ref={el => { inputRefs.current[i] = el }}
                    placeholder={i === 0 ? 'What needs doing?' : 'Another one...'}
                    value={row}
                    onChange={e => updateRow(i, e.target.value)}
                    onKeyDown={e => handleKeyDown(e, i)}
                  />
                  {rows.length > 1 && (
                    <button
                      onClick={() => removeRow(i)}
                      className="text-muted-foreground hover:text-foreground shrink-0"
                    >
                      <X className="size-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add row + Submit */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={addRow}
                className="gap-1 text-muted-foreground"
              >
                <Plus className="size-3.5" />
                Add row
              </Button>
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={filledCount === 0}
              >
                Add{filledCount > 1 ? ` (${filledCount})` : ''}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
