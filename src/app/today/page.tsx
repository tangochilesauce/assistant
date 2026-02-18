'use client'

import { useEffect } from 'react'
import { PageHeader } from '@/components/layout/page-header'
import { UnifiedBoard } from '@/components/kanban/unified-board'
import { DeadlinesSidebar } from '@/components/deadlines-sidebar'
import { SprintBanner } from '@/components/sprint-banner'
import { ThisWeek } from '@/components/this-week'
import { QuickAdd } from '@/components/quick-add'
import { QuickSpend } from '@/components/quick-spend'
import { useTodoStore } from '@/store/todo-store'

export default function TodayPage() {
  const { todos, fetchTodos, initialized } = useTodoStore()

  useEffect(() => {
    fetchTodos()
  }, [fetchTodos])

  const incomplete = todos.filter(t => !t.completed).length

  return (
    <>
      <PageHeader title="Today" count={incomplete}>
        <QuickSpend />
        <QuickAdd />
      </PageHeader>
      <div className="flex-1 overflow-y-auto">
        {!initialized ? (
          <div className="px-4 py-8 text-center text-sm text-muted-foreground">Loading...</div>
        ) : (
          <>
          <SprintBanner />
          <ThisWeek />
          <div className="px-4 sm:px-6 py-4 flex gap-6">
            <div className="flex-1 min-w-0">
              <UnifiedBoard />
            </div>
            <DeadlinesSidebar />
          </div>
          </>
        )}
      </div>
    </>
  )
}
