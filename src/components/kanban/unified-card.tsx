'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Flame, X, Trash2 } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { useTodoStore, type Todo } from '@/store/todo-store'
import { getProject } from '@/data/projects'

const SWIPE_THRESHOLD = 80 // px to trigger delete
const SWIPE_MAX = 100      // max travel

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

  // ── Swipe-to-delete state ───────────────────────────────────────
  const [swipeX, setSwipeX] = useState(0)
  const [swiping, setSwiping] = useState(false)
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null)
  const lockedAxisRef = useRef<'x' | 'y' | null>(null)

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (editing || overlay) return
    const touch = e.touches[0]
    touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: Date.now() }
    lockedAxisRef.current = null
  }, [editing, overlay])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current || editing) return
    const touch = e.touches[0]
    const dx = touch.clientX - touchStartRef.current.x
    const dy = touch.clientY - touchStartRef.current.y

    // Lock axis after 8px of movement
    if (!lockedAxisRef.current) {
      if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
        lockedAxisRef.current = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
      }
      return
    }

    if (lockedAxisRef.current !== 'x') return

    // Only swipe left (negative dx)
    const offset = Math.min(0, Math.max(-SWIPE_MAX, dx))
    if (offset < 0) {
      e.preventDefault() // prevent scroll while swiping horizontally
      setSwiping(true)
      setSwipeX(offset)
    }
  }, [editing])

  const handleTouchEnd = useCallback(() => {
    if (!swiping) {
      touchStartRef.current = null
      lockedAxisRef.current = null
      return
    }

    if (Math.abs(swipeX) >= SWIPE_THRESHOLD) {
      deleteTodo(todo.id)
    } else {
      setSwipeX(0)
    }
    setSwiping(false)
    touchStartRef.current = null
    lockedAxisRef.current = null
  }, [swiping, swipeX, deleteTodo, todo.id])

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

  const isPastThreshold = Math.abs(swipeX) >= SWIPE_THRESHOLD

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Delete backdrop — revealed on swipe */}
      {swipeX < 0 && (
        <div
          className={`absolute inset-0 flex items-center justify-end px-5 rounded-lg transition-colors ${
            isPastThreshold ? 'bg-red-600' : 'bg-red-600/60'
          }`}
        >
          <Trash2 className={`size-5 text-white transition-transform ${
            isPastThreshold ? 'scale-125' : 'scale-100'
          }`} />
        </div>
      )}

      <div
        ref={overlay ? undefined : setNodeRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{
          ...style,
          borderLeftColor: accentColor,
          backgroundColor: isFocused ? hexMix(accentColor, 0.35) : hexMix(accentColor, 0.06),
          transform: [
            style?.transform,
            swipeX ? `translateX(${swipeX}px)` : undefined,
          ].filter(Boolean).join(' ') || undefined,
          transition: swiping ? 'none' : (style?.transition ?? 'transform 200ms ease-out'),
        }}
        className={`group relative rounded-lg border ${
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

          {/* Delete (desktop hover) */}
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
    </div>
  )
}
