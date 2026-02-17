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
  type DragOverEvent,
} from '@dnd-kit/core'
import { KanbanCard } from './kanban-card'
import { useTodoStore, type Todo } from '@/store/todo-store'

interface DndContextProviderProps {
  children: React.ReactNode
  projectSlug: string  // restrict drags within this project
}

export function DndContextProvider({ children, projectSlug }: DndContextProviderProps) {
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
    const { active } = event
    const todo = active.data.current?.todo as Todo | undefined
    if (todo) setActiveTodo(todo)
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    setActiveTodo(null)

    if (!over) return

    const activeTodo = active.data.current?.todo as Todo | undefined
    if (!activeTodo) return

    // Determine target column
    let targetColumnId: string
    if (over.data.current?.type === 'column') {
      targetColumnId = over.data.current.columnId as string
    } else if (over.data.current?.type === 'card') {
      const overTodo = over.data.current.todo as Todo
      targetColumnId = overTodo.status
    } else {
      return
    }

    // Get all todos in the target column, sorted
    const targetTodos = todos
      .filter(t => t.projectSlug === projectSlug && t.status === targetColumnId && t.id !== activeTodo.id)
      .sort((a, b) => a.sortOrder - b.sortOrder)

    // Calculate new sort order
    let newSortOrder: number

    if (over.data.current?.type === 'card') {
      // Dropped on a specific card — insert before/after it
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
      // Dropped on the column itself — append to end
      newSortOrder = targetTodos.length > 0
        ? targetTodos[targetTodos.length - 1].sortOrder + 1
        : 0
    }

    if (targetColumnId !== activeTodo.status) {
      // Cross-column move
      moveTodo(activeTodo.id, targetColumnId, newSortOrder)
    } else {
      // Same column reorder
      reorderTodo(activeTodo.id, newSortOrder)
    }
  }, [todos, projectSlug, moveTodo, reorderTodo])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
      <DragOverlay dropAnimation={null}>
        {activeTodo ? (
          <KanbanCard todo={activeTodo} showProject={false} overlay />
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
