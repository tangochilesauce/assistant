'use client'

import { useEffect } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { UnifiedBoard } from '@/components/kanban/unified-board'
import { useTodoStore } from '@/store/todo-store'

export default function TodayPage() {
  const { todos, fetchTodos, initialized } = useTodoStore()

  useEffect(() => {
    fetchTodos()
  }, [fetchTodos])

  const incomplete = todos.filter(t => !t.completed).length

  return (
    <>
      <PageHeader title="Today" count={incomplete} />
      <div className="flex-1 overflow-y-auto">
        {!initialized ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">Loading...</div>
        ) : (
          <div className="px-4 sm:px-6 py-4">
            <UnifiedBoard />
          </div>
        )}
      </div>
    </>
  )
}
