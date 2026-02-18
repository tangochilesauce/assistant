'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useDroppable } from '@dnd-kit/core'
import { UnifiedCard } from './unified-card'
import { useTodoStore, type Todo } from '@/store/todo-store'
import { UNIFIED_COLUMNS, PROJECTS, toUnifiedStatus, type KanbanColumn } from '@/data/projects'

// ── Column ───────────────────────────────────────────────────────

function UnifiedColumn({ column, todos }: { column: KanbanColumn; todos: Todo[] }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `unified-${column.id}`,
    data: { type: 'column', columnId: column.id },
  })

  // Separate parents from children
  const parentTodos = todos.filter(t => !t.parentId)
  const childMap = new Map<string, Todo[]>()
  for (const t of todos) {
    if (t.parentId) {
      const arr = childMap.get(t.parentId) ?? []
      arr.push(t)
      childMap.set(t.parentId, arr)
    }
  }

  const todoIds = parentTodos.map(t => t.id)
  const isDone = column.id === 'done'

  return (
    <div className="flex flex-col min-w-[260px] flex-1">
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2.5 mb-2">
        <div className="w-2 h-2 rounded-full shrink-0 bg-muted-foreground/30" />
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground truncate">
          {column.label}
        </span>
        <span className="text-[10px] text-muted-foreground/60 tabular-nums ml-auto shrink-0">
          {parentTodos.length}
        </span>
      </div>

      {/* Cards */}
      <SortableContext items={todoIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`flex-1 rounded-lg p-1.5 space-y-2 min-h-[80px] transition-colors ${
            isOver ? 'bg-accent/40 ring-1 ring-accent' : 'bg-accent/10'
          }`}
        >
          {parentTodos.length === 0 ? (
            <div className="flex items-center justify-center h-[60px] text-[10px] text-muted-foreground/40">
              {isDone ? 'Done' : 'Drop here'}
            </div>
          ) : (
            parentTodos.map(todo => (
              <UnifiedCard key={todo.id} todo={todo} subTasks={childMap.get(todo.id)} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  )
}

// ── Board ────────────────────────────────────────────────────────

export function UnifiedBoard() {
  const { todos, moveTodo, reorderTodo } = useTodoStore()
  const [activeTodo, setActiveTodo] = useState<Todo | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 5 },
    }),
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const todo = event.active.data.current?.todo as Todo | undefined
    if (todo) setActiveTodo(todo)
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    setActiveTodo(null)

    if (!over) return

    const draggedTodo = active.data.current?.todo as Todo | undefined
    if (!draggedTodo) return

    // Determine target column
    let targetColumnId: string
    if (over.data.current?.type === 'column') {
      targetColumnId = over.data.current.columnId as string
    } else if (over.data.current?.type === 'card') {
      const overTodo = over.data.current.todo as Todo
      targetColumnId = toUnifiedStatus(overTodo.status)
    } else {
      return
    }

    // Get all todos in target unified column (excluding the dragged one)
    const targetTodos = todos
      .filter(t => toUnifiedStatus(t.status) === targetColumnId && t.id !== draggedTodo.id)
      .sort((a, b) => a.sortOrder - b.sortOrder)

    // Calculate new sort order
    let newSortOrder: number
    if (over.data.current?.type === 'card') {
      const overTodo = over.data.current.todo as Todo
      const overIndex = targetTodos.findIndex(t => t.id === overTodo.id)
      if (overIndex === 0) {
        newSortOrder = targetTodos[0].sortOrder - 1
      } else if (overIndex >= 0) {
        const before = targetTodos[overIndex - 1].sortOrder
        const at = targetTodos[overIndex].sortOrder
        newSortOrder = (before + at) / 2
      } else {
        newSortOrder = targetTodos.length > 0
          ? targetTodos[targetTodos.length - 1].sortOrder + 1
          : 0
      }
    } else {
      newSortOrder = targetTodos.length > 0
        ? targetTodos[targetTodos.length - 1].sortOrder + 1
        : 0
    }

    const currentUnified = toUnifiedStatus(draggedTodo.status)
    if (targetColumnId !== currentUnified) {
      moveTodo(draggedTodo.id, targetColumnId, newSortOrder)
    } else {
      reorderTodo(draggedTodo.id, newSortOrder)
    }
  }, [todos, moveTodo, reorderTodo])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-3 overflow-x-auto pb-4">
        {UNIFIED_COLUMNS.map(column => {
          const projectMap = Object.fromEntries(PROJECTS.map(p => [p.slug, p]))

          // Max weight per color group so all same-color projects batch together
          const colorMaxWeight: Record<string, number> = {}
          for (const p of PROJECTS) {
            const c = p.color ?? ''
            colorMaxWeight[c] = Math.max(colorMaxWeight[c] ?? 0, p.weight)
          }

          const columnTodos = todos
            .filter(t => toUnifiedStatus(t.status) === column.id)
            .sort((a, b) => {
              const pA = projectMap[a.projectSlug]
              const pB = projectMap[b.projectSlug]
              // 1. Focused items always at the top
              const fA = a.tags?.includes('focus') ? 1 : 0
              const fB = b.tags?.includes('focus') ? 1 : 0
              if (fA !== fB) return fB - fA
              // 2. Color group (higher max-weight color batch first, tie-break by color)
              const cA = pA?.color ?? ''
              const cB = pB?.color ?? ''
              if (cA !== cB) {
                const wDiff = (colorMaxWeight[cB] ?? 0) - (colorMaxWeight[cA] ?? 0)
                return wDiff !== 0 ? wDiff : cA.localeCompare(cB)
              }
              // 3. Group by project (never interleave)
              if (a.projectSlug !== b.projectSlug) return a.projectSlug.localeCompare(b.projectSlug)
              // 4. Sort order
              return a.sortOrder - b.sortOrder
            })

          return (
            <UnifiedColumn
              key={column.id}
              column={column}
              todos={columnTodos}
            />
          )
        })}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTodo ? <UnifiedCard todo={activeTodo} overlay /> : null}
      </DragOverlay>
    </DndContext>
  )
}
