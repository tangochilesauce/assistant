'use client'

import { useState, useRef, useEffect } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2 } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { useTodoStore, type Todo } from '@/store/todo-store'
import { getProject } from '@/data/projects'

interface UnifiedCardProps {
  todo: Todo
  overlay?: boolean
}

export function UnifiedCard({ todo, overlay }: UnifiedCardProps) {
  const { toggleTodo, deleteTodo, updateTodo } = useTodoStore()
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

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      style={{
        ...style,
        borderLeftColor: accentColor,
      }}
      className={`group rounded-lg border border-border border-l-[3px] bg-card p-3 shadow-sm ${
        isDragging ? 'opacity-30' : ''
      } ${overlay ? 'shadow-lg ring-1 ring-foreground/10 rotate-[2deg]' : ''}`}
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
              todo.completed ? 'line-through text-muted-foreground/50' : ''
            }`}
          >
            {todo.title}
          </span>
        )}

        {/* Delete */}
        <button
          onClick={() => deleteTodo(todo.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-400 shrink-0"
        >
          <Trash2 className="size-3" />
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
