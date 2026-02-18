'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Plus } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { ProjectBadge } from '@/components/project-badge'
import { useTodoStore, type Todo } from '@/store/todo-store'

interface ActionLineProps {
  todo: Todo
  subTasks?: Todo[]
  showProject?: boolean
  isChild?: boolean
}

export function ActionLine({ todo, subTasks, showProject = false, isChild = false }: ActionLineProps) {
  const { toggleTodo, deleteTodo, updateTodo, addTodo } = useTodoStore()
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

  return (
    <>
      <div className={`group flex items-center gap-3 hover:bg-accent/50 transition-colors border-b border-border/50 last:border-b-0 ${
        isChild ? 'pl-10 pr-4 py-1.5' : 'px-4 py-2.5'
      }`}>
        <Checkbox
          checked={todo.completed}
          onCheckedChange={() => toggleTodo(todo.id)}
          className="shrink-0"
        />
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
            className={`flex-1 bg-transparent border-b border-foreground/20 outline-none py-0 ${isChild ? 'text-xs' : 'text-sm'}`}
          />
        ) : (
          <span
            onDoubleClick={() => setEditing(true)}
            onClick={() => {
              if ('ontouchstart' in window) setEditing(true)
            }}
            className={`flex-1 cursor-text ${isChild ? 'text-xs' : 'text-sm'} ${
              todo.completed ? 'line-through text-muted-foreground' : ''
            }`}
          >
            {todo.title}
          </span>
        )}
        {showProject && <ProjectBadge slug={todo.projectSlug} />}
        {todo.dueDate && (
          <span className="text-xs text-muted-foreground">{todo.dueDate}</span>
        )}
        {/* Add sub-task button (parent items only) */}
        {!isChild && (
          <button
            onClick={() => setAddingChild(true)}
            className="shrink-0 text-muted-foreground/30 hover:text-foreground transition-colors"
            title="Add sub-task"
          >
            <Plus className="size-3" />
          </button>
        )}
        <button
          onClick={() => deleteTodo(todo.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive shrink-0"
        >
          <X className="size-3.5" />
        </button>
      </div>

      {/* Sub-tasks */}
      {subTasks && subTasks.length > 0 && (
        subTasks.map(child => (
          <ActionLine key={child.id} todo={child} isChild />
        ))
      )}

      {/* Add sub-task inline input */}
      {addingChild && (
        <div className="pl-10 pr-4 py-1.5 border-b border-border/50">
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
    </>
  )
}
