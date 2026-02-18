'use client'

import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { KanbanCard } from './kanban-card'
import { useTodoStore, type Todo } from '@/store/todo-store'
import type { KanbanColumn as ColumnType } from '@/data/projects'

interface KanbanColumnProps {
  column: ColumnType
  todos: Todo[]
  projectSlug: string
  showProject?: boolean
}

export function KanbanColumn({ column, todos, projectSlug, showProject }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
    data: { type: 'column', columnId: column.id },
  })
  const { addTodo, reorderTodo } = useTodoStore()

  // Separate parents and children
  const parentTodos = todos.filter(t => !t.parentId)
  const childMap = new Map<string, Todo[]>()
  for (const t of todos) {
    if (t.parentId) {
      const arr = childMap.get(t.parentId) ?? []
      arr.push(t)
      childMap.set(t.parentId, arr)
    }
  }

  // Swap two adjacent parent todos by exchanging their sort orders
  const swapTodos = (indexA: number, indexB: number) => {
    const a = parentTodos[indexA]
    const b = parentTodos[indexB]
    if (!a || !b) return
    reorderTodo(a.id, b.sortOrder)
    reorderTodo(b.id, a.sortOrder)
  }
  const [adding, setAdding] = useState(false)
  const [addValue, setAddValue] = useState('')

  const todoIds = todos.map(t => t.id)

  const handleAdd = () => {
    const trimmed = addValue.trim()
    if (trimmed) {
      addTodo(projectSlug, trimmed, column.id)
      setAddValue('')
    }
    setAdding(false)
  }

  return (
    <div className="flex flex-col min-w-[260px] max-w-[300px] shrink-0">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 mb-2">
        {column.color ? (
          <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: column.color }} />
        ) : (
          <div className="w-2 h-2 rounded-full shrink-0 bg-muted-foreground/30" />
        )}
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground truncate">
          {column.label}
        </span>
        <span className="text-[10px] text-muted-foreground/60 tabular-nums ml-auto shrink-0">
          {todos.length}
        </span>
      </div>

      {/* Cards area */}
      <SortableContext items={todoIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`flex-1 rounded-lg p-1.5 space-y-2 min-h-[80px] transition-colors ${
            isOver ? 'bg-accent/40 ring-1 ring-accent' : 'bg-accent/10'
          }`}
        >
          {parentTodos.length === 0 && !adding ? (
            <div className="flex items-center justify-center h-[60px] text-[10px] text-muted-foreground/40">
              Drop here
            </div>
          ) : (
            parentTodos.map((todo, i) => (
              <KanbanCard
                key={todo.id}
                todo={todo}
                subTasks={childMap.get(todo.id)}
                showProject={showProject}
                onMoveUp={i > 0 ? () => swapTodos(i, i - 1) : undefined}
                onMoveDown={i < parentTodos.length - 1 ? () => swapTodos(i, i + 1) : undefined}
              />
            ))
          )}

          {/* Quick-add input */}
          {adding ? (
            <div className="rounded-lg border border-border bg-card p-2">
              <input
                value={addValue}
                onChange={e => setAddValue(e.target.value)}
                onBlur={handleAdd}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleAdd()
                  if (e.key === 'Escape') { setAddValue(''); setAdding(false) }
                }}
                placeholder="What needs done?"
                className="w-full text-sm bg-transparent outline-none placeholder:text-muted-foreground/40"
                autoFocus
              />
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="flex items-center gap-1.5 w-full px-2 py-1.5 text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors rounded"
            >
              <Plus className="size-3" />
              Add
            </button>
          )}
        </div>
      </SortableContext>
    </div>
  )
}
