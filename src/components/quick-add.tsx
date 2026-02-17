'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, Flame } from 'lucide-react'
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
import { PROJECTS, type Project } from '@/data/projects'
import { useTodoStore } from '@/store/todo-store'

export function QuickAdd() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [projectSlug, setProjectSlug] = useState('tango')
  const [focus, setFocus] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)
  const { addTodo, updateTodo, todos } = useTodoStore()

  // Focus the input when dialog opens
  useEffect(() => {
    if (open) {
      // Small delay for dialog animation
      const t = setTimeout(() => inputRef.current?.focus(), 100)
      return () => clearTimeout(t)
    }
  }, [open])

  const handleSubmit = async () => {
    const trimmed = title.trim()
    if (!trimmed) return

    await addTodo(projectSlug, trimmed)

    // If focus is on, tag the newly created todo
    if (focus) {
      // The new todo is the last one added for this project
      const latest = useTodoStore.getState().todos
        .filter(t => t.projectSlug === projectSlug && t.title === trimmed)
        .sort((a, b) => b.sortOrder - a.sortOrder)[0]
      if (latest) {
        await updateTodo(latest.id, { tags: [...latest.tags, 'focus'] })
      }
    }

    // Reset and close
    setTitle('')
    setOpen(false)
  }

  // Group projects: root projects, then sub-projects nested under parents
  const rootProjects = PROJECTS.filter(p => !p.parentSlug)

  return (
    <>
      <Button
        variant="outline"
        size="icon-sm"
        onClick={() => setOpen(true)}
        className="shrink-0 rounded-none"
        aria-label="Quick add task"
      >
        <Plus className="size-4" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
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

            {/* Title input */}
            <Input
              ref={inputRef}
              placeholder="What needs doing?"
              value={title}
              onChange={e => setTitle(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && title.trim()) {
                  e.preventDefault()
                  handleSubmit()
                }
              }}
            />

            {/* Focus toggle + submit */}
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setFocus(f => !f)}
                className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-colors ${
                  focus
                    ? 'bg-orange-500/20 text-orange-400'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Flame className="size-3.5" />
                Focus
              </button>

              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!title.trim()}
              >
                Add
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
