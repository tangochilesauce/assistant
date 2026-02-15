'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { KanbanCard } from './kanban-card'
import type { KanbanColumn as ColumnType } from '@/data/projects'
import type { Todo } from '@/store/todo-store'

interface KanbanColumnProps {
  column: ColumnType
  todos: Todo[]
  showProject?: boolean
}

export function KanbanColumn({ column, todos, showProject }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
    data: { type: 'column', columnId: column.id },
  })

  const todoIds = todos.map(t => t.id)

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
          {todos.length === 0 ? (
            <div className="flex items-center justify-center h-[60px] text-[10px] text-muted-foreground/40">
              Drop here
            </div>
          ) : (
            todos.map(todo => (
              <KanbanCard key={todo.id} todo={todo} showProject={showProject} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  )
}
