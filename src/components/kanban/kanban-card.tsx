'use client'

import { useState, useRef, useEffect } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Trash2, ChevronUp, ChevronDown, Plus } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { ProjectBadge } from '@/components/project-badge'
import { useTodoStore, type Todo } from '@/store/todo-store'

interface KanbanCardProps {
  todo: Todo
  subTasks?: Todo[]       // sub-tasks to render nested
  showProject?: boolean
  overlay?: boolean  // true when rendered inside DragOverlay
  onMoveUp?: () => void
  onMoveDown?: () => void
}

export function KanbanCard({ todo, subTasks, showProject, overlay, onMoveUp, onMoveDown }: KanbanCardProps) {
  const { toggleTodo, toggleFocus, deleteTodo, updateTodo, addTodo } = useTodoStore()
  const isFocused = todo.tags?.includes('focus')
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(todo.title)
  const [addingChild, setAddingChild] = useState(false)
  const [childValue, setChildValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const childInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  useEffect(() => {
    if (addingChild) {
      childInputRef.current?.focus()
    }
  }, [addingChild])

  const handleSave = () => {
    const trimmed = editValue.trim()
    if (trimmed && trimmed !== todo.title) {
      updateTodo(todo.id, { title: trimmed })
    } else {
      setEditValue(todo.title)
    }
    setEditing(false)
  }

  const handleAddChild = () => {
    const trimmed = childValue.trim()
    if (trimmed) {
      addTodo(todo.projectSlug, trimmed, todo.status, todo.id)
      setChildValue('')
    }
    setAddingChild(false)
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

  const isChild = !!todo.parentId

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      style={style}
      className={`group rounded-lg border border-border bg-card shadow-sm ${
        isChild ? 'p-2 ml-4 border-l-2 border-l-muted-foreground/20' : 'p-3'
      } ${isDragging ? 'opacity-30' : ''} ${
        overlay ? 'shadow-lg ring-1 ring-foreground/10 rotate-[2deg]' : ''
      }`}
    >
      <div className="flex items-start gap-2">
        {/* Drag handle (desktop) */}
        <button
          {...(overlay ? {} : { ...attributes, ...listeners })}
          className="mt-0.5 shrink-0 cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground touch-none hidden sm:block"
        >
          <GripVertical className={isChild ? 'size-3' : 'size-3.5'} />
        </button>

        {/* Checkbox */}
        <Checkbox
          checked={todo.completed}
          onCheckedChange={() => toggleTodo(todo.id)}
          className="mt-0.5 shrink-0"
        />

        {/* Title — double-click on desktop, tap on mobile */}
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
            className={`flex-1 leading-tight bg-transparent border-b border-foreground/20 outline-none py-0 ${isChild ? 'text-xs' : 'text-sm'}`}
          />
        ) : (
          <span
            onDoubleClick={() => !overlay && setEditing(true)}
            onClick={() => {
              if (!overlay && 'ontouchstart' in window) setEditing(true)
            }}
            className={`flex-1 leading-tight cursor-text ${isChild ? 'text-xs' : 'text-sm'} ${
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
          className={`shrink-0 transition-opacity text-sm leading-none ${
            isFocused
              ? 'text-orange-400 opacity-100 font-black'
              : 'opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-orange-400 font-black'
          }`}
          title={isFocused ? 'Remove focus' : 'Focus today'}
        >
          !
        </button>

        {/* Add sub-task (only on parent-level cards) */}
        {!isChild && !overlay && (
          <button
            onClick={() => setAddingChild(true)}
            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground"
            title="Add sub-task"
          >
            <Plus className="size-3" />
          </button>
        )}

        {/* Reorder arrows */}
        {(onMoveUp || onMoveDown) && (
          <div className="flex flex-col shrink-0">
            <button
              onClick={onMoveUp}
              disabled={!onMoveUp}
              className={`text-muted-foreground/50 ${onMoveUp ? 'hover:text-foreground active:text-foreground' : 'opacity-20'}`}
            >
              <ChevronUp className="size-3.5" />
            </button>
            <button
              onClick={onMoveDown}
              disabled={!onMoveDown}
              className={`text-muted-foreground/50 ${onMoveDown ? 'hover:text-foreground active:text-foreground' : 'opacity-20'}`}
            >
              <ChevronDown className="size-3.5" />
            </button>
          </div>
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

      {/* Nested sub-tasks */}
      {subTasks && subTasks.length > 0 && (
        <div className="mt-2 space-y-1.5">
          {subTasks.map(child => (
            <KanbanCard key={child.id} todo={child} showProject={false} />
          ))}
        </div>
      )}

      {/* Add sub-task input */}
      {addingChild && (
        <div className="mt-2 ml-4 rounded border border-border bg-accent/20 p-1.5">
          <input
            ref={childInputRef}
            value={childValue}
            onChange={e => setChildValue(e.target.value)}
            onBlur={handleAddChild}
            onKeyDown={e => {
              if (e.key === 'Enter') handleAddChild()
              if (e.key === 'Escape') { setChildValue(''); setAddingChild(false) }
            }}
            placeholder="Sub-task..."
            className="w-full text-xs bg-transparent outline-none placeholder:text-muted-foreground/40"
          />
        </div>
      )}
    </div>
  )
}
