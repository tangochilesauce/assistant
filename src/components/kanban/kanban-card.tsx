'use client'

import { useState, useRef, useEffect } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2 } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { ProjectBadge } from '@/components/project-badge'
import { useTodoStore, type Todo } from '@/store/todo-store'

interface KanbanCardProps {
  todo: Todo
  showProject?: boolean
  overlay?: boolean  // true when rendered inside DragOverlay
}

export function KanbanCard({ todo, showProject, overlay }: KanbanCardProps) {
  const { toggleTodo, deleteTodo, updateTodo } = useTodoStore()
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(todo.title)
  const inputRef = useRef<HTMLInputElement>(null)

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

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      style={style}
      className={`group rounded-lg border border-border bg-card p-3 shadow-sm ${
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

        {/* Title — editable on double-click */}
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

      {/* Meta row */}
      {(showProject || todo.dueDate) && (
        <div className="flex items-center gap-2 mt-2 ml-[22px]">
          {showProject && <ProjectBadge slug={todo.projectSlug} />}
          {todo.dueDate && (
            <span className="text-[10px] text-muted-foreground tabular-nums">
              {todo.dueDate}
            </span>
          )}
        </div>
      )}
    </div>
  )
}
