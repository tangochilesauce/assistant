'use client'

import { DndContextProvider } from './dnd-context-provider'
import { KanbanColumn } from './kanban-column'
import { useTodoStore } from '@/store/todo-store'
import { getColumns, type KanbanColumn as ColumnType } from '@/data/projects'

interface KanbanBoardProps {
  projectSlug: string
  showProject?: boolean  // show project badge on cards (for global board)
  className?: string
}

export function KanbanBoard({ projectSlug, showProject, className }: KanbanBoardProps) {
  const { todos } = useTodoStore()
  const columns = getColumns(projectSlug)

  // Filter todos for this project
  const projectTodos = todos.filter(t => t.projectSlug === projectSlug)

  return (
    <DndContextProvider projectSlug={projectSlug}>
      <div className={`flex gap-3 overflow-x-auto pb-4 ${className ?? ''}`}>
        {columns.map(column => {
          const columnTodos = projectTodos
            .filter(t => t.status === column.id)
            .sort((a, b) => a.sortOrder - b.sortOrder)

          return (
            <KanbanColumn
              key={column.id}
              column={column}
              todos={columnTodos}
              projectSlug={projectSlug}
              showProject={showProject}
            />
          )
        })}
      </div>
    </DndContextProvider>
  )
}
