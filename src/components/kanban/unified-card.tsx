'use client'

import { useState, useRef, useEffect } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Flame, X } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { useTodoStore, type Todo } from '@/store/todo-store'
import { getProject } from '@/data/projects'

interface UnifiedCardProps {
  todo: Todo
  overlay?: boolean
}

export function UnifiedCard({ todo, overlay }: UnifiedCardProps) {
  const { toggleTodo, toggleFocus, updateTodo, deleteTodo } = useTodoStore()
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(todo.title)
  const inputRef = useRef<HTMLInputElement>(null)
  const project = getProject(todo.projectSlug)

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  const handleSave = () => {
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== todo.title) {
      updateTodo(todo.id, { title: trimmed })
    } else {
      setEditValue(todo.title)
    }
    setEditing(false)
  }

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: todo.id,
    data: { type: 'card', todo },
    disabled: overlay || editing,
  })

  const style = overlay ? undefined : {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const accentColor = project?.color ?? '#666'
  const isFocused = todo.tags?.includes('focus')

  // Mix accent color with dark card background (#1a1a1f ≈ oklch(0.21 0.006 285))
  // Using hex math instead of color-mix for SSR compatibility
  function hexMix(hex: string, pct: number): string {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    const br = 0x1a, bg = 0x1a, bb = 0x1f // --card base
    const mr = Math.round(r * pct + br * (1 - pct))
    const mg = Math.round(g * pct + bg * (1 - pct))
    const mb = Math.round(b * pct + bb * (1 - pct))
    return `#${mr.toString(16).padStart(2,'0')}${mg.toString(16).padStart(2,'0')}${mb.toString(16).padStart(2,'0')}`
  }

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      style={{
        ...style,
        borderLeftColor: accentColor,
        backgroundColor: isFocused ? hexMix(accentColor, 0.35) : hexMix(accentColor, 0.06),
      }}
      className={`group rounded-lg border ${
        isFocused ? 'border-l-[5px] border-border' : 'border-l-[3px] border-border'
      } p-3 shadow-sm ${isDragging ? 'opacity-30' : ''} ${
        overlay ? 'shadow-lg ring-1 ring-foreground/10 rotate-[2deg]' : ''
      }`}
    >
      <div className="flex items-start gap-2">
        {/* Drag handle */}
        <button
          {...(overlay ? {} : { ...attributes, ...listeners })}
          className="mt-0.5 shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground touch-none"
        >
          <GripVertical className="size-3.5" />
        </button>

        {/* Checkbox */}
        <Checkbox
          checked={todo.completed}
          onCheckedChange={() => toggleTodo(todo.id)}
          className="mt-0.5 shrink-0"
        />

        {/* Title */}
        {editing ? (
          <input
            ref={inputRef}
            value={editValue}
            onChange={e => setEditValue(e.target.value)}
            onBlur={handleSave}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSave()
              if (e.key === 'Escape') { setEditValue(todo.title); setEditing(false) }
            }}
            className="text-sm flex-1 leading-tight bg-transparent border-b border-foreground/20 outline-none py-0"
          />
        ) : (
          <span
            onDoubleClick={() => !overlay && setEditing(true)}
            className={`text-sm flex-1 leading-tight cursor-text ${
              todo.completed
                ? 'line-through text-muted-foreground/50'
                : isFocused
                  ? 'text-foreground font-semibold'
                  : ''
            }`}
          >
            {todo.title}
          </span>
        )}

        {/* Focus toggle */}
        <button
          onClick={() => toggleFocus(todo.id)}
          className={`shrink-0 transition-opacity ${
            isFocused
              ? 'text-orange-400 opacity-100'
              : 'opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-orange-400'
          }`}
          title={isFocused ? 'Remove focus' : 'Focus today'}
        >
          <Flame className="size-4" />
        </button>

        {/* Delete */}
        <button
          onClick={() => deleteTodo(todo.id)}
          className="shrink-0 opacity-0 group-hover:opacity-60 hover:opacity-100 text-muted-foreground hover:text-red-400 transition-opacity"
          title="Delete"
        >
          <X className="size-3.5" />
        </button>
      </div>

      {/* Project label — small, subtle, uses project color */}
      {project && (
        <div className="mt-1.5 ml-[22px]">
          <span
            className="text-[10px] font-medium uppercase tracking-wider"
            style={{ color: accentColor, opacity: 0.7 }}
          >
            {project.emoji} {project.name}
          </span>
        </div>
      )}
    </div>
  )
}
